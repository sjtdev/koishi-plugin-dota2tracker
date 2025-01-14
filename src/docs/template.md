# 模板通用信息

> [!TIP] 这里展示的是一些会用在多个模板中的元素

### 对线评估 `match_1` `player_1`

对线结果，由stratz分析比赛各玩家数据得出，此处共5+1种类型
* ![stomp](/images/lane/stomp.png) 对线碾压  
* ![victory](/images/lane/victory.png) 对线优势
* ![tie](/images/lane/tie.png) 对线平手
* ![fail](/images/lane/fail.png) 对线劣势
* ![stomped](/images/lane/stomped.png) 对线被碾
> 特殊类型：打野
* ![jungle](/images/lane/jungle.png) 野区霸主

### 称号系统 `match_1` `match_2`

根据玩家表现各项数据评出
| 称号 | 条件 |
| :---: | :--- |
|<span style="color: #FFA500;">MVP</span>|胜利且MVP分数最高|
|<span style="color: #66CCFF;">魂</span>|失败且MVP分数最高|
|<span style="color: #FFD700;">富</span>|总财产最高|
|<span style="color: #8888FF;">睿</span>|XPM最高|
|<span style="color: #FF00FF;">控</span>|控制时间最长（眩晕时间 × 1 + 其他限制效果时间 × 0.5 + 减速时间 × 0.25）|
|<span style="color: #CC0088;">爆</span>|造成伤害最高|
|<span style="color: #DD0000;">破</span>|击杀数最高，相同时造成伤害最高|
|<span style="color: #CCCCCC;">鬼</span>|死亡数最高，相同时总财产最低|
|<span style="color: #006400;">助</span>|助攻数最高，相同时造成伤害最高|
|<span style="color: #FEDCBA;">拆</span>|建筑伤害最高|
|<span style="color: #00FF00;">奶</span>|治疗量最高|
|<span style="color: #84A1C7;">耐</span>|承受伤害最高|
|<span style="color: #DDDDDD;">摸</span>|参战率最低，相同时击杀+助攻最低，再相同时造成伤害最低|
|MVP 分数|击杀 × 5 + 助攻 × 3 + 眩晕时间 × 0.1 + 其他限制效果时间 × 0.05 + 减速时间 × 0.025 + 造成伤害 × 0.001 + 建筑伤害 × 0.01 + 治疗量 × 0.002 + stratz评估的表现分 × 0.25
