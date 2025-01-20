# Installation

> [!TIP] Tip
> Keywords with underlines are clickable and navigate to the corresponding documentation pages for more details.

### Install Plugin
Search and install from the `koishi` plugin market.  
For installation and configuration of `koishi` and plugins, please refer to the [official koishi documentation](https://koishi.chat/en-US/).

### Install Services
The current version (above `1.3.0`) requires `http (sending network requests)`, `database (storing data)`, `cron (scheduled tasks)`, `puppeteer (generating images)`, and `cache (caching data)` services. Please install the necessary plugins according to the koishi platform instructions.

> [!TIP] Recommended Plugins:
> [cache]     cache-database  
> [database]  database-sqlite  

### Plugin Update Notification
Starting from version `1.4.2`, plugin updates will publish a release on Github without attachments, serving as an update reminder.  
If needed, you can use the `Watch` feature to receive notifications about plugin updates. Here are the detailed steps:
1. Visit the [repository page](https://github.com/sjtdev/koishi-plugin-dota2tracker)
2. Click the "Watch" button in the upper right corner
3. Select the "Custom" option
4. In the pop-up settings, check the "Releases" option
5. Click "Apply" to save the settings

You will then receive notifications in the Github notification center.  
If you have email notifications enabled, you will also receive an email reminder from Github.

# Enable
Once all required service plugins are installed and enabled, you still need to obtain an API Token from the [STRATZ API page](https://stratz.com/api), and enter it in the `STRATZ_API_TOKEN` configuration field on the plugin configuration page, then save the settings. The plugin needs a valid API Token to function properly.

At this point, all preparations for using the plugin are complete. Next, the various features of the plugin will be introduced.
