<template>
  <div class="image-container" :style="containerStyle">
    <div class="image-viewer">
      <img :src="imageSrc" :alt="props.alt" ref="image" />
      <div class="gradient-overlay"></div>
      <div class="click-hint">{{t("fullTip")}}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useData } from "vitepress";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
const { lang, site } = useData();

// 定义多语言文本对象
const i18n = {
  "en-US": {
    fullTip: "Full Template",
    zoomTip: "Double-click/scroll to zoom image",
  },
  "zh-CN": {
    fullTip: "查看完整模板",
    zoomTip: "双击/滚轮缩放图片",
  },
};

// 创建一个计算属性来获取当前语言的文本
const t = (key) => {
  // 如果没有对应的语言，回退到英文
  return (i18n[lang.value] || i18n["en-US"])[key];
};

const props = defineProps({
  src: String,
  alt: String,
  maxHeight: {
    type: String,
    default: "400px",
  },
});

// 处理图片路径
const imageSrc = computed(() => {
  let path = props.src;
  // 如果路径以 public/ 开头，去掉这个前缀
  if (path.startsWith("public/")) {
    path = path.substring(7);
  }
  // 确保路径以 / 开头
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  // 添加 base 路径前缀
  return site.value.base + path.slice(1);
});
const image = ref(null);
const containerStyle = computed(() => ({
  maxHeight: props.maxHeight,
}));

onMounted(() => {
  new Viewer(image.value, {
    title: false,
    navbar: false,
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      reset: true,
      rotateLeft: true,
      rotateRight: true,
    },
    ready() {
      // 在 Viewer 实例准备好时添加提示文字
      const footer = this.viewer.footer;
      const title = document.createElement("div");
      title.className = "viewer-title";
      title.textContent = t("zoomTip");
      footer.insertBefore(title, footer.children[0]);
    },
  });
});
</script>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
}

.image-viewer {
  position: relative;
  width: 100%;
}

.image-viewer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 渐变遮罩 */
.gradient-overlay {
  position: absolute;
  top: 300px;
  left: 0;
  right: 0;
  height: 100px; /* 控制渐变区域的高度 */
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
  pointer-events: none; /* 确保点击事件能穿透到图片 */
}

.click-hint {
  position: absolute;
  top: 360px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  opacity: 0.5;
  pointer-events: none;
}

/* 悬停效果 */
.image-container:hover .gradient-overlay {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.75) 100%);
}

.image-container:hover .click-hint {
  opacity: 1;
}
</style>
