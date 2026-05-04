<script setup lang="ts">
import type { ExperienceConfig, ResumeLocale } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedText } from '@/utils/localized'

const props = withDefaults(defineProps<{
  editable?: boolean
  locale?: ResumeLocale
  themeKey?: string
  enableTitleBackground?: boolean
}>(), {
  locale: 'zh',
  themeKey: '',
  enableTitleBackground: false,
})

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const experience = defineModel<ExperienceConfig[]>('experience', {
  type: Array as () => ExperienceConfig[],
  required: true,
  default: () => [],
})

const isResearchTheme = () => props.themeKey === 'research-scholar'
const skills = () => experience.value.filter((item) => item.kind === 'skills')
const campus = () => experience.value.filter((item) => item.kind === 'campus')
</script>
<template>
  <div class="exp-shell" :class="{ 'is-research': isResearchTheme() }">
    <template v-if="isResearchTheme()">
      <div v-if="skills().length" class="research-section">
        <div class="exp-header">
          <h2 class="exp-title" :class="{ 'with-background': enableTitleBackground }">掌握技能</h2>
          <hr class="exp-divider" />
          <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
            <IconLogo name="edit" />
          </button>
        </div>
        <div v-for="(item, index) in skills()" :key="`skill-${index}`" class="research-list-item">
          <strong v-if="resolveLocalizedText(item.title || item.jobTitle, props.locale)">
            {{ resolveLocalizedText(item.title || item.jobTitle, props.locale) }}：
          </strong>
          <span>{{ (item.jobDesc ?? []).map((desc) => resolveLocalizedText(desc, props.locale)).filter(Boolean).join('；') }}</span>
        </div>
      </div>

      <div v-if="campus().length" class="research-section">
        <div class="exp-header">
          <h2 class="exp-title" :class="{ 'with-background': enableTitleBackground }">校园经历</h2>
          <hr class="exp-divider" />
          <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
            <IconLogo name="edit" />
          </button>
        </div>
        <div v-for="(item, index) in campus()" :key="`campus-${index}`" class="research-list-item">
          <strong v-if="resolveLocalizedText(item.title || item.jobTitle, props.locale)">
            {{ resolveLocalizedText(item.title || item.jobTitle, props.locale) }}：
          </strong>
          <span>{{ (item.jobDesc ?? []).map((desc) => resolveLocalizedText(desc, props.locale)).filter(Boolean).join('；') }}</span>
        </div>
      </div>
    </template>
    <template v-else>
    <div class="exp-header">
      <h2 class="exp-title" :class="{ 'with-background': enableTitleBackground }">工作经历</h2>
      <hr class="exp-divider" />
      <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
        <IconLogo name="edit" />
      </button>
    </div>
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
    </template>
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
      padding: 0;
      
      &.with-background {
        display: inline-block;
        background-color: color-mix(in srgb, var(--color-primary) 12%, white);
        padding: 2px 8px;
        border-radius: 3px;
      }
    }

    .exp-divider {
      flex: 1;
      height: 1px;
      background-color: #eee;
      margin-left: 20px;
      border: 0;
      align-self: flex-end;
      margin-bottom: 0.35em;
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
      font-size: var(--resume-text-base, 15px);
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

.exp-shell.is-research {
  .research-section {
    margin-top: var(--resume-section-gap, 7px);
  }

  .exp-header {
    margin: 0 0 4px;
    border-bottom: 1px solid #111;
    justify-content: space-between;
  }

  .exp-title {
    font-size: var(--resume-text-lg, 16px);
  }

  .exp-divider {
    display: none;
  }

  .research-list-item {
    padding: 5px 0;
    border-bottom: 1px solid #ddd;
    font-size: var(--resume-text-base, 14px);
    line-height: 1.55;
  }
}
</style>
