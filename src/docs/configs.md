# 配置说明
### 基础设置
#### STRATZ_API_TOKEN `string`
- 插件基于stratz的API获取数据，因此此项必须配置才可使用。
- stratz API很好获得，使用Steam账号登录即可获得一个基本版的API Token，每日可调用10000次，一般来说基本够用。
> [!TIP] 插件每日调用API情况计算：1440×(P/5)+(1+W)+R
> = 每天分钟数 × (绑定且在已订阅群组中的人数 ÷ 5)向上取整  
>  \+ (一次解析请求 + 战报等待解析时发送的请求次数)  
>  \+ 查询指令调用次数


#### dataParsingTimeoutMinutes `number`
- 数据等待解析超时（单位：分钟）
- 虽然比赛中有登录过stratz网站的玩家时会自动解析，而且目前插件在追踪到比赛数据时也会发送一次解析比赛请求，但也不排除stratz抽风、游戏版本更新stratz未跟进、非标准模式等各种导致解析优先级靠后或未能解析的情况；
- 从比赛结束时间算起，超过此配置项的等待时间后将直接发布不完整数据的战报。

#### urlInMessageType `checkbox`
- 消息中附带链接
- 在`查询比赛`指令与`战报消息`中附带对应stratz比赛页面的链接。
- 在`查询玩家`指令中附带对应stratz玩家页面的链接。
- 在`查询英雄`指令中附带`刀塔百科`对应的英雄页面的链接。

#### proxyAddress `string`
- 代理地址，留空时不使用代理。

#### 段位追踪
##### rankBroadSwitch `boolean`
- 启用后追踪已绑定玩家的段位信息，出现变动后对所在且已订阅的群组发送段位变动报告。

##### rankBroadStar `boolean`
- 此项禁用后将不会追踪星级变动。

##### rankBroadLeader `boolean`
- 此项启用后将追踪冠绝玩家的名次变动。

##### rankBroadFun `boolean`
- 是否启用整活播报模板，效果图见[模板展示](./template-rank.md)。

### 总结设置
#### 日报/周报
##### dailyReportSwitch / weeklyReportSwitch `boolean`
- 日报/周报开启开关。目前日报与周报使用同一模板。

##### dailyReportHours / weeklyReportHours
- 日报/周报发布于几点。

##### dailyReportShowCombi / weeklyReportShowCombi
- 日报/周报显示玩家组合开关。<del>（友尽开关）</del>

### 模板设置
#### template_match
比赛模板选择`["match_1", "match_2"]`
#### template_player
玩家模板选择`目前仅有一张模板`
#### template_hero
英雄模板选择`目前仅有一张模板`
#### playerRankEstimate `boolean`
启用后使用`查询玩家`指令查询无段位玩家时，将根据玩家近期场次段位推算玩家段位，推算的段位标志显示为灰色图片。
