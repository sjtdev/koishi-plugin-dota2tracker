### 1.2.4
**修复**：修正调用help指令时本插件某些指令的说明错误  
**修复**：修复`取消订阅`指令失效的问题  

### 1.2.3
**修复**：修复了比赛战报图片中称号`摸`判定不正确的问题  
**改进**：微调了比赛战报图片模板`match_2`中称号的显示样式  

### 1.2.2
**移除**：取消`查询英雄`的缓存功能，原因为valve的API返回的数据可能包含未本地化的字段（例如这次的7.36b更新后获取到的很多改动后技能说明暂时都是英文），这些数据无法根据版本判断是否需要更新缓存。  
**修复**：修复了`查询英雄`图片中某些命石提供技能可能被判定为先天技能的问题。（实际为API缺陷）  

### 1.2.1
**改进**：优化比赛战报图片中，对多个同种物品（例如双护腕双挂件一类）的出装时间显示进行优化，原先都将显示为最后一件此种物品的购买时间，现在可以显示不同的时间。  
> 从第一件购买时间算起，例如火枪于1:00 2:00 3:00购买了三个系带，游戏结束前卖出其中之一，则剩余两个则显示为1:00 2:00  

**改进**：出于实用性考虑，比赛战报图片中将不再显示辅助道具的购买时间。  

### 1.2.0
**改进**：对`查询英雄`模板代码进行了调整与部分重写，完成7.36版本的英雄数据匹配，现在可正常使用。  
> （人话说就是先天技能和命石适配完成了）  

**移除**：因`查询英雄`指令已适配7.36版本，`7.36`指令退役。（删除）  
#### hotfix
**修复**：删除一些留存的测试用代码

### 1.1.10
**修复**：修复`7.36`指令因DOTA2官网的cdn链接变动导致获取失败的问题，并优化了加载速度。  
**修复**：修复每次在koishi重新启动后，使用指令`7.36`都会重新获取数据的问题。  
#### hotfix
**修复**：修复一处编译问题导致`7.36`指令无法使用的问题

### 1.1.9
**新增**：v1.1.6加入的功能等待解析时间现在可以配置，位于插件页配置项`dataParsingTimeoutMinutes`  
**修复**：修复因v1.1.8修改数据获取方式导致的`绑定`指令失效  
**修复**：修复指令`查询英雄`报错问题（数据仍为7.35d，等待上游API更新）  
**改进**：兼容Discord、KOOK等频道类平台，将订阅与绑定存储时群组(guild)改为频道(channel)，对onebot(qq)类无影响（出现使用问题请联系我）  
<details>
    <summary>若此前已在使用频道类平台……</summary>
    此版本前频道类平台应该无法使用战报功能与日报功能。此版本在订阅本群与绑定玩家时将存储channelId而不是guildID，对于非频道类平台这两个值是一样的，不会造成影响。但频道类平台应该会彻底失效，解决方案只有操作数据库，将channelId填入原先guildId处（兼容原因，未修改数据库字段名[guildId]，但实际上存入的已经是channel的ID了；guildId和channelId可参考数据库表channel中的数据），或重新订阅与绑定。（若是重新订阅与绑定，不会覆盖原先存储guildId的数据，也就是说旧数据依然会存在，可根据需求选择是否删除）
</details>

### 1.1.8
**改进**：将数据获取方式从 npm 包 `axios` 切换为 Koishi 提供的 `http` 服务，并简化了相关代码（用户体验无差别）。  
**改进**：为 `match_2` 模板添加了玩家小队标识（效果与 `match_1` 模板中的相同功能一致，但在显示上进行了微调）。  

### 1.1.7
**改进**：玩家信息模板中代表位置的图标替换为简约风格图标  
**修复**：于v1.1.5新增的`7.36`指令生成英雄改动图片时会额外产生的测试用的`remainingContent.html`文件，现已不再生成。（如果之前使用了该命令并产生了此文件，可根据需要手动删除。位于`koishi/node_modules/@sjtdev/koishi-plugin-dota2tracker/`）  

### 1.1.6
由于近期stratz网站问题，比赛数据无法自动解析，导致bot会一直等待解析后的战报数据而无法发送。
**新增**：现在调整为比赛结束1小时后仍然未解析时将直接发出缺失部分数据的战报（缺失包括BP顺序、出装时间、英雄受到伤害等）  
#### hotfix
**修复**：修复引发播报未解析比赛战报失败的一个小问题  

### 1.1.5
**新增**：为新版本7.36添加新指令`7.36`  
`7.36 <英雄ID|英雄名|英雄常用别名>`可查询对应英雄的改动信息，未输入英雄查询参数时直接返回官网7.36更新日志链接  
添加`--refresh|-r`参数可强制重新获取数据，如`7.36 -r`，也可在查询时使用，如`7.36 敌法师 -r`  

### 1.1.4
**改进**：完善查询玩家指定英雄的生成模板  

### 1.1.3
**新增**：新增实验性功能【日报昨日总结】，在指定时间播报昨日已订阅群组中已绑定群友的战绩（简略文字），默认关闭，可在插件配置中打开  
`查询玩家`指令新增功能，现在额外输入参数`--hero <英雄ID|英雄名|英雄常用别名>`可查询目标玩家指定英雄的详情（--hero可替换为-o）  
例如：  
* `查询玩家 123456789 --hero 敌法师`  
* `查询玩家 -o 敌法师` （仍可缺省玩家参数以自查）  

### 1.1.2
**改进**：完成查询群友功能  
**修复**：修复玩家模板中显示NaN的部分  
#### hotfix
**修复**：修复查询远古玩家账号时可能意外失败的问题  
**改进**：调整mvp中的控制分与[控]称号算法  
#### hotfix.2
**修复**：修复初次使用查询英雄指令时，技能名初始化失败导致的错误  

### 1.1.2-beta
**改进**：为`查询群友`添加模板，还在调整布局中  

### 1.1.1
**改进**：玩家信息模板添加近25场内各个位置表现展示  

### 1.1.0
**改进**：使用ejs重写模板相关代码使其模块化，使新增模板更方便  
**新增**：为比赛信息添加了仿MAX+模板，效果可见[match_2](./wiki/match_2)，可在插件配置中切换   