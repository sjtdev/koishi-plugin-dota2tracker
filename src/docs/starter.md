# 安装

> [!TIP] 提示
> 带有下划线的关键词都可点击导航至对应文档页面查看详情。

### 安装插件
在`koishi`插件市场搜索安装。  
`koishi`安装、插件的安装及配置方式请见 [koishi官方文档](https://koishi.chat)

### 安装服务
目前版本（`1.3.0`以上）需要`http(发送网络请求)` `database(存储数据)` `cron(定时任务)` `puppeteer(生成图片)` `cache(缓存数据)`服务，请按照koishi平台指引依次安装对应所需插件。

> [!TIP] 对应插件推荐：
> [cache]     cache-database  
> [database]  database-sqlite  

# 启用
所需的服务插件都安装完成并启用后，还需在 [STRATZ API 页面](https://stratz.com/api) 获取 API Token，然后将其填入本插件配置页面的 `STRATZ_API_TOKEN` 配置项中并保存配置。插件需要有效的 API Token 才能正常工作。 

至此插件的使用准备都已完成，接下来将介绍插件的各项功能。
