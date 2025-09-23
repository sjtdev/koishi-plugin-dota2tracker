// 这个文件专门用于为我们的脚本编译环境“打补丁”，补充缺失的类型

// 导入 cron 插件的类型定义，这会自动将其对 Context 的扩展应用到本次编译中
import type {} from 'koishi-plugin-cron'

// 导入 proxy-agent 插件的类型定义，这会自动扩展 http 服务的 RequestConfig 类型
import type {} from '@koishijs/plugin-proxy-agent'

// 这会加载 src/core/types.service.ts 文件中的 `declare module 'koishi'` 部分。
import type {} from '../src/app/core/types.service'
