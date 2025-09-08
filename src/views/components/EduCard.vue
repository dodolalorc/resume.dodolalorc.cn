<script setup lang="ts">
import type { EducationConfig } from '@/types/resumeConfig'

const edu = defineModel<EducationConfig[]>('education', {
  type: Array as () => EducationConfig[],
  required: true,
  default: () => [],
})
</script>
<template>
  <div class="edu-shell">
    <div class="edu-header">
      <h2 class="edu-title">教育经历</h2>
      <hr class="edu-divider" />
    </div>
    <div v-for="(item, index) in edu" :key="index" class="edu-item">
      <span class="edu-school">{{ item.school }}</span>
      <span class="edu-time">{{ item.eduTime?.join(' - ') }}</span>
      <span class="edu-degree">{{ item.degree }}</span>
      <span class="edu-major">{{ item.major }}</span>
      <div class="edu-desc" v-html="item.eduDesc"></div>
    </div>
  </div>
</template>

<style scoped>
.edu-shell {
  width: 100%;
  .edu-header {
    display: flex;
    align-items: center;
    margin: 10px 0;
    .edu-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .edu-divider {
      flex: 1;
      height: 1px;
      background-color: #eee;
      margin-left: 20px;
    }
  }

  .edu-item {
    margin: 10px 0;
    .edu-school {
      font-size: 18px;
      font-weight: bold;
    }
    .edu-time {
      margin-left: 10px;
      color: #666;
    }
    .edu-degree {
      display: inline-block;
      margin-left: 10px;
      color: #666;
      background: #f3f3f3;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 13px;
      line-height: 1.2;
      border: 1px solid #e0e0e0;
    }
    .edu-major {
      margin-left: 10px;
      color: #666;
    }
    .edu-desc {
      margin-top: 8px;
      line-height: 1.6;
      color: #333;
    }
  }
}
</style>
