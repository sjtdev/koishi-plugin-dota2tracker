# OpenDota 请求失败

如果插件在请求 Stratz API 时工作正常，但在请求 OpenDota API 时频繁失败，并且在 Koishi 的日志产生了如下的类似报错：
```log
2025-11-10 00:00:00 [E] dota2tracker.parse-polling A data source failed during the match fetch process. See details below:
2025-11-10 00:00:00 [E] dota2tracker.parse-polling --- OpenDota API Error ---
2025-11-10 00:00:00 [E] dota2tracker.parse-polling A network error occurred: OpenDota query (https://api.opendota.com/api/matches/...) failed. Type: Network
                        Details: Error. Response: undefined
                        Error: OpenDota query (https://...) failed. Type: Network
                            at processFetchError (...)
                            at OpenDotaAPI.fetchData (...)
                            ...
```
* 关键信息：错误类型 `Type: Network`，以及 `Details: Error. Response: undefined`。
* 旧版日志：在旧版本中（使用 `ctx.http (即 http 服务)` 时），此处的错误可能是 `connect ETIMEDOUT` 或 `connect ENETUNREACH`。

## 问题原因

插件默认使用 Koishi 提供的 `ctx.http` 服务来发起网络请求。`ctx.http`（由 `@cordisjs/plugin-http` 提供）是基于 Node.js 核心的 `fetch` API（即 `undici`）构建的。

在某些特定的“破碎的 IPv6”网络环境下，`undici` 的自动协议栈选择（"Happy Eyeballs"）算法会优先尝试 IPv6 并失败，导致请求 `ETIMEDOUT` (超时)。

解决此问题的标准方法是强制请求只使用 IPv4 (`family: 4`)。然而，`ctx.http` 作为 `fetch` 的一层简洁封装，它并没有将底层的 `dispatcher` 或 `Agent` 配置项（`undici` 用来控制 `family` 的方式）暴露出来，导致我们无法在单次请求中强制使用 IPv4。

## 解决方案

为了绕过 `ctx.http` 的这个限制，本插件（从 `v2.2.2` 开始）切换到了 `axios` 库来处理所有 API 请求。`axios` 允许通过 `new HttpsAgent({ family: 4 })` 来精确控制网络协议栈。

当插件在配置中读取到 [`OpenDotaIPStack`](./configs.md#opendotaipstack-auto-ipv4) 设为 `ipv4` 时，插件将启用此方案，强制使用 IPv4 建立连接，从而解决了这个网络问题。
