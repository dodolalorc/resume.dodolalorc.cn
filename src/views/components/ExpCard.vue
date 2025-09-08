<script setup lang="ts">
import type { ExperienceConfig } from '@/types/resumeConfig'

const experience = defineModel<ExperienceConfig[]>('experience', {
  type: Array as () => ExperienceConfig[],
  required: true,
  default: () => [],
})
</script>
<template>
  <div class="exp-shell">
    <div class="exp-header">
      <h2 class="exp-title">工作经历</h2>
      <hr class="exp-divider" />
    </div>
    <div v-for="(item, index) in experience" :key="index" class="exp-item">
      <span class="exp-company">{{ item.company }}</span>
      <span class="exp-partment">{{ item.partment }}</span>
      <span class="exp-title">{{ item.jobTitle }}</span>
      <span class="exp-time">{{ item.jobTime?.join(' - ') }}</span>
      <div class="exp-desc" v-html="item.jobDesc"></div>
    </div>
  </div>
</template>

<style scoped>
.exp-shell {
  width: 100%;
  .exp-header {
    display: flex;
    align-items: center;
    margin: 10px 0;
    .exp-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .exp-divider {
      flex: 1;
      height: 1px;
      background-color: #eee;
      margin-left: 20px;
    }
  }

  .exp-item {
    margin: 8px 0;
    .exp-company {
      font-size: 18px;
      font-weight: bold;
    }
    .exp-partment {
      margin-left: 10px;
      color: #666;
    }
    .exp-title {
      display: inline-block;
      margin-left: 10px;
      color: #666;
      background: #f3f3f3;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .exp-time {
      float: right;
      color: #999;
    }
    .exp-desc {
      margin-top: 8px;
      line-height: 1.6;
    }
  }
}
</style>