<script setup lang="ts">
import type { ExperienceConfig } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'

defineProps<{
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()

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
      <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
        <IconLogo name="edit" />
      </button>
    </div>
    <div v-for="(item, index) in experience" :key="index" class="exp-item">
      <span class="exp-company">{{ item.company }}</span>
      <span class="exp-partment">{{ item.partment }}</span>
      <span class="exp-title">{{ item.jobTitle }}</span>
      <span class="exp-time">{{ item.jobTime?.join(' - ') }}</span>
      <div class="exp-desc">
        <div class="exp-desc-title">主要工作：</div>
        <div class="exp-desc-content">
          <div
            class="exp-desc-item"
            v-for="(desc, descIndex) in item.jobDesc"
            :key="descIndex"
            v-html="desc"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exp-shell {
  width: 100%;

  .exp-header {
    display: flex;
    align-items: center;
    margin: var(--resume-block-gap, 10px) 0;

    .exp-title {
      font-size: var(--resume-text-xl, 24px);
      font-weight: bold;
      margin: 0;
    }

    .exp-divider {
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

  .exp-item {
    margin: var(--resume-section-gap, 8px) 0;

    .exp-company {
      font-size: var(--resume-text-lg, 18px);
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
      font-size: var(--resume-text-base, 15px);
      /* background: #f3f3f3; */
      padding: 2px 6px;
      border-radius: 4px;
    }

    .exp-time {
      float: right;
      font-size: var(--resume-text-sm, 13px);
      color: #999;
    }

    .exp-desc {
      margin-top: 8px;
      display: flex;
      flex-direction: row;

      .exp-desc-title {
        min-width: 80px;
        font-weight: bold;
        font-size: var(--resume-text-base, 15px);
      }
      .exp-desc-content {
        flex: 1;
        font-size: var(--resume-text-base, 15px);

        .exp-desc-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 4px;
        }
        .exp-desc-item::before {
          content: '•';
          color: #666;
          flex: none;
          margin-right: 8px;
          line-height: 1;
          margin-top: 0.15em; /* 微调垂直位置以和首行对齐 */
        }
      }
    }
  }
}
</style>
