# OpenDota Request Failed

If the plugin works correctly when requesting the Stratz API, but frequently fails when requesting the OpenDota API, and the Koishi log produces errors similar to the following:

*(Log block omitted as requested)*

* **Key Information:** Error type `Type: Network`, and `Details: Error. Response: undefined`.
   
* **Older Logs:** In previous versions (using `ctx.http (i.e., http service)`), the error here might have been `connect ETIMEDOUT` or `connect ENETUNREACH`.
   

## Problem Cause

The plugin defaults to using the `ctx.http` service provided by Koishi to initiate network requests. `ctx.http` (provided by `@cordisjs/plugin-http`) is built on Node.js's core `fetch` API (which is `undici`).

In certain specific "Broken IPv6" network environments, `undici`'s automatic protocol stack selection ("Happy Eyeballs" algorithm) will prioritize IPv6, fail, and cause the request to `ETIMEDOUT` (timeout).

The standard method to resolve this is to force the request to use only IPv4 (`family: 4`). However, `ctx.http`, as a simple wrapper for `fetch`, does not expose the underlying `dispatcher` or `Agent` configuration options (which `undici` uses to control `family`), making it impossible to force IPv4 on a per-request basis.

## Solution

To bypass this limitation of `ctx.http`, the plugin (since `v2.2.2`) has switched to using the `axios` library for all API requests. `axios` allows precise control over the network stack via `new HttpsAgent({ family: 4 })`.

When the plugin reads in the configuration that [`OpenDotaIPStack`](./en-US/configs.md#opendotaipstack-autoipv4) has been set to `ipv4`, it will activate this solution, forcing the connection to be established using IPv4 and thus resolving this network issue.
