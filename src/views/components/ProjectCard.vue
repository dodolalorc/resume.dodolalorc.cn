<script setup lang="ts">
import type { Project } from '@/types/resumeConfig'
const projects = defineModel<Project[]>('projects', {
  type: Array as () => Project[],
  required: true,
  default: () => [],
})
</script>
<template>
  <div class="project-shell">
    <div class="project-header">
      <h2 class="project-title">项目经历</h2>
      <hr class="project-divider" />
    </div>
    <div v-for="(item, index) in projects" :key="index" class="project-item">
      <span class="project-name">{{ item.name }}</span>
      <span class="project-time">{{ item.projectTime?.join(' - ') }}</span>
      <span class="project-role">{{ item.role }}</span>
      <div class="project-desc" v-html="item.projectDesc"></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
</style>