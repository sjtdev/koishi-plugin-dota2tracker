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

# 更新
  
### 插件更新提示
`1.4.2`版本起，插件更新时会在Github发布一个无附件release，用于插件更新提醒。  
如有需要可以使用 `Watch` 功能接收插件更新通知，以下为详细步骤：
1. 访问[仓库页面](https://github.com/sjtdev/koishi-plugin-dota2tracker)
2. 点击右上方的 "Watch" 按钮
3. 选择 "Custom" 选项
4. 在弹出的设置中勾选 "Releases" 选项
5. 点击 "Apply" 保存设置

这样就可以在Github通知中心收到通知了。  
如果你开启了邮件通知，也会收到一封Github发出的邮件提醒。
