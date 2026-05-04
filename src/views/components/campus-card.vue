<script setup lang="ts">
import type { CampusItem, ResumeLocale } from '@/types/resume'
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

const campus = defineModel<CampusItem[]>('campus', {
  type: Array as () => CampusItem[],
  required: true,
  default: () => [],
})
</script>

<template>
  <div class="campus-shell">
    <SectionHeaderBar
      title="校园经历"
      :editable="editable"
      :enable-title-background="enableTitleBackground"
      :title-style="titleStyle"
      @edit="emit('edit')"
    />
    <div v-for="(item, index) in campus" :key="index" class="campus-item">
      <strong v-if="resolveLocalizedText(item.title, props.locale)">
        {{ resolveLocalizedText(item.title, props.locale) }}：
      </strong>
      <span v-if="item.jobTime?.length" class="campus-time">
        （{{ item.jobTime.filter(Boolean).join(' - ') }}）
      </span>
      <div class="campus-desc">
        {{
          (item.jobDesc ?? [])
            .map((desc) => resolveLocalizedText(desc, props.locale))
            .filter(Boolean)
            .join('；')
        }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.campus-shell {
  width: 100%;

  .campus-item {
    margin: var(--resume-section-gap, 8px) 0;
    font-size: var(--resume-text-base, 14px);
    line-height: 1.6;
    color: var(--resume-theme-text);

    .campus-time {
      font-size: var(--resume-text-sm, 12px);
      color: var(--resume-theme-muted, #888);
      margin-left: 4px;
    }

    .campus-desc {
      margin-top: 2px;
    }
  }
}
</style>
