<template>
  <div class="command-help">
    <div class="description">
      <h3>命令描述</h3>
      <p>{{ command.description }}</p>
    </div>

    <div v-if="command.options" class="options">
      <h3>选项参数</h3>
      <ul>
        <li v-for="(desc, name) in command.options" :key="name">
          <div class="param-names">
            <code class="param">--{{ name }}</code>
            <code class="param-short" v-if="getShortParam(desc)">
              {{ getShortParam(desc) }}
            </code>
          </div>
          <span>{{ getParamDesc(desc) }}</span>
        </li>
      </ul>
    </div>

    <div v-if="command.usage" class="usage">
      <h3>使用说明</h3>
      <div class="content">
        {{ command.usage }}
      </div>
    </div>

    <div v-if="command.examples" class="examples">
      <h3>使用示例</h3>
      <div class="content">
        <code v-for="(example, index) in exampleList" :key="index" class="example">{{ example }}</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  command: {
    type: Object,
    required: true
  }
})

// 解析参数简写和描述
const getShortParam = (desc) => {
  const match = desc.match(/^(-\w+)/)
  return match ? match[1] : null
}

const getParamDesc = (desc) => {
  return desc.replace(/^-\w+\s+/, '')
}

// 将示例文本分割成数组
const exampleList = computed(() => {
  if (!props.command.examples) return []
  return props.command.examples.split('\n').filter(line => line.trim())
})
</script>

<style scoped>
.command-help {
  padding: 1rem;
  /* border: 1px solid var(--vp-c-divider); */
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  margin-bottom: 1.2rem;
}

.command-help > div {
  margin-bottom: 1.5rem;
}

.command-help > div:last-child {
  margin-bottom: 0;
}

h3 {
  font-size: 1.1rem;
  margin: 0.75rem 0;
  color: var(--vp-c-text-1);
}

.content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.options ul {
  list-style: none;
  padding: 0;
}

.options li {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
}

.options code {
  color: var(--vp-c-brand);
  background-color: var(--vp-c-bg-mute);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  white-space: nowrap;
}

.examples .example {
  display: block;
  background-color: var(--vp-c-bg-mute);
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.examples .example:last-child {
  margin-bottom: 0;
}
</style>
