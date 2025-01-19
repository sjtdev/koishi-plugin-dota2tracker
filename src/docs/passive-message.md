### 被动消息（查询指令）
可查看 [指令说明](./commands.md) 或在使用环境中调用`指令 -h`获取使用方法，此处简单介绍几个常用指令并演示：

#### [**查询比赛**](./commands.md#dota2tracker-query-match-match-id)/[**查询最近比赛**](./commands.md#dota2tracker-query-recent-match-input-data)
* [**查询比赛**](./commands.md#dota2tracker-query-match-match-id)：根据比赛编号获取比赛数据。  
* [**查询最近比赛**](./commands.md#dota2tracker-query-recent-match-input-data)：根据玩家ID或指令调用者的绑定信息获取最近比赛数据。  
  
  根据比赛数据使用 [配置项：template_match](./configs.md#template_match-模板展示) 中设置的 [比赛模板](./template-match.md) 生成图片后发送。
> 消息中携带的stratz比赛页面链接可在 [配置项：urlinmessagetype](./configs.md#urlinmessagetype-checkbox) 中关闭。
<chat-panel>
<chat-message nickname="Alice">查询比赛 8127571787</chat-message>
<blockquote><p><em>或者</em></p></blockquote>
<chat-message nickname="Alice">查询最近比赛</chat-message>
<chat-message nickname="Koishi">正在搜索对局详情，请稍后……</chat-message>
<chat-message nickname="Koishi">
  https://stratz.com/matches/8127571787
  <img src="/generated/match_2.png" />
</chat-message>
</chat-panel>

> 此处展示的图片由[`match_2`](./template-match.md#match-2)模板生成，模板相关见 [对局信息模板](./template-match.md) 。  

#### [**查询玩家**](./commands.md#dota2tracker-query-player-input-data)
查询指定SteamID玩家，使用 [玩家模板](./template-player.md) 生成图片后发送。
<chat-panel>
<chat-message nickname="Alice">查询玩家</chat-message>
<chat-message nickname="Koishi">正在获取玩家数据，请稍后……</chat-message>
<chat-message nickname="Koishi">
  https://stratz.com/players/**********
  <img src="/generated/player_1-mini.png" />
</chat-message>
</chat-panel>

> 防占用过大篇幅，图片中玩家数据经过精简。模板详细展示见 [玩家信息模板](./template-player.md) 。  

#### [**查询英雄**](./commands.md#dota2tracker-query-hero-input-data)
请见 [指令：查询英雄](./commands.md#dota2tracker-query-hero-input-data) 与 [英雄信息模板](./template-hero.md)。
> [!WARNING] 注意
> 由于数据源是直接访问DOTA2官方API，没有文档和规范，每次数据结构变动需要花费大量精力进行适配，如果有好的适配方案或使用时发现问题欢迎反馈。
