<script setup lang="ts">
import type { ExperienceConfig, ResumeLocale } from '@/types/resume'
import type { ResumeThemeSectionTitleStyle } from '@/themes/types'
import SectionHeaderBar from '@/views/components/common/section-header-bar.vue'
import { resolveLocalizedText } from '@/utils/localized'

const props = withDefaults(
  defineProps<{
    editable?: boolean
    locale?: ResumeLocale
    titleStyle?: ResumeThemeSectionTitleStyle
    enableTitleBackground?: boolean
  }>(),
  {
    locale: 'zh',
    titleStyle: 'divider',
    enableTitleBackground: false,
  },
)

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
    <SectionHeaderBar
      title="工作经历"
      :editable="editable"
      :enable-title-background="enableTitleBackground"
      :title-style="titleStyle"
      @edit="emit('edit')"
    />
    <div v-for="(item, index) in experience" :key="index" class="exp-item">
      <span class="exp-company">{{ resolveLocalizedText(item.company, props.locale) }}</span>
      <span class="exp-partment">{{ resolveLocalizedText(item.partment, props.locale) }}</span>
      <span class="exp-title">{{ resolveLocalizedText(item.jobTitle, props.locale) }}</span>
      <span class="exp-time">{{ item.jobTime?.join(' - ') }}</span>
      <div class="exp-desc">
        <div class="exp-desc-title">主要工作：</div>
        <div class="exp-desc-content">
          <div
            class="exp-desc-item"
            v-for="(desc, descIndex) in item.jobDesc"
            :key="descIndex"
            v-html="resolveLocalizedText(desc, props.locale)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exp-shell {
  width: 100%;

  .exp-item {
    margin: var(--resume-section-gap, 8px) 0;

    .exp-company {
      font-size: var(--resume-text-lg, 18px);
      font-weight: bold;
    }

    .exp-partment {
      margin-left: 10px;
      color: #666;
      font-size: var(--resume-text-base, 15px);
    }

    .exp-title {
      display: inline-block;
      margin-left: 10px;
      color: #666;
      font-size: var(--resume-text-base, 15px);
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
          margin-top: 0.15em;
        }
      }
    }
  }
}
</style>
