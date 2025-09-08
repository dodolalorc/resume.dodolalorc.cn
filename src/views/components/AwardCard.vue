<script setup lang="ts">
import type { Award } from '@/types/resumeConfig'
const awards = defineModel<Award[]>('awards', {
  type: Array as () => Award[],
  required: true,
  default: () => [],
})

</script>
<template>
  <div class="award-shell">
    <h2 class="award-title">奖项</h2>
    <hr class="award-divider" />
    <div v-for="(item, index) in awards" :key="index" class="award-item">
      <span class="award-name">{{ item.title }}</span>
      <span class="award-level" v-if="item.level"> - {{ item.level }}</span>
      <span class="award-time" v-if="item.date"> ({{ item.date }})</span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
</style>