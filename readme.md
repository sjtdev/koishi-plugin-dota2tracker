# @sjtdev/koishi-plugin-dota2tracker

[![npm](https://img.shields.io/npm/v/@sjtdev/koishi-plugin-dota2tracker?style=flat-square)](https://www.npmjs.com/package/@sjtdev/koishi-plugin-dota2tracker)

DOTA2Bot插件-提供自动追踪群友的最新对局的功能（需群友绑定），以及一系列查询功能。
### 安装
在koishi插件市场搜索安装

### 使用
需在插件配置页填入STRATZ API TOKEN，否则无法使用。
在希望推送战报信息的群组使用指令【-订阅本群】，玩家可使用指令【-绑定】来将自身账号与Steam账号绑定，bot会尝试追踪已订阅群组中的绑定玩家的最新对局信息。
其他查询功能见下方指令说明。
**直接调用help指令可获取更详细的说明，调用【指令 -h】还会有用法示例。（例如：订阅本群 -h）**

### 指令
指令 <必填参数> [可选参数]
##### 订阅
（bot仅向已订阅群组推送信息）
* <input type="checkbox" checked>`订阅本群`
* <input type="checkbox" checked>`取消订阅`
##### 绑定
（bot会追踪每位绑定玩家的最新对局）
* <input type="checkbox" checked>`绑定 <玩家SteamID> [玩家别名]`
* <input type="checkbox" checked>`取消绑定`
* <input type="checkbox" checked>`改名 <新玩家别名>`
##### 查询
* <input type="checkbox" checked>`查询玩家 [SteamID|别名]`  
  返回一张图片，包含玩家各类信息。（缺省参数时并且调用者已绑定将自查）
* <input type="checkbox" checked>`查询比赛 <比赛ID>`  
  返回一张图片，包含比赛对战信息。
* <input type="checkbox" checked>`查询最近比赛 [SteamID|别名]`  
  查询指定玩家的最近一场比赛，效果同上。（缺省参数时并且调用者已绑定将自查）
* <input type="checkbox" checked>`查询英雄 <英雄ID|英雄名|英雄常用别名>`  
  返回一张图片，包含英雄属性与技能详情。（此处英雄名为中文名）
* <input type="checkbox" checked><del>`查询英雄对战 <英雄ID|英雄名|英雄常用别名>`</del>  
  好像不是很实用

### Q&A
Q: 为什么图片都这么难看！  
A: 作者实在是没有一丝的设计天分，欢迎有想法的设计大佬前来交流。  
  
Q: 发现bug/使用问题  
A: 本插件还在开发中，虽然基础功能都已实现，也难免会因业余作者低下的技术力堆出的shi山造成一些问题，欢迎指出。  

## 灵感来源&鸣谢
* 感谢[SonodaHanami](https://github.com/SonodaHanami)大佬的[Steam_watcher](https://github.com/SonodaHanami/Steam_watcher)项目，是本插件最重要的灵感来源，并授权提供了战报称号系统、英雄代称与播报信息的代码数据。
* 也受到了[koishi-plugin-dota2track(npm)](https://www.npmjs.com/package/koishi-plugin-dota2track)的启发，为我的代码提供了一些思路。