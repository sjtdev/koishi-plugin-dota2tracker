### 主动消息
> [!TIP] 提示
> 下文中的 [群组] 也等效于 [频道]。  
#### 战报追踪
插件会追踪 **已订阅的群组** 中 **已绑定的群友** 的最新对局信息。  
* 在需要追踪的群组使用[`订阅本群`](./commands.md#dota2tracker-subscribe)指令：
<chat-panel>
<chat-message nickname="Alice">订阅本群</chat-message>
<chat-message nickname="Koishi">订阅成功。</chat-message>
</chat-panel>

* 希望播报对局战报的群友使用[`绑定 <steam_id> [nick_name]`](./commands.md#dota2tracker-bind-steam-id-nick-name)指令：
<chat-panel>
<chat-message nickname="Alice">绑定 123456789 张三</chat-message>
<chat-message nickname="Koishi">
  绑定成功，<br>
  ID：1000000000<br>
  别名：张三<br>
  SteamID：123456789
</chat-message>
</chat-panel>

* 之后当这位群友完成了一场新比赛时，插件将对这个群组推送战报信息：
> 此处图文无关，仅作演示。
<chat-panel>
<chat-message nickname="Koishi">
  (Steam账号名)的斧王带领团队走向了胜利。<br>
  KDA：10.00 [10/2/10]，GPM/XPM：744/742，补刀/反补：276/17，伤害/塔伤：45613/15976，参战/参葬率：66.67%/33.33%
  <img src="/generated/match_2.png" />
</chat-message>
</chat-panel>

此处展示的图片由[`match_2`](./template-match.md#match-2)模板生成，模板相关见 [对局信息模板](./template-match.md) 。

评语（*带领团队走向了胜利*）为内置的**积极**评语，目前判断规则为：  
[查看代码](https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/df0abb9ccca5faefb27cc1a366fdaadbd27316ed/src/index.ts#L385-L393)

> [!TIP] 规则
> 位于胜方 参葬率小于20% 或 参战率大于75% 或 输出经济比大于1.5 或 塔伤大于一万 或 表现分大于0  
> 位于败方 参葬率小于25% 或 参战率大于75% 或 输出经济比大于1 或 塔伤大于五千 或 表现分大于0  
> 以上有任意一项是判定通过即为积极评语，否则是负面评语  

以上包括评语和模板在内的文本内容都可自定义，见 [本地化](./i18n.md#自定义文本) 。

#### 段位追踪
插件也会追踪绑定群友的段位信息，可在 [配置项：段位追踪](./configs.md#段位追踪) 关闭。
* 当已绑定的群友段位发生变动时，插件会向群组推送段位变动信息：
<chat-panel><chat-message nickname="Koishi">群友 张三 段位变动：先锋5 → 卫士1</chat-message></chat-panel>

* 配置项[整活模板开关](./configs#rankbroadfun-boolean)，开启后将使用[整活模板](./template-rank.md)播报变动情况。
<chat-panel><chat-message nickname="Koishi"><img src="/generated/rank_fun-up.png" /></chat-message></chat-panel>

#### 日报/周报
> [!TIP] 提示
> 此功能较为简陋，并不十分推荐。  
> 目前日报与周报使用同一模板，仅时间跨度不同。

在开启 [配置项：dailyReportSwitch/weeklyReportSwitch](./configs.md#日报-周报) 后插件将在配置的时间点统计每个已订阅群组中群友近期战绩，使用模板生成报告总结图片并推送到群组中。
<chat-panel><chat-message nickname="Koishi"><img src="/generated/daily.png" /></chat-message></chat-panel>

如果不喜欢<del>友尽的组合胜率展示</del>，也可以关闭 [配置项：](./configs.md) 禁用此功能。
<chat-panel><chat-message nickname="Koishi"><img src="/generated/daily-hideCombi.png" /></chat-message></chat-panel>
