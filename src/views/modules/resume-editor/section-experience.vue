<script setup lang="ts">
import type { ExperienceConfig, ResumeConfig } from '@/types/resume'
import FormInput from '../../components/form-input.vue'

const resume = defineModel<ResumeConfig>('resume', { required: true })

const experienceList = () => (resume.value.experience ??= [])
const ensureJobTime = (item: ExperienceConfig) => (item.jobTime ??= ['', ''])
const ensureJobDesc = (item: ExperienceConfig) => (item.jobDesc ??= [''])

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
      <button class="paper-btn" @click="addExperience">新增</button>
    </div>

    <div v-for="(item, idx) in experienceList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="paper-btn ghost" @click="removeExperience(idx)">删除</button>
      </div>

      <div class="form-grid">
        <FormInput v-model="item.company" label="公司" />
        <FormInput v-model="item.partment" label="部门" />
        <FormInput v-model="item.jobTitle" label="职位" />
        <div class="time-grid">
          <FormInput v-model="ensureJobTime(item)[0]" label="开始时间" />
          <FormInput v-model="ensureJobTime(item)[1]" label="结束时间" />
        </div>
        <div class="full-width">
          <div class="list-header">
            <span class="list-title">工作内容</span>
            <button class="paper-btn ghost" @click="addDesc(item)">添加一条</button>
          </div>
          <div class="list-items">
            <div v-for="(desc, dIdx) in ensureJobDesc(item)" :key="dIdx" class="list-item">
              <textarea
                v-model="ensureJobDesc(item)[dIdx]"
                class="form-textarea"
                rows="2"
              ></textarea>
              <button class="paper-btn ghost" @click="removeDesc(item, dIdx)">删</button>
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
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.form-textarea:focus {
  border-color: #9c8f7a;
  outline: none;
  box-shadow: 0 0 0 2px rgba(156, 143, 122, 0.2);
}

.form-textarea::placeholder {
  color: #b0a898;
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
