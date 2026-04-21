<script setup lang="ts">
import type { Project, ResumeConfig } from '@/types/resume'
import FormInput from '../../components/form-input.vue'

const resume = defineModel<ResumeConfig>('resume', { required: true })

const projectList = () => (resume.value.projects ??= [])
const ensureProjectTime = (item: Project) => (item.projectTime ??= ['', ''])
const ensureProjectAchievements = (item: Project) => (item.projectAchievements ??= [])
const ensureMainWork = (item: Project) => (item.mainWork ??= [])

const addProject = () => {
  projectList().push({
    name: '',
    role: '',
    link: { url: '', label: '' },
    techStack: [],
    projectTime: ['', ''],
    projectDesc: '',
    projectAchievements: [],
    mainWork: [],
  } as Project)
}

const removeProject = (index: number) => {
  projectList().splice(index, 1)
}
</script>

<template>
  <div class="section-content">
    <div class="section-header">
      <h3 class="section-title">项目经历</h3>
      <button class="paper-btn" @click="addProject">新增</button>
    </div>

    <div v-for="(item, idx) in projectList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="paper-btn ghost" @click="removeProject(idx)">删除</button>
      </div>

      <div class="form-grid">
        <FormInput v-model="item.name" label="名称" />
        <FormInput v-model="item.role" label="角色" />
        <FormInput v-model="item.link!.url" label="链接 URL" />
        <FormInput v-model="item.link!.label" label="链接显示文字" />
        <div class="time-grid">
          <FormInput v-model="ensureProjectTime(item)[0]" label="开始时间" />
          <FormInput v-model="ensureProjectTime(item)[1]" label="结束时间" />
        </div>
        <label class="form-label full-width">
          <span>技术栈 (逗号分隔)</span>
          <input
            :value="item.techStack?.join(', ')"
            class="form-input"
            placeholder="Vue, TypeScript, Tailwind"
            @input="
              item.techStack = (($event.target as HTMLInputElement).value || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            "
          />
        </label>
        <div class="full-width">
          <FormInput v-model="item.projectDesc" label="描述" textarea :rows="3" />
        </div>
      </div>

      <div class="project-details">
        <div>
          <div class="list-header">
            <span class="list-title">主要工作</span>
            <button
              class="paper-btn ghost"
              @click="ensureMainWork(item).push({ title: '', desc: '' })"
            >
              新增
            </button>
          </div>
          <div class="list-items">
            <div v-for="(work, wIdx) in ensureMainWork(item)" :key="wIdx" class="work-item">
              <FormInput v-model="work.title" label="标题" />
              <FormInput v-model="work.desc" label="描述" textarea :rows="2" />
              <button class="paper-btn ghost" @click="ensureMainWork(item).splice(wIdx, 1)">
                删除
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="list-header">
            <span class="list-title">项目成果</span>
            <button class="paper-btn ghost" @click="ensureProjectAchievements(item).push('')">
              新增
            </button>
          </div>
          <div class="list-items">
            <div
              v-for="(ach, aIdx) in ensureProjectAchievements(item)"
              :key="aIdx"
              class="list-item"
            >
              <textarea
                v-model="ensureProjectAchievements(item)[aIdx]"
                class="form-textarea"
                rows="2"
              ></textarea>
              <button
                class="paper-btn ghost"
                @click="ensureProjectAchievements(item).splice(aIdx, 1)"
              >
                删
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

.form-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #5b5448;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  padding: 8px;
}

.project-details {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

@media (min-width: 768px) {
  .project-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.list-title {
  font-size: 13px;
  color: #5b5448;
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

.work-item {
  border: 1px solid #d6d0c4;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
