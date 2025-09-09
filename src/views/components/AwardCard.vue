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
    <div class="award-header">
      <h2 class="award-title">奖项</h2>
      <hr class="award-divider" />
    </div>
    <div v-for="(item, index) in awards" :key="index" class="award-item">
      <span class="award-name">{{ item.title }}</span>
      <span class="award-level" v-if="item.level">{{ item.level }}</span>
      <span class="award-time" v-if="item.date">{{ item.date }}</span>
    </div>
  </div>
</template>
<style scoped>
.award-shell {
  width: 100%;

  .award-header {
    display: flex;
    align-items: center;
    margin: 10px 0;

    .award-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }

    .award-divider {
      flex: 1;
      height: 1px;
      background-color: #eee;
      margin-left: 20px;
    }
  }

  .award-item {
    margin: 8px 0;

    .award-name {
      font-size: 18px;
      font-weight: bold;
    }

    .award-level {
      margin-left: 10px;
      color: #666;
      /* background: #f3f3f3; */
      padding: 2px 6px;
      border-radius: 4px;
    }

    .award-time {
      float: right;
      color: #999;
    }
  }
}
</style>
