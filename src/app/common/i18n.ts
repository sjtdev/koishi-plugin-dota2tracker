import { Context, Service, Channel, I18n, Session, Random } from "koishi";
import * as dotaconstants from "dotaconstants";
import { Config } from "../../config";
import { enhancedSimpleHashToSeed } from "./utils";

// At the same time, SupportLanguageTags can also be obtained from the Keys of LanguageTags.
// const SupportLanguageTags = Object.keys(LanguageTags);
export const LanguageTags: Record<string, { graphqlTag: string; valveTag: string }> = {
  "en-US": { graphqlTag: "ENGLISH", valveTag: "english" },
  "zh-CN": { graphqlTag: "S_CHINESE", valveTag: "schinese" },
};

export class I18NService extends Service<Config> {
  private readonly constantLocales = {};
  private readonly i18n: I18n;
  private readonly globalLanguageTag: string;
  constructor(ctx: Context) {
    super(ctx, "dota2tracker.i18n", true);
    this.config = ctx.config;
    this.i18n = this.ctx.i18n;
    for (const supportLanguageTag of Object.keys(LanguageTags)) {
      this.constantLocales[supportLanguageTag] = require(`../../locales/${supportLanguageTag}.constants.json`);
      this.i18n.define(supportLanguageTag, require(`../../locales/${supportLanguageTag}.yml`));
      this.i18n.define(supportLanguageTag, require(`../../locales/${supportLanguageTag}.command.yml`));
      this.i18n.define(supportLanguageTag, require(`../../locales/${supportLanguageTag}.template.yml`));
    }
    this.globalLanguageTag = this.i18n.fallback(Object.values(this.i18n.locales).map((locale) => Object.keys(locale).at(0))).find((locale) => Object.keys(LanguageTags).includes(locale));
  }
  getGraphqlLanguageTag(languageTag: string): string {
    return LanguageTags[languageTag].graphqlTag;
  }
  getValveLanguageTag(languageTag: string): string {
    return LanguageTags[languageTag].valveTag;
  }
  async getLanguageTag(options?: { session?: Session; channel?: Channel; channelId?: string }): Promise<string> {
    const { session, channel, channelId } = options || {};
    // 根据参数获取频道，获取不到则为undefined
    const resolvedChannel: Channel | undefined = channel ?? (await this.ctx.database?.get("channel", { id: session?.event.channel.id ?? channelId }))?.at(0);
    // 根据语言标签列表进行回退，优先级为频道语言>平台语言，随后与已支持语言进行匹配
    return this.i18n.fallback((resolvedChannel?.locales ?? []).concat(Object.values(this.i18n.locales).map((locale) => Object.keys(locale).at(0)))).find((locale) => Object.keys(LanguageTags).includes(locale));
  }

  getConstantLocale(tag: string) {
    return this.constantLocales[tag];
  }

  private render(...args: any[]): ReturnType<typeof this.i18n.render> {
    return this.i18n.render.apply(this.i18n, args);
  }

  $t(languageTag: string, key: string | string[], param?: string[] | Record<string, string> | string | object, options?: { target?: "text" | "html" }): string {
    // 如果 key 是点分隔字符串，将其拆分为数组以支持常量词典
    const keys = Array.isArray(key) ? key : key.split(".");
    const params = Array.isArray(param) ? param : [param];

    // 1. 优先在常量词典中查找翻译
    const constantTranslation = keys.reduce((result, k) => {
      return result?.[k] ?? null;
    }, this.constantLocales[languageTag] || {});

    if (constantTranslation) {
      // 如果找到常量翻译，替换占位符并返回
      if (Array.isArray(params)) {
        // 替换数字占位符 {0}, {1}, ...
        return constantTranslation.replace(/\{(\d+)\}/g, (_, index) => params[+index] || "");
      }
      if (typeof params === "object" && params !== null) {
        // 替换命名占位符 {name}, {value}, ...
        return constantTranslation.replace(/\{(\w+)\}/g, (_, key) => params[key] || "");
      }
      let result = constantTranslation; // 假设已经处理好插值
      const targetFormat = options?.target || "text";
      if (targetFormat === "html") {
        result = result.replace(/\n/g, "<br/>");
      }
      return result;
    }
    // 2. 如果常量词典未命中，直接将原始 key 传递给 ctx.i18n（保持原有格式）
    const originalKey = Array.isArray(key) ? key : [key];
    const elements = this.render([languageTag], originalKey, (param as any) ?? {});

    // 遍历消息元素数组，对每个元素实例调用它自己的 .toString() 方法
    let result = elements.map((el) => el.toString()).join("");
    const targetFormat = options?.target || "text";

    // 2. 如果目标是 'html'，则将所有 \n 替换为 <br/>
    if (targetFormat === "html") {
      result = result.replace(/\n/g, "<br/>");
    }
    if (result == key) return;
    return result;
  }

  gt(key: string | string[], param?: string[] | Record<string, string> | string | object): string {
    return this.$t(this.globalLanguageTag, key, param);
  }

  /**
   * [私有] 获取单个英雄的官方译名。
   * 这是获取英雄名的最快方式。
   */
  private _getOfficialHeroName(heroId: number, languageTag: string): string {
    return this.$t(languageTag, `dota2tracker.template.hero_names.${heroId}`);
  }
  /**
   * [私有] 获取单个英雄的所有名称（官方名 + 社区别名）。
   */
  private _getAllHeroNames(heroId: number, languageTag: string): string[] {
    const officialName = this._getOfficialHeroName(heroId, languageTag);
    let nicknames: string[] = [];

    try {
      const rawContent = this.i18n.render([languageTag], [`dota2tracker.heroes_nicknames.${heroId}`], {}).at(0)?.attrs?.content ?? "";
      if (rawContent) {
        nicknames = JSON.parse(`[${rawContent}]`);
      }
    } catch (error) {
      this.logger.error(`Failed to parse nicknames for heroId ${heroId}: ${error.message}`);
      nicknames = [];
    }

    // 使用 Set 去重，并确保官方名称总是在其中
    return Array.from(new Set([officialName, ...nicknames]));
  }
  /**
   * [公共] 根据配置，获取英雄的最终显示名称（官方名称或随机别名）。
   * 这是插件其他部分应该调用的唯一方法。
   */
  public getDisplayNameForHero(heroId: number, languageTag: string, options: { random?: InstanceType<typeof Random>; seed?: string; forceOfficialName?: boolean }): string {
    // 1. 如果禁用了别名，调用最快的方法
    if (options.forceOfficialName || !this.config.useHeroNicknames) {
      return this._getOfficialHeroName(heroId, languageTag);
    }

    // 2. 如果启用了别名，则获取所有名称并随机挑选
    const allNames = this._getAllHeroNames(heroId, languageTag);

    // 如果别名列表为空（不太可能发生，因为总有官方名），返回保底的官方名
    if (allNames.length === 0) {
      return this._getOfficialHeroName(heroId, languageTag);
    }

    let randomizer: InstanceType<typeof Random>;

    // ✅ 在函数内部判断参数类型，并创建/使用 Random 实例
    if (options.random instanceof Random) {
      // 情况2：传入的是一个 Random 实例，直接使用
      randomizer = options.random;
    } else if (options.seed) {
      // 情况3：传入的是一个种子字符串，用它创建新的 Random 实例
      const seed = enhancedSimpleHashToSeed(options.seed);
      randomizer = new Random(() => seed);
    } else {
      // 情况1：什么都没传，使用完全随机
      randomizer = new Random();
    }

    return randomizer.pick(allNames);
  }

  // ✅ 用于缓存每个语言的别名映射表
  private _nicknameCache = new Map<string, Map<string, number>>();

  /**
   * [私有] 为指定语言构建一个从“别名/官方名”到 heroId 的映射表。
   * 这是一个昂贵的操作，其结果应该被缓存。
   */
  private _buildNicknameMap(languageTag: string): Map<string, number> {
    this.logger.debug(`Building nickname map for ${languageTag}...`);
    const heroIds = Object.keys(dotaconstants.heroes).map(Number);
    const nicknameMap = new Map<string, number>();

    for (const heroId of heroIds) {
      const allNames = this._getAllHeroNames(heroId, languageTag);
      for (const name of allNames) {
        // 使用小写字母作为 key，以实现不区分大小写的查找
        nicknameMap.set(name.toLowerCase(), heroId);
      }
    }
    return nicknameMap;
  }
  public findHeroIdInLocale(input: string | number | undefined): number | undefined {
    if (input === null || input === undefined || input === "") return;

    const inputStr = String(input).toLowerCase();

    // 1. 优先检查输入是否是纯数字ID
    if (/^\d+$/.test(inputStr)) {
      const heroId = Number(inputStr);
      if (dotaconstants.heroes[heroId]) {
        return heroId;
      }
    }

    // 2. 遍历所有支持的语言，查找别名
    for (const languageTag of Object.keys(LanguageTags)) {
      // a. 检查缓存
      if (!this._nicknameCache.has(languageTag)) {
        // b. 如果缓存未命中，则构建并存入缓存
        this._nicknameCache.set(languageTag, this._buildNicknameMap(languageTag));
      }

      const nicknameMap = this._nicknameCache.get(languageTag);

      // c. 在映射表中进行高效查找
      if (nicknameMap.has(inputStr)) {
        return nicknameMap.get(inputStr);
      }
    }

    return undefined; // 如果遍历完所有语言都找不到，则返回 undefined
  }

  async generateUsage(): Promise<string> {
    let usage: string;
    const GlobalLanguageTag = await this.getLanguageTag();
    usage = this.$t(GlobalLanguageTag, "dota2tracker.usage");
    !this.ctx.cron && (usage += "\n" + this.$t(GlobalLanguageTag, "dota2tracker.usage_cron"));
    return usage;
  }
}
