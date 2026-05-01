<script setup lang="ts">
import type { Award, ResumeLocale } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedText } from '@/utils/localized'

const props = withDefaults(defineProps<{
  editable?: boolean
  locale?: ResumeLocale
  themeKey?: string
}>(), {
  locale: 'zh',
  themeKey: '',
})

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const awards = defineModel<Award[]>('awards', {
  type: Array as () => Award[],
  required: true,
  default: () => [],
})

const isResearchTheme = () => props.themeKey === 'research-scholar'
</script>
<template>
  <div class="award-shell" :class="{ 'is-research': isResearchTheme() }">
    <div class="award-header">
      <h2 class="award-title">奖项</h2>
      <hr class="award-divider" />
      <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
        <IconLogo name="edit" />
      </button>
    </div>
    <div v-for="(item, index) in awards" :key="index" class="award-item">
      <span class="award-name">{{ resolveLocalizedText(item.title, props.locale) }}</span>
      <span class="award-level" v-if="resolveLocalizedText(item.issuer, props.locale)">{{ resolveLocalizedText(item.issuer, props.locale) }}</span>
      <span class="award-level" v-if="resolveLocalizedText(item.level, props.locale)">{{ resolveLocalizedText(item.level, props.locale) }}</span>
      <span class="award-level" v-if="resolveLocalizedText(item.category, props.locale)">{{ resolveLocalizedText(item.category, props.locale) }}</span>
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

.award-shell.is-research {
  .award-header {
    margin: var(--resume-section-gap, 7px) 0 4px;
    border-bottom: 1px solid #111;
    justify-content: space-between;
  }

  .award-title {
    font-size: var(--resume-text-lg, 16px);
  }

  .award-divider {
    display: none;
  }

  .award-item {
    margin: 5px 0;
    font-size: var(--resume-text-base, 14px);
  }

  .award-name {
    font-size: var(--resume-text-base, 14px);
  }
}
</style>
