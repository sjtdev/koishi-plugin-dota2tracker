# Commands

**Format**: Command \<Required Parameter\> [Optional Parameter]

> [!TIP] Tip
> In `koishi: commands`, command aliases can be created, allowing you to eliminate the "dota2tracker" prefix or establish a simple alias "match" for "dota2tracker.query-match".

> [!TIP] Tip
> The following content is generated based on the command help text in the plugin, essentially equivalent to executing `command -h`.

<script setup>
import locale from "../../locales/en-US.command.yml"
</script>

***
##### `dota2tracker.help`
<Command :command="locale.commands.dota2tracker.help"/>

***
##### `dota2tracker.subscribe`
<Command :command="locale.commands.dota2tracker.subscribe"/>

***
##### `dota2tracker.unsubscribe`
<Command :command="locale.commands.dota2tracker.unsubscribe"/>

***
##### `dota2tracker.bind <steam_id> [nick_name]`
<Command :command="locale.commands.dota2tracker.bind"/>

***
##### `dota2tracker.unbind`
<Command :command="locale.commands.dota2tracker.unbind"/>

***
##### `dota2tracker.rename <nick_name>`
<Command :command="locale.commands.dota2tracker.rename"/>

***
##### `dota2tracker.query-members`
<Command :command="locale.commands.dota2tracker['query-members']"/>

***
##### `dota2tracker.query-match <match_id>`
<Command :command="locale.commands.dota2tracker['query-match']"/>

***
##### `dota2tracker.query-recent-match [input_data]`
<Command :command="locale.commands.dota2tracker['query-recent-match']"/>

***
##### `dota2tracker.query-player <input_data>`
<Command :command="locale.commands.dota2tracker['query-player']"/>

***
##### `dota2tracker.query-hero <input_data>`
<Command :command="locale.commands.dota2tracker['query-hero']"/>

***
##### `dota2tracker.query-item <input_data>`
<Command :command="locale.commands.dota2tracker['query-item']"/>

***
##### `dota2tracker.hero-of-the-day <input_data>`
<Command :command="locale.commands.dota2tracker['hero-of-the-day']"/>
