<script setup lang="ts">
import type { Award } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'

defineProps<{
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()

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
      <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
        <IconLogo name="edit" />
      </button>
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
    margin: var(--resume-block-gap, 10px) 0;

    .award-title {
      font-size: var(--resume-text-xl, 24px);
      font-weight: bold;
      margin: 0;
    }

    .award-divider {
      flex: 1;
      height: 1px;
      background-color: #eee;
      margin-left: 20px;
      border: 0;
    }

    .section-edit-btn {
      border: 0;
      background: transparent;
      cursor: pointer;
      color: #666;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-left: 10px;
    }
  }

  .award-item {
    margin: var(--resume-section-gap, 8px) 0;

    .award-name {
      font-size: var(--resume-text-lg, 18px);
      font-weight: bold;
    }

    .award-level {
      margin-left: 10px;
      color: #666;
      font-size: var(--resume-text-base, 15px);
      /* background: #f3f3f3; */
      padding: 2px 6px;
      border-radius: 4px;
    }

    .award-time {
      float: right;
      font-size: var(--resume-text-sm, 13px);
      color: #999;
    }
  }
}
</style>
