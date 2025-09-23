|-- src
    |-- config.ts # 从index.ts拆分而来的配置文件
    |-- index.ts # 重构后恢复了入口文件的职责
    |-- @types
    |   |-- graphql-generated.d.ts # 这是由 stratz api schema 使用 graphql-codegen 生成的类型文件
    |-- app
    |   |-- commands
    |   |   |-- channel.command.ts
    |   |   |-- hero-of-the-day.command.ts
    |   |   |-- query-hero.command.ts
    |   |   |-- query-item.command.ts
    |   |   |-- query-match.command.ts
    |   |   |-- query-member.command.ts
    |   |   |-- query-player.command.ts
    |   |   |-- user.command.ts
    |   |   |-- _helper.ts
    |   |-- common
    |   |   |-- constants.ts
    |   |   |-- error.ts
    |   |   |-- i18n.ts
    |   |   |-- types.ts
    |   |   |-- utils.ts
    |   |-- core
    |   |   |-- hero.service.ts
    |   |   |-- item.service.ts
    |   |   |-- match.service.ts
    |   |   |-- player.service.ts
    |   |   |-- types.service.ts
    |   |-- data
    |   |   |-- cache.ts
    |   |   |-- database.ts
    |   |   |-- stratz.api.ts
    |   |   |-- types.ts
    |   |   |-- valve.api.ts
    |   |-- presentation
    |   |   |-- image.renderer.ts
    |   |   |-- message.builder.ts
    |   |-- tasks
    |       |-- match-watcher.task.ts
    |       |-- parse-polling.task.ts
    |       |-- report.task.ts
    |-- docs
    |   |-- ... # 基于 vitepress 编写的文档，结构较复杂不在此处展示
    |-- locales
        |-- en-US.command.yml
        |-- en-US.constants.json
        |-- en-US.schema.yml
        |-- en-US.template.yml
        |-- en-US.yml
        |-- zh-CN.command.yml
        |-- zh-CN.constants.json
        |-- zh-CN.schema.yml
        |-- zh-CN.template.yml
        |-- zh-CN.yml
