# 配置说明
### 基础设置
#### STRATZ_API_TOKEN `string`
- 插件基于stratz的API获取数据，因此此项必须配置才可使用。
- stratz API很好获得，使用Steam账号登录即可获得一个基本版的API Token，每日可调用10000次，一般来说基本够用。
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

#### suppressStratzNetworkErrors `boolean`
> 因为stratz服务器不稳，叠加网络环境错综复杂的原因，导致在某些情况某些时段下轮询数据时报出大量网络错误，所以推出该选项以隐藏这些错误。
- 开启此选项后将stratz网络错误（如超时等信息）降为`debug`级输出日志。
> [!TIP] koishi 的 debug 日志显示方式
> koishi 默认不显示 debug 日志。若需要开启显示需要到 **koishi webui** 中 `资源管理器 > koishi.yml` 文件底部添加以下内容后重启 koishi
> ```yaml
> logger:
>   levels:
>     dota2tracker.stratz-api: 3
>     dota2tracker.match-watcher: 3
>     dota2tracker.parse-polling: 3
>     dota2tracker.match: 3
>     dota2tracker.player: 3
> ```

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
#### templateFonts `string[]`
模板所使用的字体名。需要 koishi 所在设备安装字体文件。  
可添加多个字体名，将从上到下回退到第一个可用字体；若所有字体都不可用，则使用系统默认字体。  
其中字体名若包含空格或特殊字符需要在名称首尾添加引号（此处建议尽量强制使用引号）；  
若使用字体族名则必须**不使用引号**，如：
```
"Microsoft YaHei"
sans-serif
```
有关font-family的更多信息，请查阅 [📖 MDN: font-family](https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family)  
