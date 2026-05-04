<script setup lang="ts">
import type { EducationConfig, ResumeLocale } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedList, resolveLocalizedText } from '@/utils/localized'

const props = withDefaults(
  defineProps<{
    editable?: boolean
    locale?: ResumeLocale
    themeKey?: string
    enableTitleBackground?: boolean
  }>(),
  {
    locale: 'zh',
    themeKey: '',
    enableTitleBackground: false,
  },
)

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const edu = defineModel<EducationConfig[]>('education', {
  type: Array as () => EducationConfig[],
  required: true,
  default: () => [],
})

const isResearchTheme = () => props.themeKey === 'research-scholar'
const courseText = (item: EducationConfig) =>
  (item.courses ?? [])
    .map((course) => {
      const name = resolveLocalizedText(course.name, props.locale)
      const grade = resolveLocalizedText(course.grade, props.locale)
      if (!name) return ''
      return grade ? `${name}(${grade})` : name
    })
    .filter(Boolean)
    .join('，')
</script>
<template>
  <div class="edu-shell" :class="{ 'is-research': isResearchTheme() }">
    <div
      class="edu-header resume-section-header"
      :class="{ 'has-title-background': enableTitleBackground }"
    >
      <h2
        class="edu-title resume-section-title"
        :class="{ 'with-background': enableTitleBackground }"
      >
        教育经历
      </h2>
      <hr
        class="edu-divider resume-section-divider"
        :class="{ 'with-background': enableTitleBackground }"
      />
      <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
        <IconLogo name="edit" />
      </button>
    </div>
    <div v-for="(item, index) in edu" :key="index" class="edu-item">
      <span class="edu-school">{{ resolveLocalizedText(item.school, props.locale) }}</span>
      <span
        v-for="tag in resolveLocalizedList(item.schoolTags, props.locale)"
        :key="tag"
        class="edu-tag"
        >{{ tag }}</span
      >
      <span class="edu-time">{{ item.eduTime?.join(' - ') }}</span>
      <span class="edu-degree">{{ resolveLocalizedText(item.degree, props.locale) }}</span>
      <span class="edu-major">{{ resolveLocalizedText(item.major, props.locale) }}</span>
      <span
        v-for="tag in resolveLocalizedList(item.majorTags, props.locale)"
        :key="tag"
        class="edu-tag major-tag"
        >{{ tag }}</span
      >
      <div class="edu-desc" v-html="resolveLocalizedText(item.eduDesc, props.locale)"></div>
      <template v-if="isResearchTheme()">
        <div class="edu-research-meta">
          <span v-if="resolveLocalizedText(item.gpa, props.locale)"
            >GPA：{{ resolveLocalizedText(item.gpa, props.locale) }}</span
          >
          <span v-if="resolveLocalizedText(item.ranking, props.locale)"
            >排名：{{ resolveLocalizedText(item.ranking, props.locale) }}</span
          >
          <span v-if="resolveLocalizedList(item.languageCertificates, props.locale).length">
            语言证书：{{ resolveLocalizedList(item.languageCertificates, props.locale).join('，') }}
          </span>
        </div>
        <div v-if="courseText(item)" class="edu-courses">
          <strong>主修课程：</strong>{{ courseText(item) }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.edu-shell {
  width: 100%;
  .edu-header {
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

  .edu-item {
    margin: var(--resume-block-gap, 10px) 0;
    .edu-school {
      font-size: var(--resume-text-lg, 18px);
      font-weight: bold;
    }
    .edu-tag {
      display: inline-block;
      margin-left: 6px;
      padding: 1px 6px;
      border: 1px solid color-mix(in srgb, var(--color-primary) 24%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--color-primary) 8%, white);
      color: var(--color-primary);
      font-size: calc(11px * var(--resume-font-scale, 1));
      font-weight: 600;
      line-height: 1.35;
      vertical-align: 0.08em;
    }
    .major-tag {
      color: #666;
      border-color: #d6d0c4;
      background: #fffdf7;
    }
    .edu-time {
      margin-left: 10px;
      color: #666;
      font-size: var(--resume-text-sm, 13px);
    }
    .edu-degree {
      display: inline-block;
      margin-left: 10px;
      color: #666;
      /* background: #f3f3f3; */
      border-radius: 12px;
      padding: 2px 10px;
      font-size: var(--resume-text-sm, 13px);
      line-height: 1.2;
      /* border: 1px solid #e0e0e0; */
    }
    .edu-major {
      margin-left: 10px;
      color: #666;
      font-size: var(--resume-text-sm, 13px);
    }
    .edu-desc {
      margin-top: 8px;
      line-height: 1.6;
      font-size: var(--resume-text-base, 15px);
      color: #333;

      :deep(*) {
        font-size: inherit;
      }
    }
  }
}

.edu-shell.is-research {
  .edu-header {
    margin: var(--resume-section-gap, 7px) 0 4px;
    border-bottom: 1px solid #111;
    justify-content: space-between;
  }

  .edu-title {
    font-size: var(--resume-text-lg, 16px);
  }

  .edu-divider {
    display: none;
  }

  .edu-item {
    margin: 6px 0 0;
  }

  .edu-time {
    float: right;
  }

  .edu-tag,
  .major-tag {
    border-color: #111;
    background: #fff;
    color: #111;
    border-radius: 0;
  }

  .edu-research-meta,
  .edu-courses {
    margin-top: 4px;
    font-size: var(--resume-text-base, 14px);
    color: #222;
    line-height: 1.55;
  }

  .edu-research-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
  }

  .edu-research-meta span:not(:last-child)::after {
    content: '|';
    margin-left: 8px;
    color: #555;
  }
}
</style>
