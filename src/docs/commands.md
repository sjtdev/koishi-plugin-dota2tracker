# 指令说明

**格式**：指令 <必填参数> [可选参数]

中文指令别名可在`koishi-指令管理`中禁用并自定义新的别名。

> [!TIP] 提示
> 以下内容根据插件中的指令帮助文本生成，基本等同于`指令 -h`的执行效果。

<script setup>
import locale from "../locales/zh-CN.command.yml"
</script>

***
##### `dota2tracker.help`
`DOTA2指南`
<Command :command="locale.commands.dota2tracker.help"/>

***
##### `dota2tracker.subscribe`
`订阅本群`
<Command :command="locale.commands.dota2tracker.subscribe"/>

***
##### `dota2tracker.unsubscribe`
`取消订阅`
<Command :command="locale.commands.dota2tracker.unsubscribe"/>

***
##### `dota2tracker.bind <steam_id> [nick_name]`
`绑定 <steam_id> [nick_name]`
<Command :command="locale.commands.dota2tracker.bind"/>

***
##### `dota2tracker.unbind`
`取消绑定`
<Command :command="locale.commands.dota2tracker.unbind"/>

***
##### `dota2tracker.rename <nick_name>`
`改名 <nick_name>`
<Command :command="locale.commands.dota2tracker.rename"/>

***
##### `dota2tracker.query-members`
`查询群友`
<Command :command="locale.commands.dota2tracker['query-members']"/>

***
##### `dota2tracker.query-match <match_id>`
`查询比赛 <match_id>`
<Command :command="locale.commands.dota2tracker['query-match']"/>

***
##### `dota2tracker.query-recent-match [input_data]`
`查询最近比赛 [input_data]`
<Command :command="locale.commands.dota2tracker['query-recent-match']"/>

***
##### `dota2tracker.query-player <input_data>`
`查询玩家 <input_data>`
<Command :command="locale.commands.dota2tracker['query-player']"/>

***
##### `dota2tracker.query-hero <input_data>`
`查询英雄 <input_data>`
<Command :command="locale.commands.dota2tracker['query-hero']"/>

***
##### `dota2tracker.query-item <input_data>`
`查询物品 <input_data>`
<Command :command="locale.commands.dota2tracker['query-item']"/>

***
##### `dota2tracker.hero-of-the-day <input_data>`
`今日英雄 <input_data>`
<Command :command="locale.commands.dota2tracker['hero-of-the-day']"/>
