<script setup lang="ts">
import type { Award, ResumeLocale } from '@/types/resume'
import type { ResumeThemeSectionTitleStyle } from '@/themes/types'
import SectionHeaderBar from '@/views/components/common/section-header-bar.vue'
import { resolveLocalizedText } from '@/utils/localized'

const props = withDefaults(
  defineProps<{
    editable?: boolean
    locale?: ResumeLocale
    themeKey?: string
    titleStyle?: ResumeThemeSectionTitleStyle
    enableTitleBackground?: boolean
  }>(),
  {
    locale: 'zh',
    themeKey: '',
    titleStyle: 'divider',
    enableTitleBackground: false,
  },
)

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
    <SectionHeaderBar
      title="奖项"
      :editable="editable"
      :enable-title-background="enableTitleBackground"
      :title-style="titleStyle"
      @edit="emit('edit')"
    />
    <div v-for="(item, index) in awards" :key="index" class="award-item">
      <span class="award-name">{{ resolveLocalizedText(item.title, props.locale) }}</span>
      <span class="award-level" v-if="resolveLocalizedText(item.issuer, props.locale)">{{
        resolveLocalizedText(item.issuer, props.locale)
      }}</span>
      <span class="award-level" v-if="resolveLocalizedText(item.level, props.locale)">{{
        resolveLocalizedText(item.level, props.locale)
      }}</span>
      <span class="award-level" v-if="resolveLocalizedText(item.category, props.locale)">{{
        resolveLocalizedText(item.category, props.locale)
      }}</span>
      <span class="award-time" v-if="item.date">{{ item.date }}</span>
    </div>
  </div>
</template>
<style scoped>
.award-shell {
  width: 100%;

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
  .award-item {
    margin: 5px 0;
    font-size: var(--resume-text-base, 14px);
  }

  .award-name {
    font-size: var(--resume-text-base, 14px);
  }
}
</style>
