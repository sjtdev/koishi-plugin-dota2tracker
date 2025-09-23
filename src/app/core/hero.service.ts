import { Context, Random, Service } from "koishi";
import * as dotaconstants from "dotaconstants";
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
    const now = DateTime.utc();
    const endOfDay = now.endOf("day");
    const ttl = endOfDay.diff(now).toMillis();
    this.ctx.dota2tracker.cache.setWweeklyMetaCache(cacheKey, weeklyHeroMeta, ttl);
    return weeklyHeroMeta;
  }

  async getHeroDetails(input: any, languageTag: string, isRandom: boolean = false) {
    const heroId = this.ctx.dota2tracker.i18n.findHeroIdInLocale(isRandom ? Random.pick(Object.keys(dotaconstants.heroes)) : input);
    if (!heroId) return;
    return HeroService.formatHeroDetails(await this.ctx.dota2tracker.valveAPI.queryHeroDetailsFromValve(heroId, languageTag));
  }

  public static formatHeroDetails(rawHero: any) {
    let hero = Object.assign({}, rawHero);
    hero.facet_abilities.forEach((fa, i) => {
      if (fa.abilities.length) {
        fa.abilities.forEach((ab) => {
          if (!(hero.facets[i] as any).abilities) (hero.facets[i] as any).abilities = [];
          if ((hero.facets[i] as any).description_loc !== ab.desc_loc)
            (hero.facets[i] as any).abilities.push({
              id: ab.id,
              name: ab.name,
              name_loc: ab.name_loc,
              description_ability_loc: this.formatHeroDesc(ab.desc_loc, ab.special_values, HeroDescType.Facet),
            });
          else (hero.facets[i] as any).description_loc = this.formatHeroDesc((hero.facets[i] as any).description_loc, ab.special_values, HeroDescType.Facet);
          ab.ability_is_facet = true;
          ab.facet = hero.facets[i];
          hero.abilities.push(ab);
        });
      }
    });
    // 遍历技能处理命石（facet）
    const all_special_values = [...hero.abilities.flatMap((ab) => ab.special_values), ...hero.facet_abilities.flatMap((fas) => fas.abilities.flatMap((fa) => fa.special_values))];
    hero.abilities.forEach((ab) => {
      // 遍历修改技能的命石，将描述与技能回填
      ab.facets_loc.forEach((facet, i) => {
        i = i + (hero.facets.length - ab.facets_loc.length);
        if (i < 0) return;
        if (facet) {
          if (!(hero.facets[i] as any).abilities) (hero.facets[i] as any).abilities = [];
          (hero.facets[i] as any).abilities.push({
            id: ab.id,
            name: ab.name,
            name_loc: ab.name_loc,
            description_ability_loc: this.formatHeroDesc(facet, ab.special_values, HeroDescType.Facet),
            attributes: [],
          });
        }
      });
      hero.facets.forEach((facet) => {
        const svs = ab.special_values.filter((sv) => sv.facet_bonus.name === facet.name);
        svs.forEach((sv) => {
          if (sv.heading_loc) {
            if (!facet.abilities) facet.abilities = [];
            (facet as any).abilities
              .find((ability: any) => ab.id == ability.id)
              ?.attributes.push({
                heading_loc: sv.heading_loc,
                values: [...sv.facet_bonus.values],
                is_percentage: sv.is_percentage,
              });
          }
        });
        facet.description_loc = this.formatHeroDesc(facet.description_loc, svs, HeroDescType.Facet);
      });
      // 处理技能本身说明
      ab.desc_loc = this.formatHeroDesc(ab.desc_loc, ab.special_values, (ab as any).ability_is_facet ? HeroDescType.Facet : undefined);
      ab.notes_loc = ab.notes_loc.map((note) => this.formatHeroDesc(note, ab.special_values));
      // 处理神杖与魔晶说明
      if (ab.ability_has_scepter) ab.scepter_loc = this.formatHeroDesc(ab.scepter_loc, ab.special_values, HeroDescType.Scepter);
      if (ab.ability_has_shard) ab.shard_loc = this.formatHeroDesc(ab.shard_loc, ab.special_values, HeroDescType.Shard);
    });

    // 处理天赋
    hero.talents.forEach((talent: any) => {
      // Regular expression to match {s:some_value}
      const regex = /\{s:(.*?)\}/g;
      let match;

      // Loop through all matches
      while ((match = regex.exec(talent.name_loc)) !== null) {
        const specialValueName = match[1];

        // Find the target special value in the talent's special values
        const target = talent.special_values?.find((sv: any) => sv.name === specialValueName);
        if (target) {
          talent.name_loc = talent.name_loc.replace(match[0], target.values_float.join("/"));
        } else {
          // Find the ability that contains the bonus associated with the talent
          const abilities = hero.abilities.filter((ability: any) => ability.special_values.some((specialValue: any) => specialValue.bonuses.some((bonus: any) => bonus.name === talent.name)));

          for (const ability of abilities) {
            // Find the special value in the ability that contains the bonus
            const specialValues = ability.special_values.filter((specialValue: any) => specialValue.bonuses.some((bonus: any) => bonus.name === talent.name));

            const regex = /{s:bonus_(.*?)}/g;
            let match: RegExpExecArray | null;
            const replacements: {
              original: string;
              replacement: any;
            }[] = [];

            while ((match = regex.exec(talent.name_loc)) !== null) {
              const specialValue = specialValues.find((sv) => sv.name === String((match as any)[1]));
              const replacement = specialValue?.bonuses.find((bonus) => bonus.name === talent.name)?.value;
              if (replacement !== undefined) {
                replacements.push({
                  original: match[0],
                  replacement,
                });
              }
            }

            // 进行所有替换
            replacements.forEach(({ original, replacement }) => {
              talent.name_loc = talent.name_loc.replace(original, replacement);
            });
          }
        }
      }
    });
    return hero;
  }

  private static formatHeroDesc(template: string, special_values: any[], type: HeroDescType = HeroDescType.Normal): string {
    return template.replace(/%%|%([^%]+)%|\{([^}]+)\}/g, (match, p1, p2) => {
      const field = p1 || p2;

      if (match === "%%") {
        return "%";
      } else {
        // 处理 "s:" 前缀和 "shard_" 前缀，然后转换为小写
        const fieldName = field
          .replace(/^s:/, "")
          .replace(/^shard_/, "")
          .toLowerCase();
        const specialValue = special_values.find((sv) => {
          const nameLower = sv.name.toLowerCase();
          // 匹配字段名，忽略 "bonus_" 和 "shard_" 的有无
          return nameLower === fieldName || nameLower === `bonus_${fieldName}` || nameLower === `shard_${fieldName}` || `bonus_${nameLower}` === fieldName || `shard_${nameLower}` === fieldName;
        });
        if (specialValue) {
          let valuesToUse = "";
          switch (type) {
            case HeroDescType.Facet:
              valuesToUse = specialValue.facet_bonus.name ? specialValue.facet_bonus.values.join(" / ") : specialValue.values_float.join(" / ");
              break;
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
        } else {
          return match; // 如果未找到对应的特殊值，则保持原样
        }
      }
    });
  }
}
enum HeroDescType {
  Normal = "normal",
  Facet = "facet",
  Scepter = "scepter",
  Shard = "shard",
}
