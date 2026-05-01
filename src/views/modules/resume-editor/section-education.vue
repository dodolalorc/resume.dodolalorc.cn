<script setup lang="ts">
import type { EducationConfig, ResumeConfig, ResumeLocale } from '@/types/resume'
import FormInput from '../../components/form-input.vue'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedList, resolveLocalizedText, setLocalizedText, splitTags } from '@/utils/localized'

const props = defineProps<{
  locale: ResumeLocale
}>()

const resume = defineModel<ResumeConfig>('resume', { required: true })

const educationList = () => (resume.value.education ??= [])
const ensureEduTime = (item: EducationConfig) => (item.eduTime ??= ['', ''])
const fieldText = (item: EducationConfig, key: keyof EducationConfig) =>
  resolveLocalizedText(item[key] as never, props.locale)
const updateFieldText = (item: EducationConfig, key: keyof EducationConfig, value: string) => {
  setLocalizedText(item as unknown as Record<string, unknown>, key, props.locale, value)
}
const tagText = (tags: EducationConfig['schoolTags']) =>
  resolveLocalizedList(tags, props.locale).join('，')
const updateTags = (
  item: EducationConfig,
  key: 'schoolTags' | 'majorTags',
  value: string,
) => {
  item[key] = splitTags(value)
}
const coursesText = (item: EducationConfig) =>
  (item.courses ?? [])
    .map((course) => {
      const name = resolveLocalizedText(course.name, props.locale)
      const grade = resolveLocalizedText(course.grade, props.locale)
      return grade ? `${name}(${grade})` : name
    })
    .filter(Boolean)
    .join('，')
const updateCourses = (item: EducationConfig, value: string) => {
  item.courses = splitTags(value).map((token) => {
    const match = token.match(/^(.+?)[(（](.+)[)）]$/)
    return match ? { name: match[1].trim(), grade: match[2].trim() } : { name: token }
  })
}

const addEducation = () => {
  educationList().push({
    school: '',
    degree: '',
    major: '',
    schoolTags: [],
    majorTags: [],
    eduTime: ['', ''],
    eduDesc: '',
  } as EducationConfig)
}

const removeItem = (index: number) => {
  educationList().splice(index, 1)
}
</script>

<template>
  <div class="section-content">
    <div class="section-header">
      <h3 class="section-title">教育经历</h3>
      <button class="action-btn add" @click="addEducation">
        <IconLogo name="add" /> 新增
      </button>
    </div>

    <div v-for="(item, idx) in educationList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="action-btn delete" @click="removeItem(idx)">
          <IconLogo name="delete" /> 删除
        </button>
      </div>
      <div class="form-grid">
        <FormInput
          :model-value="fieldText(item, 'school')"
          label="学校"
          @update:model-value="updateFieldText(item, 'school', $event)"
        />
        <FormInput
          :model-value="tagText(item.schoolTags)"
          label="学校标签（逗号分隔）"
          placeholder="985，211，双一流，QS Top 100"
          @update:model-value="updateTags(item, 'schoolTags', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'degree')"
          label="学位"
          @update:model-value="updateFieldText(item, 'degree', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'major')"
          label="专业"
          @update:model-value="updateFieldText(item, 'major', $event)"
        />
        <FormInput
          :model-value="tagText(item.majorTags)"
          label="专业标签（逗号分隔）"
          placeholder="国家级一流专业，王牌专业"
          @update:model-value="updateTags(item, 'majorTags', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'gpa')"
          label="GPA"
          @update:model-value="updateFieldText(item, 'gpa', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'ranking')"
          label="排名"
          @update:model-value="updateFieldText(item, 'ranking', $event)"
        />
        <FormInput
          :model-value="tagText(item.languageCertificates)"
          label="语言证书（逗号分隔）"
          placeholder="CET-4 612，CET-6 568"
          @update:model-value="item.languageCertificates = splitTags($event)"
        />
        <FormInput
          :model-value="coursesText(item)"
          label="主修课程（课程名(成绩)，逗号分隔）"
          placeholder="数据结构(96)，机器学习(94)"
          @update:model-value="updateCourses(item, $event)"
        />
        <div class="time-grid">
          <FormInput v-model="ensureEduTime(item)[0]" label="开始时间" />
          <FormInput v-model="ensureEduTime(item)[1]" label="结束时间" />
        </div>
        <div class="full-width">
          <FormInput
            :model-value="fieldText(item, 'eduDesc')"
            label="描述（支持 markdown）"
            textarea
            :rows="3"
            @update:model-value="updateFieldText(item, 'eduDesc', $event)"
          />
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
.card-header {
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

.action-btn {
  display: inline-flex;
  align-items: center;
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
</style>
