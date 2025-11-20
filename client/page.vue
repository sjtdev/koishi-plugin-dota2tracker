<template>
  <k-layout>
    <k-card>OpenDotaAPI 今日已访问 {{ store.apiCount.opendota }} 次。</k-card>
    <k-card>
      <k-comment type="warning"><p>该页面正在开发中，关于这个页面有任何想法或建议欢迎投稿至 <a target="_blank" href="https://github.com/sjtdev/koishi-plugin-dota2tracker/issues">项目issues</a>。</p></k-comment>
    </k-card>
  </k-layout>
</template>

<script setup>
import { store } from "@koishijs/client";
</script>
