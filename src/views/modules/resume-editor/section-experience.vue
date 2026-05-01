<script setup lang="ts">
import type { ExperienceConfig, ResumeConfig, ResumeLocale } from '@/types/resume'
import FormInput from '../../components/form-input.vue'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedText, setLocalizedText } from '@/utils/localized'

const props = defineProps<{
  locale: ResumeLocale
}>()

const resume = defineModel<ResumeConfig>('resume', { required: true })

const experienceList = () => (resume.value.experience ??= [])
const ensureJobTime = (item: ExperienceConfig) => (item.jobTime ??= ['', ''])
const ensureJobDesc = (item: ExperienceConfig) => (item.jobDesc ??= [''])
const fieldText = (item: ExperienceConfig, key: keyof ExperienceConfig) =>
  resolveLocalizedText(item[key] as never, props.locale)
const updateFieldText = (item: ExperienceConfig, key: keyof ExperienceConfig, value: string) => {
  setLocalizedText(item as unknown as Record<string, unknown>, key, props.locale, value)
}
const descText = (item: ExperienceConfig, index: number) =>
  resolveLocalizedText(ensureJobDesc(item)[index], props.locale)
const updateDesc = (item: ExperienceConfig, index: number, value: string) => {
  const current = ensureJobDesc(item)[index]
  if (props.locale === 'zh' && typeof current !== 'object') {
    ensureJobDesc(item)[index] = value
    return
  }
  const next = typeof current === 'object' ? { ...current } : { zh: current || '' }
  next[props.locale] = value
  ensureJobDesc(item)[index] = next
}

const addExperience = () => {
  experienceList().push({
    company: '',
    partment: '',
    jobTitle: '',
    jobTime: ['', ''],
    jobDesc: [''],
  } as ExperienceConfig)
}

const removeExperience = (index: number) => {
  experienceList().splice(index, 1)
}

const addDesc = (item: ExperienceConfig) => {
  ensureJobDesc(item).push('')
}

const removeDesc = (item: ExperienceConfig, index: number) => {
  ensureJobDesc(item).splice(index, 1)
}
</script>

<template>
  <div class="section-content">
    <div class="section-header">
      <h3 class="section-title">工作经历</h3>
      <button class="action-btn add" @click="addExperience">
        <IconLogo name="add" /> 新增
      </button>
    </div>

    <div v-for="(item, idx) in experienceList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="action-btn delete" @click="removeExperience(idx)">
          <IconLogo name="delete" /> 删除
        </button>
      </div>

      <div class="form-grid">
        <FormInput
          :model-value="fieldText(item, 'title')"
          label="科研模块标题"
          placeholder="如：编程与工程工具 / 学院开源社团"
          @update:model-value="updateFieldText(item, 'title', $event)"
        />
        <label class="form-label">
          <span>内容类型</span>
          <select v-model="item.kind" class="form-select">
            <option value="work">工作经历</option>
            <option value="skills">掌握技能</option>
            <option value="campus">校园经历</option>
          </select>
        </label>
        <FormInput
          :model-value="fieldText(item, 'company')"
          label="公司"
          @update:model-value="updateFieldText(item, 'company', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'partment')"
          label="部门"
          @update:model-value="updateFieldText(item, 'partment', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'jobTitle')"
          label="职位"
          @update:model-value="updateFieldText(item, 'jobTitle', $event)"
        />
        <div class="time-grid">
          <FormInput v-model="ensureJobTime(item)[0]" label="开始时间" />
          <FormInput v-model="ensureJobTime(item)[1]" label="结束时间" />
        </div>
        <div class="full-width">
          <div class="list-header">
            <span class="list-title">工作内容</span>
            <button class="action-btn add compact" @click="addDesc(item)">
              <IconLogo name="add" /> 添加一条
            </button>
          </div>
          <div class="list-items">
            <div v-for="(_desc, dIdx) in ensureJobDesc(item)" :key="dIdx" class="list-item">
              <textarea
                :value="descText(item, dIdx)"
                class="form-textarea"
                rows="2"
                @input="updateDesc(item, dIdx, ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
              <button class="action-btn delete icon-only" @click="removeDesc(item, dIdx)">
                <IconLogo name="delete" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header,
.card-header,
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin: 0;
  font-size: 16px;
}

.card {
  border: 1px solid #d6d0c4;
  background: #fff;
  padding: 12px;
}

.card-header {
  margin-bottom: 8px;
  color: #6b665c;
  font-size: 13px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #7a7060;
}

.form-select {
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  padding: 7px 8px;
  font: inherit;
  color: #2f2a24;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.full-width {
  grid-column: 1 / -1;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.list-title {
  font-size: 13px;
  color: #5b5448;
}

.form-textarea {
  flex: 1;
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  padding: 6px 8px;
  min-height: 72px;
  resize: vertical;
  font-size: 13px;
  font-family: inherit;
  color: #2f2a24;
  line-height: 1.5;
  box-sizing: border-box;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #d6d0c4;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn :deep(.icon-logo) {
  width: 14px;
  height: 14px;
  padding: 0;
}

.action-btn.add {
  border-color: #b8d8c0;
  background: #eff8f1;
  color: #25633b;
}

.action-btn.delete {
  border-color: #efc4bd;
  background: #fff1ef;
  color: #a33a2b;
}

.action-btn.compact {
  padding: 4px 10px;
}

.action-btn.icon-only {
  width: 30px;
  height: 30px;
  padding: 0;
  flex: 0 0 auto;
}
</style>
