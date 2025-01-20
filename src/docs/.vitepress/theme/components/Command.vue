<template>
  <div class="command-help">
    <div class="description">
      <h3>{{ t("description") }}</h3>
      <p>{{ command.description }}</p>
    </div>

    <div v-if="command.options" class="options">
      <h3>{{t("options")}}</h3>
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
      <h3>{{t("usage")}}</h3>
      <div class="content">
        {{ command.usage }}
      </div>
    </div>

    <div v-if="command.examples" class="examples">
      <h3>{{t("examples")}}</h3>
      <div class="content">
        <code v-for="(example, index) in exampleList" :key="index" class="example">{{ example }}</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useData } from "vitepress";
const { lang } = useData();

// 定义多语言文本对象
const i18n = {
  "en-US": {
    description: "Description",
    options: "Option parameters",
    usage: "Usage instructions",
    examples: "Usage examples",
  },
  "zh-CN": {
    description: "命令描述",
    options: "选项参数",
    usage: "使用说明",
    examples: "使用示例",
  },
};

// 创建一个计算属性来获取当前语言的文本
const t = (key) => {
  // 如果没有对应的语言，回退到英文
  return (i18n[lang.value] || i18n["en-US"])[key];
};

const props = defineProps({
  command: {
    type: Object,
    required: true,
  },
});

// 解析参数简写和描述
const getShortParam = (desc) => {
  const match = desc.match(/^(-\w+)/);
  return match ? match[1] : null;
};

const getParamDesc = (desc) => {
  return desc.replace(/^-\w+\s+/, "");
};

// 将示例文本分割成数组
const exampleList = computed(() => {
  if (!props.command.examples) return [];
  return props.command.examples.split("\n").filter((line) => line.trim());
});
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
