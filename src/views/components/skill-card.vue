<script setup lang="ts">
import type { SkillItem, ResumeLocale } from '@/types/resume'
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

const skills = defineModel<SkillItem[]>('skills', {
  type: Array as () => SkillItem[],
  required: true,
  default: () => [],
})
</script>

<template>
  <div class="skill-shell">
    <SectionHeaderBar
      title="掌握技能"
      :editable="editable"
      :enable-title-background="enableTitleBackground"
      :title-style="titleStyle"
      @edit="emit('edit')"
    />
    <div v-for="(item, index) in skills" :key="index" class="skill-item">
      <strong v-if="resolveLocalizedText(item.title, props.locale)">
        {{ resolveLocalizedText(item.title, props.locale) }}：
      </strong>
      <span>{{
        (item.jobDesc ?? [])
          .map((desc) => resolveLocalizedText(desc, props.locale))
          .filter(Boolean)
          .join('；')
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.skill-shell {
  width: 100%;

  .skill-item {
    margin: var(--resume-section-gap, 8px) 0;
    font-size: var(--resume-text-base, 14px);
    line-height: 1.6;
    color: var(--resume-theme-text);
  }
}
</style>
