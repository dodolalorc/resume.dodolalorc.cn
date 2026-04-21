<script setup lang="ts">
import type { EducationConfig, ResumeConfig } from '@/types/resume'
import FormInput from '../../components/form-input.vue'

const resume = defineModel<ResumeConfig>('resume', { required: true })

const educationList = () => (resume.value.education ??= [])
const ensureEduTime = (item: EducationConfig) => (item.eduTime ??= ['', ''])

const addEducation = () => {
  educationList().push({
    school: '',
    degree: '',
    major: '',
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
      <button class="paper-btn" @click="addEducation">新增</button>
    </div>

    <div v-for="(item, idx) in educationList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="paper-btn ghost" @click="removeItem(idx)">删除</button>
      </div>
      <div class="form-grid">
        <FormInput v-model="item.school" label="学校" />
        <FormInput v-model="item.degree" label="学位" />
        <FormInput v-model="item.major" label="专业" />
        <div class="time-grid">
          <FormInput v-model="ensureEduTime(item)[0]" label="开始时间" />
          <FormInput v-model="ensureEduTime(item)[1]" label="结束时间" />
        </div>
        <div class="full-width">
          <FormInput v-model="item.eduDesc" label="描述 (支持 markdown)" textarea :rows="3" />
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

.paper-btn {
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  color: #2f2a24;
  padding: 4px 10px;
  cursor: pointer;
}

.paper-btn.ghost {
  background: #fff;
}
</style>
