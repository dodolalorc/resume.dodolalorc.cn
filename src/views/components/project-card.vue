<script setup lang="ts">
import type { Project, ResumeLocale } from '@/types/resume'
import type { ResumeThemeSectionTitleStyle } from '@/themes/types'
import SectionHeaderBar from '@/views/components/common/section-header-bar.vue'
import { renderInlineMarkdown, resolveLocalizedText } from '@/utils/localized'

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

const projects = defineModel<Project[]>('projects', {
  type: Array as () => Project[],
  required: true,
  default: () => [],
})

const isResearchTheme = () => props.themeKey === 'research-scholar'
</script>
<template>
  <div class="project-shell" :class="{ 'is-research': isResearchTheme() }">
    <SectionHeaderBar
      title="项目经历"
      :editable="editable"
      :enable-title-background="enableTitleBackground"
      :title-style="titleStyle"
      @edit="emit('edit')"
    />
    <div v-for="(item, index) in projects" :key="index" class="project-item">
      <span class="project-name">{{ resolveLocalizedText(item.name, props.locale) }}</span>
      <span class="project-time">{{ item.projectTime?.join(' - ') }}</span>
      <span class="project-role">{{ resolveLocalizedText(item.role, props.locale) }}</span>
      <template v-if="isResearchTheme()">
        <span v-if="resolveLocalizedText(item.authorRank, props.locale)" class="project-role">{{
          resolveLocalizedText(item.authorRank, props.locale)
        }}</span>
        <span v-if="resolveLocalizedText(item.venue, props.locale)" class="project-role">{{
          resolveLocalizedText(item.venue, props.locale)
        }}</span>
        <span v-if="resolveLocalizedText(item.status, props.locale)" class="project-role">{{
          resolveLocalizedText(item.status, props.locale)
        }}</span>
      </template>
      <span v-if="item.link?.url?.trim()" class="project-link">
        <span>链接：</span>
        <a :href="item.link.url" target="_blank" rel="noopener noreferrer">
          {{ resolveLocalizedText(item.link.label, props.locale) || item.link.url }}
        </a>
      </span>

      <div v-if="item.techStack && item.techStack.length" class="project-row">
        <span class="project-item-title">技术栈和框架：</span>
        <span class="project-content project-item-stack">{{ item.techStack.join(', ') }}</span>
      </div>
      <div v-if="item.projectDesc" class="project-row">
        <span class="project-item-title">项目描述：</span>
        <span
          class="project-content"
          v-html="renderInlineMarkdown(item.projectDesc, props.locale)"
        />
      </div>
      <div v-if="item.mainWork && item.mainWork.length" class="project-row">
        <span class="project-item-title">主要工作：</span>
        <div class="project-content">
          <div v-for="(work, index) in item.mainWork" :key="index" class="project-main-work-item">
            <span
              class="project-main-work-title"
              v-if="resolveLocalizedText(work.title, props.locale)"
              >{{ resolveLocalizedText(work.title, props.locale) }}:
            </span>
            <span v-html="renderInlineMarkdown(work.desc, props.locale)"></span>
          </div>
        </div>
      </div>
      <div v-if="item.projectAchievements && item.projectAchievements.length" class="project-row">
        <span class="project-item-title">项目成就：</span>
        <span class="project-content">{{
          item.projectAchievements
            .map((achievement) => resolveLocalizedText(achievement, props.locale))
            .filter(Boolean)
            .join(', ')
        }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.project-shell {
  width: 100%;

  .project-item {
    margin: var(--resume-section-gap, 8px) 0;

    .project-name {
      font-size: var(--resume-text-lg, 18px);
      font-weight: bold;
    }

    .project-link {
      margin-left: 10px;
      font-size: var(--resume-text-base, 15px);
      color: #666;
    }

    .project-role {
      margin-left: 10px;
      font-size: var(--resume-text-base, 15px);
      color: #666;
    }

    .project-time {
      float: right;
      font-size: var(--resume-text-sm, 13px);
      color: #999;
    }

    .project-row {
      display: flex;
      margin-top: 4px;
      font-size: var(--resume-text-base, 15px);
      width: 100%;

      .project-item-title {
        min-width: 90px;
        color: black;
        font-size: var(--resume-text-base, 15px);
        font-weight: bold;
      }

      .project-content {
        flex: 1;
      }

      .project-item-stack {
        color: #666;
      }

      .project-main-work-item {
        .project-main-work-title {
          font-weight: bold;
        }
      }
    }
  }
}

.project-shell.is-research {
  .project-item {
    margin: 6px 0 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #ddd;
  }

  .project-name {
    font-size: var(--resume-text-base, 14px);
  }

  .project-role,
  .project-link,
  .project-time {
    color: #333;
  }

  .project-row {
    margin-top: 5px;
    line-height: 1.55;
  }
}
</style>
