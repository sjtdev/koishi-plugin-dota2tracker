# 配置说明
### 基础设置
#### STRATZ_API_TOKEN `string`
- 插件基于stratz的API获取数据，因此此项必须配置才可使用。
- stratz API很好获得，使用Steam账号登录stratz网站，在 [API页面](https://stratz.com/api) 可获得一个基本版的API Token，每日可调用10000次，一般来说基本够用。
> [!TIP] 插件每日调用API情况计算：1440×(P/5)+(1+W)+R
> = 每天分钟数 × (绑定且在已订阅群组中的人数 ÷ 5)向上取整  
>  \+ (一次解析请求 + 战报等待解析时发送的请求次数)  
>  \+ 查询指令调用次数

> [!WARNING] 有关stratz API Forbidden 403 错误
> 请见 [关于 API 403](./api-403.md)


#### dataParsingTimeoutMinutes `number`
- 数据等待解析超时（单位：分钟）
- 虽然比赛中有登录过stratz网站的玩家时会自动解析，而且目前插件在追踪到比赛数据时也会发送一次解析比赛请求，但也不排除stratz抽风、游戏版本更新stratz未跟进、非标准模式等各种导致解析优先级靠后或未能解析的情况；
- 从比赛结束时间算起，超过此配置项的等待时间后将直接发布不完整数据的战报。

#### proxyAddress `string`
- 代理地址，留空时不使用代理。
> [!WARNING] 注意
> 从`2.2.2`版本起插件的网络请求依赖由`http`服务切换至`axios`包，因而插件无法使用`proxy-agent`插件配置的全局代理，仅支持使用此配置项设置的代理地址。

#### suppressApiNetworkErrors `boolean`
> 因为stratz服务器不稳，叠加网络环境错综复杂的原因，导致在某些情况某些时段下轮询数据时报出大量网络错误，所以推出该选项以隐藏这些错误。  
> 此选项也对opendota的网络请求相关报错生效。
- 开启此选项后将API请求造成的网络错误（如超时等信息）降为`debug`级输出日志。
> [!TIP] koishi 的 debug 日志显示方式
> koishi 默认不显示 debug 日志。若需要开启显示需要到 **koishi webui** 中 `资源管理器 > koishi.yml` 文件底部添加以下内容并保存后重启 koishi
> ```yaml
> logger:
>   levels:
>     dota2tracker.stratz-api: 3
>     dota2tracker.opendota-api: 3
>     dota2tracker.match-watcher: 3
>     dota2tracker.parse-polling: 3
>     dota2tracker.match: 3
>     dota2tracker.player: 3
> ```

#### enableOpenDotaFallback `boolean`
- 开启后，使用 OpenDotaAPI 作为`战报追踪`与`查询比赛`的后备数据源，在轮询 stratz 比赛数据时同步请求 OpenDota 比赛数据。
- 当前调用策略为每场比赛每分钟获取一次数据，每5分钟发送一次解析请求，解析请求占10次调用次数。
> - OpenDotaAPI 免费限额每天2000次，且免费调用无APIKEY，推测可能使用IP限制。
> - 基于以上推测，可能有一种极小概率事件，也就是插件的OpenDotaAPI调用次数远不足2000次时却被限制，很可能是因为公用IP环境中有其他的OpenDotaAPI调用者占用了次数。

#### OPENDOTA_API_KEY `string`
- OpenDota 的订阅付费APIKEY，  
- 可在 https://www.opendota.com/api-keys 查看详情。  
- OpenDota 的免费用户此处请留空。

#### OpenDotaIPStack `auto|ipv4`
- 当 OpenDota API 100%访问失败时可以将此选项由默认值`auto`切换至`ipv4`尝试解决问题，更多具体信息请见 [OpenDota 请求失败](./opendota-failed.md)

### 消息设置

#### useHeroNicknames `boolean`
- 默认开启，禁用后将在`战报消息`中仅使用英雄的正式名称。

#### urlInMessageType `checkbox`
- 消息中附带链接
- 在`查询比赛`指令与`战报消息`中附带对应stratz比赛页面的链接。
- 在`查询玩家`指令中附带对应stratz玩家页面的链接。
- 在`查询英雄`指令中附带`刀塔百科`对应的英雄页面的链接。

#### maxSendItemCount `number`
- 使用`查询物品`指令发送物品图片数量限制，大于此数值将不会发送物品图片。

#### showItemListAtTooMuchItems `boolean`
- 使用`查询物品`指令查询结果数量大于*maxSendItemCount*限制时、或查询参数为空时，是否发送物品列表图片。

#### customItemAlias `array`
- 插件会从[内置别名列表](https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/src/locales/zh-CN.constants.json#L304-L407)通过一些常见物品别名检索物品，如有疏漏可在此配置处自行添加。如果是内置列表遗漏的广为流传的别名也可提出*issue*或*pull request*协助完善词典。

#### autoRecallTips `boolean`
- 开启后，在指令调用结束后自动撤回**提示**消息，如：“正在搜索对局详情，请稍后……”

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

#### fontPath `string`
- 字体文件所在目录，默认为 `data/fonts/dota2tracker`。
- 插件会自动读取该目录下的字体文件，并在下方 `fonts` 配置项中生成可选列表。
- 支持的字体格式：`.ttf`, `.otf`, `.woff`, `.woff2`, `ttc`, `sfnt`。

#### fonts
模板字体设置。具体请见 [模板字体](./template-fonts.md)。
##### fonts.sans `dynamic`
- 非衬线字体，是大多数模板的默认主要正文字体。
##### fonts.serif `dynamic`
- 衬线字体，在一些模板中用作标题字体。
##### fonts.mono `dynamic`
- 等宽字体，在一些模板中用作代码、数字字体。
