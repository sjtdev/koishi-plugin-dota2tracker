import{_ as a,c as t,a1 as i,o}from"./chunks/framework.BS7HPa06.js";const m=JSON.parse('{"title":"所有配置项","description":"","frontmatter":{},"headers":[],"relativePath":"configs.md","filePath":"configs.md"}'),r={name:"configs.md"};function l(s,e,n,c,d,u){return o(),t("div",null,e[0]||(e[0]=[i('<h1 id="所有配置项" tabindex="-1">所有配置项 <a class="header-anchor" href="#所有配置项" aria-label="Permalink to &quot;所有配置项&quot;">​</a></h1><h3 id="基础设置" tabindex="-1">基础设置 <a class="header-anchor" href="#基础设置" aria-label="Permalink to &quot;基础设置&quot;">​</a></h3><h4 id="stratz-api-token" tabindex="-1">STRATZ_API_TOKEN <a class="header-anchor" href="#stratz-api-token" aria-label="Permalink to &quot;STRATZ_API_TOKEN&quot;">​</a></h4><ul><li>插件基于stratz的API获取数据，因此此项必须配置才可使用。</li><li>stratz API很好获得，使用Steam账号登录即可获得一个基本版的API Token，每日可调用10000次，一般来说基本够用。</li><li>插件每日调用API情况计算：1440×(P/5)+(1+W)+R</li></ul><blockquote><p>每天分钟数 × (绑定且在已订阅群组中的人数 ÷ 5)向上取整 + (一次解析请求 + 战报等待解析时每分钟发送的请求次数) + 查询指令调用次数</p></blockquote><h4 id="dataparsingtimeoutminutes" tabindex="-1">dataParsingTimeoutMinutes <a class="header-anchor" href="#dataparsingtimeoutminutes" aria-label="Permalink to &quot;dataParsingTimeoutMinutes&quot;">​</a></h4><ul><li>数据等待解析超时 <code>number</code> <code>默认值：60</code></li><li>虽然比赛中有登录过stratz网站的玩家时会自动解析，而且目前插件在追踪到比赛数据时也会发送一次解析比赛请求，但也不排除stratz抽风、游戏版本更新stratz未跟进、非标准模式等各种导致解析优先级靠后或未能解析的情况；</li><li>从比赛结束时间算起，超过此配置项的等待时间后将直接发布不完整数据的战报。</li></ul><h4 id="urlinmessagetype" tabindex="-1">urlInMessageType <a class="header-anchor" href="#urlinmessagetype" aria-label="Permalink to &quot;urlInMessageType&quot;">​</a></h4><ul><li>消息中附带链接 <code>checkbox</code></li><li>在<code>查询比赛</code>指令与<code>战报消息</code>中附带对应stratz比赛页面的链接。</li><li>在<code>查询玩家</code>指令中附带对应stratz玩家页面的链接。</li><li>在<code>查询英雄</code>指令中附带<code>刀塔百科</code>对应的英雄页面的链接。</li></ul>',9)]))}const p=a(r,[["render",l]]);export{m as __pageData,p as default};
