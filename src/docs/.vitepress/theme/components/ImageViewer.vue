<template>
  <div class="image-container" :style="containerStyle">
    <div class="image-viewer">
      <img :src="imageSrc" :alt="props.alt" ref="image">
      <div class="gradient-overlay"></div>
      <div class="click-hint">查看完整模板</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useData } from "vitepress";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";

const props = defineProps({
  src: String,
  alt: String,
  maxHeight: {
    type: String,
    default: "400px",
  },
});
const { site } = useData();

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
    navbar: false,
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      reset: true,
      rotateLeft: true,
      rotateRight: true,
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
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  pointer-events: none; /* 确保点击事件能穿透到图片 */
}

.click-hint {
  position: absolute;
  top:360px;
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
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.75) 100%
  );
}

.image-container:hover .click-hint {
  opacity: 1;
}
</style>
