<script setup lang="ts">
import { onMounted } from 'vue'
import type {
  ResumeConfig,
  EducationConfig,
  ExperienceConfig,
  Project,
  Award,
} from '@/types/resume'
import type { EditorSection } from '@/types/resume'
import FormInput from './FormInput.vue'

const open = defineModel<boolean>('open', { required: true })
const section = defineModel<EditorSection>('section', { required: true })
const resume = defineModel<ResumeConfig>('resume', { required: true })

const profileAvatar = () => (resume.value.profile.avatar ??= { url: '', rounded: true, size: 140 })
const jobIntention = () =>
  (resume.value.profile.jobIntention ??= { city: '', position: '', salary: '' })

const educationList = () => (resume.value.education ??= [])
const experienceList = () => (resume.value.experience ??= [])
const projectList = () => (resume.value.projects ??= [])
const awardList = () => (resume.value.awards ??= [])

const ensureEduTime = (item: EducationConfig) => (item.eduTime ??= ['', ''])
const ensureJobTime = (item: ExperienceConfig) => (item.jobTime ??= ['', ''])
const ensureJobDesc = (item: ExperienceConfig) => (item.jobDesc ??= [''])
const ensureProjectTime = (item: Project) => (item.projectTime ??= ['', ''])
const ensureProjectAchievements = (item: Project) => (item.projectAchievements ??= [])
const ensureMainWork = (item: Project) => (item.mainWork ??= [])

const normalize = () => {
  resume.value.profile.avatar ??= { url: '', rounded: true, size: 140 }
  resume.value.profile.jobIntention ??= { city: '', position: '', salary: '' }
  resume.value.profile.prepend ??= 'both'

  resume.value.education ??= []
  resume.value.experience ??= []
  resume.value.projects ??= []
  resume.value.awards ??= []

  resume.value.education.forEach((item) => {
    item.eduTime ??= ['', '']
  })
  resume.value.experience.forEach((item) => {
    item.jobTime ??= ['', '']
    item.jobDesc ??= ['']
  })
  resume.value.projects.forEach((item) => {
    item.projectTime ??= ['', '']
    item.techStack ??= []
    item.projectAchievements ??= []
    item.mainWork ??= []
  })
  resume.value.awards.forEach((item) => {
    item.level ??= ''
    item.date ??= ''
  })
}

onMounted(normalize)

const addEducation = () => {
  resume.value.education.push({
    school: '',
    degree: '',
    major: '',
    eduTime: ['', ''],
    eduDesc: '',
  } as EducationConfig)
}

const addExperience = () => {
  resume.value.experience.push({
    company: '',
    partment: '',
    jobTitle: '',
    jobTime: ['', ''],
    jobDesc: [''],
  } as ExperienceConfig)
}

const addProject = () => {
  resume.value.projects ??= []
  resume.value.projects.push({
    name: '',
    role: '',
    link: '',
    techStack: [],
    projectTime: ['', ''],
    projectDesc: '',
    projectAchievements: [],
    mainWork: [],
  } as Project)
}

const addAward = () => {
  resume.value.awards ??= []
  resume.value.awards.push({ title: '', level: '', date: '' } as Award)
}

const removeItem = <T,>(list: T[] | undefined, index: number) => {
  if (!list) return
  list.splice(index, 1)
}

const promptAdd = (list: string[] | undefined) => {
  if (!list) return
  list.push('')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="drawer-overlay">
      <div class="drawer-container">
        <div class="drawer-header">
          <div class="header-left">
            <span class="edit-mode-badge">{{ $t('actions.editMode') }}</span>
            <div class="nav-buttons">
              <button
                v-for="item in ['profile', 'education', 'experience', 'projects', 'awards']"
                :key="item"
                :class="['nav-button', section === (item as EditorSection) ? 'active' : '']"
                @click="section = item as EditorSection"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <button class="ghost-btn" @click="open = false">{{ $t('actions.closeEdit') }}</button>
        </div>

        <div class="drawer-content">
          <div v-if="section === 'profile'" class="section-content">
            <div class="form-grid">
              <FormInput v-model="resume.profile.name" label="姓名" placeholder="Your name" />
              <FormInput
                v-model="profileAvatar().url"
                label="头像 URL"
                type="url"
                placeholder="https://"
              />
              <FormInput v-model="resume.profile.email" label="邮箱" type="email" />
              <FormInput v-model="resume.profile.phone" label="电话" />
              <FormInput v-model="resume.profile.github" label="GitHub" type="url" />
              <FormInput v-model="resume.profile.blog" label="博客" type="url" />
              <FormInput v-model="resume.profile.wechat" label="微信" />
              <FormInput v-model="resume.profile.workExpYear" label="工作年限" />
            </div>
            <div class="form-grid-3">
              <FormInput v-model="jobIntention().city" label="意向城市" />
              <FormInput v-model="jobIntention().position" label="意向职位" />
              <FormInput v-model="jobIntention().salary" label="期望薪资" />
            </div>
          </div>

          <div v-else-if="section === 'education'" class="section-content">
            <div class="section-header">
              <h3 class="section-title">教育经历</h3>
              <button class="primary-btn" @click="addEducation">新增</button>
            </div>
            <div v-for="(item, idx) in educationList()" :key="idx" class="card">
              <div class="card-header">
                <span>第 {{ idx + 1 }} 条</span>
                <button class="ghost-btn" @click="removeItem(educationList(), idx)">删除</button>
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
                  <FormInput
                    v-model="item.eduDesc"
                    label="描述 (支持 markdown)"
                    textarea
                    :rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="section === 'experience'" class="section-content">
            <div class="section-header">
              <h3 class="section-title">工作经历</h3>
              <button class="primary-btn" @click="addExperience">新增</button>
            </div>
            <div v-for="(item, idx) in experienceList()" :key="idx" class="card">
              <div class="card-header">
                <span>第 {{ idx + 1 }} 条</span>
                <button class="ghost-btn" @click="removeItem(experienceList(), idx)">删除</button>
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
                    <button class="ghost-btn" @click="promptAdd(ensureJobDesc(item))">
                      添加一条
                    </button>
                  </div>
                  <div class="list-items">
                    <div
                      v-for="(desc, dIdx) in ensureJobDesc(item)"
                      :key="dIdx"
                      class="list-item"
                    >
                      <textarea
                        v-model="ensureJobDesc(item)[dIdx]"
                        class="form-textarea flex-1"
                        rows="2"
                      ></textarea>
                      <button class="ghost-btn" @click="removeItem(ensureJobDesc(item), dIdx)">
                        删
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="section === 'projects'" class="section-content">
            <div class="section-header">
              <h3 class="section-title">项目经历</h3>
              <button class="primary-btn" @click="addProject">新增</button>
            </div>
            <div v-for="(item, idx) in projectList()" :key="idx" class="card">
              <div class="card-header">
                <span>第 {{ idx + 1 }} 条</span>
                <button class="ghost-btn" @click="removeItem(projectList(), idx)">删除</button>
              </div>
              <div class="form-grid">
                <FormInput v-model="item.name" label="名称" />
                <FormInput v-model="item.role" label="角色" />
                <FormInput v-model="item.link" label="链接" />
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
                  <FormInput
                    v-model="item.projectDesc"
                    label="描述"
                    textarea
                    :rows="3"
                  />
                </div>
              </div>
              <div class="project-details">
                <div>
                  <div class="list-header">
                    <span class="list-title">主要工作</span>
                    <button
                      class="ghost-btn"
                      @click="ensureMainWork(item).push({ title: '', desc: '' })"
                    >
                      新增
                    </button>
                  </div>
                  <div class="list-items">
                    <div
                      v-for="(work, wIdx) in ensureMainWork(item)"
                      :key="wIdx"
                      class="work-item"
                    >
                      <FormInput v-model="work.title" label="标题" />
                      <FormInput v-model="work.desc" label="描述" textarea :rows="2" />
                      <button class="ghost-btn" @click="removeItem(ensureMainWork(item), wIdx)">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="list-header">
                    <span class="list-title">项目成果</span>
                    <button class="ghost-btn" @click="promptAdd(ensureProjectAchievements(item))">
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
                        class="form-textarea flex-1"
                        rows="2"
                      ></textarea>
                      <button
                        class="ghost-btn"
                        @click="removeItem(ensureProjectAchievements(item), aIdx)"
                      >
                        删
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="section === 'awards'" class="section-content">
            <div class="section-header">
              <h3 class="section-title">奖项</h3>
              <button class="primary-btn" @click="addAward">新增</button>
            </div>
            <div v-for="(item, idx) in awardList()" :key="idx" class="card">
              <div class="card-header">
                <span>第 {{ idx + 1 }} 条</span>
                <button class="ghost-btn" @click="removeItem(awardList(), idx)">删除</button>
              </div>
              <div class="form-grid-3">
                <FormInput v-model="item.title" label="名称" />
                <FormInput v-model="item.level" label="等级" />
                <FormInput v-model="item.date" label="时间" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
}

.drawer-container {
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 45rem;
  flex-direction: column;
  background-color: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.edit-mode-badge {
  border-radius: 9999px;
  background-color: rgba(var(--color-primary-rgb, 34, 197, 94), 0.1);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.nav-button {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  text-transform: capitalize;
  transition: all 0.2s;
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #e2e8f0;
}

.nav-button.active {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background-color: white;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
}

.ghost-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background-color: var(--color-primary);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  cursor: pointer;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.drawer-content {
  height: 80vh;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.card {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-grid-3 {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .form-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.form-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 34, 197, 94), 0.3);
}

.form-textarea {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #1e293b;
  min-height: 96px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 34, 197, 94), 0.3);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.list-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.project-details {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

@media (min-width: 768px) {
  .project-details {
    grid-template-columns: repeat(2, 1fr);
  }
}

.work-item {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
