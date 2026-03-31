import { Context, Random, Service } from "koishi";
import { DateTime } from "luxon";
import { RankBracket } from "../../@types/graphql-generated";
import { RANK_BRACKETS } from "../common/constants";
import { clamp } from "../common/utils";
import { WeeklyHeroMeta, HeroMeta } from "../data/types";

export class HeroService extends Service {
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.hero", true);
  }

  public async getWeeklyHeroMeta(rank: number) {
    /** 选取率门槛 */
    const MINIMUM_PICK_RATE = 0.02;
    /** 推荐数量 */
    const RECOMMENDATION_COUNT = 3;

    const tier = clamp(Math.floor(rank / 10), 2, 7);
    const targetTiers = [tier - 1, tier, tier + 1];

    const rankBrackets = [];
    for (let i = tier - 1; i <= tier + 3; i++) rankBrackets.push(RANK_BRACKETS[i]);
    const weeklyHeroMeta = await this._getMetaData(rankBrackets);
    const recommendation = {} as WeeklyHeroMeta;
    for (let postr in weeklyHeroMeta) {
      const pos: HeroMeta[] = weeklyHeroMeta[postr];
      recommendation[postr] = pos
        .filter((hero) => hero.pickRate > MINIMUM_PICK_RATE)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, RECOMMENDATION_COUNT);
    }
    return { recommendation, targetTiers };
  }

  private async _getMetaData(rankBrackets: string[]) {
    const dateStr = DateTime.utc().toFormat("yyyy-MM-dd");
    const cacheKey = `${dateStr}_${rankBrackets.join("-")}`;
    const metaCache = await this.ctx.dota2tracker.cache.getWeeklyMetaCache(cacheKey);
    if (metaCache) return metaCache;
    const result = await this.ctx.dota2tracker.stratzAPI.queryGetWeeklyMetaByPosition({ bracketIds: rankBrackets as RankBracket[] });
    const weeklyHeroMeta = result.heroStats as WeeklyHeroMeta;
    for (const postr in weeklyHeroMeta) {
      const pos: HeroMeta[] = weeklyHeroMeta[postr];
      const totalCount = pos.reduce((acc, cur) => acc + cur.matchCount, 0) / 2;
      pos.forEach((hero) => {
        hero.pickRate = totalCount > 0 ? hero.matchCount / totalCount : 0;
        hero.winRate = hero.matchCount > 0 ? hero.winCount / hero.matchCount : 0;
      });
    }
    this.ctx.dota2tracker.cache.setWweeklyMetaCache(cacheKey, weeklyHeroMeta);
    return weeklyHeroMeta;
  }

  async getHeroDetails(input: any, languageTag: string, isRandom: boolean = false) {
    const heroId = this.ctx.dota2tracker.i18n.findHeroIdInLocale(isRandom ? Random.pick(Object.keys(this.ctx.dota2tracker.dotaconstants.heroes)) : input);
    if (!heroId) return;
    return HeroService.formatHeroDetails(await this.ctx.dota2tracker.valveAPI.queryHeroDetailsFromValve(heroId, languageTag));
  }

  public static formatHeroDetails(rawHero: any) {
    const hero = Object.assign({}, rawHero);

    // 1. 遍历并格式化每个技能（以及 A杖 / 魔晶加成）的说明和备注
    hero.abilities.forEach((ab: any) => {
      ab.desc_loc = this.formatHeroDesc(ab.desc_loc, ab.special_values);
      ab.notes_loc = ab.notes_loc.map((note: string) => this.formatHeroDesc(note, ab.special_values));
      
      if (ab.ability_has_scepter) ab.scepter_loc = this.formatHeroDesc(ab.scepter_loc, ab.special_values, HeroDescType.Scepter);
      if (ab.ability_has_shard) ab.shard_loc = this.formatHeroDesc(ab.shard_loc, ab.special_values, HeroDescType.Shard);
    });

    // 2. 遍历并处理天赋文案中的占位符（例如 "{s:bonus_X}" 或 "{s:value}"）
    hero.talents.forEach((talent: any) => {
      talent.name_loc = talent.name_loc.replace(/\{s:(.*?)\}/g, (match: string, specialValueName: string) => {
        // 第一优先级：尝试直接从天赋自身的 special_values 取值（常用于 {s:value}）
        const target = talent.special_values?.find((sv: any) => sv.name === specialValueName);
        if (target) return target.values_float.join("/");

        // 第二优先级：前往英雄技能中，查找该天赋对某个技能的属性加成
        // 比如占位符是 specialValueName = "bonus_AbilityChannelTime"
        const cleanVarName = specialValueName.replace(/^bonus_/, ""); 
        
        for (const ability of hero.abilities) {
          // 查找该技能中是否有某个特殊项，其 bonuses 数组里包含了这个天赋
          const svWithBonus = ability.special_values.find((sv: any) => 
            (sv.name === cleanVarName || sv.name === specialValueName) && 
            sv.bonuses.some((bonus: any) => bonus.name === talent.name)
          );
          
          if (svWithBonus) {
            const bonusObj = svWithBonus.bonuses.find((bonus: any) => bonus.name === talent.name);
            if (bonusObj && bonusObj.value !== undefined) {
              return bonusObj.value; 
            }
          }
        }

        // 没找到任何相关加成数值时，返回 ? 防止将原生的占位符代码渲染到前端界面
        return "?";
      });
    });

    return hero;
  }

  private static formatHeroDesc(template: string, special_values: any[], type: HeroDescType = HeroDescType.Normal): string {
    if (!template) return template;
    
    // 匹配类似 %value%、%% 或 {s:value} 的占位符
    return template.replace(/%%|%([^%]+)%|\{([^}]+)\}/g, (match, p1, p2) => {
      if (match === "%%") return "%";

      const field = p1 || p2;
      
      // 预处理变量名：去除可能有干扰的前缀、后缀，然后转小写
      const fieldName = field.replace(/^s:/, "").replace(/^shard_/, "").toLowerCase();
      const strippedFieldName = fieldName.replace(/_tooltip$/, "");

      // 在当前技能的 special_values 中查找对应的数值定义
      const specialValue = special_values.find((sv) => {
        const nameLower = sv.name.toLowerCase();
        const strippedNameLower = nameLower.replace(/_tooltip$/, "");
        
        // 匹配字段名，忽略 "bonus_"、"shard_"、"_tooltip" 的有无，以及潜在的 Ability 前缀映射
        // 目的是为了处理 Valve API 中杂乱无章、首尾多变的命名规范
        return nameLower === fieldName || 
               nameLower === `bonus_${fieldName}` || 
               nameLower === `shard_${fieldName}` || 
               `bonus_${nameLower}` === fieldName || 
               `shard_${nameLower}` === fieldName ||
               strippedNameLower === strippedFieldName ||
               nameLower === `ability${strippedFieldName}`;
      });

      // 找到了相应的特殊数值配置
      if (specialValue) {
        let valuesToUse = "";
        
        // 根据渲染场景（A杖、魔晶还是基础）选择对应的 Float 数组
        switch (type) {
          case HeroDescType.Scepter:
            valuesToUse = specialValue.values_scepter.length ? specialValue.values_scepter.join(" / ") : specialValue.values_float.join(" / ");
            break;
          case HeroDescType.Shard:
            valuesToUse = specialValue.values_shard.length ? specialValue.values_shard.join(" / ") : specialValue.values_float.join(" / ");
            break;
          default:
            valuesToUse = specialValue.values_float.join(" / ");
        }
        return `<span class="value">${valuesToUse}</span>`;
      } 
      
      // 未匹配到，保持原样回退（在模板渲染阶段不作处理）
      return match;
    });
  }
}
enum HeroDescType {
  Normal = "normal",
  Scepter = "scepter",
  Shard = "shard",
}
