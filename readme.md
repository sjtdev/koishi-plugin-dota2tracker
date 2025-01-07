# [@sjtdev/koishi-plugin-dota2tracker](https://sjtdev.github.io/koishi-plugin-dota2tracker/)

[新文档](https://sjtdev.github.io/koishi-plugin-dota2tracker/)正在缓慢构建中……

[![npm](https://img.shields.io/npm/v/@sjtdev/koishi-plugin-dota2tracker/latest?style=flat-square)](https://www.npmjs.com/package/@sjtdev/koishi-plugin-dota2tracker)
[![npm](https://img.shields.io/npm/v/@sjtdev/koishi-plugin-dota2tracker/next?style=flat-square)](https://www.npmjs.com/package/@sjtdev/koishi-plugin-dota2tracker)
[![npm downloads](https://img.shields.io/npm/dm/@sjtdev/koishi-plugin-dota2tracker.svg?style=flat-square)](https://www.npmjs.com/package/@sjtdev/koishi-plugin-dota2tracker)  
> [!TIP]
> 两个标签取版本号最高的版为最新版本

DOTA2Bot插件-提供自动追踪群友的最新对局的功能（需群友绑定），以及一系列查询功能。
### 安装
在koishi插件市场搜索安装  
有关koishi的使用说明：（[koishi官方文档](https://koishi.chat/)）

### 使用
需在插件配置页填入STRATZ API TOKEN，否则无法使用。(配置中提供了API的获取链接)  
在希望推送战报信息的群组（或频道）使用指令`订阅本群`，玩家可使用指令`绑定`来将自身账号与Steam账号绑定，bot会尝试追踪已订阅群组（或频道）中的绑定玩家的最新对局信息。  
其他查询功能见下方指令说明。  
**直接调用help指令可获取更详细的说明，调用【指令 -h】还会有用法示例。（例如：订阅本群 -h）**  
**本插件使用的所有SteamID均为SteamID3类型（即DOTA2游戏内个人页面显示的好友ID与stratz登录后个人页面链接中显示的ID），有关SteamID类型见 https://steamid.tatlead.com/ （由[issue](../../issues/1)提供，感谢这位用户）**  
  
**更新日志见[changelog](changelog.md)**  

### 指令
指令 <必填参数> [可选参数]
##### 订阅
（bot仅向已订阅群组/频道推送信息）  
（若是使用Discord、KOOK频道类平台，订阅与绑定信息仅对单个频道生效，频道间相互独立）
* `订阅本群`
* `取消订阅`
##### 绑定
（bot会追踪每位绑定玩家的最新对局）
* `绑定 <玩家SteamID> [玩家别名]`
* `取消绑定`
* `改名 <新玩家别名>`
##### 查询
* `查询玩家 [SteamID|别名] [<--hero|-o> <英雄ID|英雄名|英雄常用别名>]`  
  返回一张图片，包含玩家各类信息。（缺省参数时并且调用者已绑定将自查）（输入--hero或-o并跟上查询英雄的参数时，将查询玩家指定英雄）
* `查询比赛 <比赛ID>`  
  返回一张图片，包含比赛对战信息。
* `查询最近比赛 [SteamID|别名]`  
  查询指定玩家的最近一场比赛，效果同上。（缺省参数时并且调用者已绑定将自查）
* `查询英雄 <英雄ID|英雄名|英雄常用别名>`  
  返回一张图片，包含英雄属性与技能详情。（此处英雄名为中文名）
* <del>`查询英雄对战 <英雄ID|英雄名|英雄常用别名>`</del>  
  好像不是很实用
* <del>`7.36 [英雄ID|英雄名|英雄常用别名] [--refresh|-r]`</del>  
  <del>查询官网7.36更新日志中指定英雄的改动信息  
  无英雄参数时直接返回官网7.36更新日志网址  
  首次使用时将缓存更新日志网页，若读取失败或出错，可添加`--refresh`或`-r`指令重新缓存</del>  
  `查询英雄`指令已适配7.36改动，所以此指令已废弃

### 英雄ID|英雄名|英雄常用别名 列表
<del>[dotaconstants_add.json](https://github.com/sjtdev/koishi-plugin-dota2tracker/blob/master/src/dotaconstants_add.json#L102-L226)  
补充或纠错请提issue</del>  
已可在本地化中定义

### 图片模板列表
展示见[wiki](https://github.com/sjtdev/koishi-plugin-dota2tracker/wiki)  
生成图片已使用ejs模板实现，所有模板都在[template]文件夹下，若是有大佬想自己设计模板欢迎联系我完善数据接口。（当前有很多在模板中后处理的数据，不是很友好）  

## 灵感来源&鸣谢
* 感谢[SonodaHanami](https://github.com/SonodaHanami)大佬的[Steam_watcher](https://github.com/SonodaHanami/Steam_watcher)项目，是本插件最重要的灵感来源，并授权提供了战报称号系统、英雄代称与播报信息的代码数据。
* 也受到了[koishi-plugin-dota2track(npm)](https://www.npmjs.com/package/koishi-plugin-dota2track)的启发，为我的代码提供了一些思路。
