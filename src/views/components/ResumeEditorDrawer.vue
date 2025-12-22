<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

const inputClass = computed(
  () =>
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30',
)
const textareaClass = computed(() => `${inputClass.value} min-h-[96px] resize-vertical`)
const cardClass = 'rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm'
const pillBtn =
  'rounded-full px-3 py-1 text-sm transition bg-slate-100 text-slate-600 hover:bg-slate-200'
const pillBtnActive =
  'rounded-full px-3 py-1 text-sm transition bg-[var(--color-primary)] text-white shadow'
const ghostBtn =
  'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
const primaryBtn =
  'inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg'

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
    <div v-if="open" class="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur">
      <div class="flex h-full w-full max-w-180 flex-col bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <span
              class="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]"
              >{{ $t('actions.editMode') }}
            </span>
            <div class="flex gap-2 text-sm font-medium text-slate-600">
              <button
                v-for="item in ['profile', 'education', 'experience', 'projects', 'awards']"
                :key="item"
                :class="section === (item as EditorSection) ? pillBtnActive : pillBtn"
                class="capitalize"
                @click="section = item as EditorSection"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <button :class="ghostBtn" @click="open = false">{{ $t('actions.closeEdit') }}</button>
        </div>

        <div class="h-[80vh] overflow-y-auto px-6 py-4">
          <div v-if="section === 'profile'" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
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
            <div class="grid gap-4 md:grid-cols-3">
              <FormInput v-model="jobIntention().city" label="意向城市" />
              <FormInput v-model="jobIntention().position" label="意向职位" />
              <FormInput v-model="jobIntention().salary" label="期望薪资" />
            </div>
          </div>

          <div v-else-if="section === 'education'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-800">教育经历</h3>
              <button :class="primaryBtn" @click="addEducation">新增</button>
            </div>
            <div v-for="(item, idx) in educationList()" :key="idx" :class="cardClass">
              <div class="flex items-center justify-between text-sm text-slate-500">
                <span>第 {{ idx + 1 }} 条</span>
                <button :class="ghostBtn" @click="removeItem(educationList(), idx)">删除</button>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <FormInput v-model="item.school" label="学校" />
                <FormInput v-model="item.degree" label="学位" />
                <FormInput v-model="item.major" label="专业" />
                <div class="grid grid-cols-2 gap-3">
                  <FormInput v-model="ensureEduTime(item)[0]" label="开始时间" />
                  <FormInput v-model="ensureEduTime(item)[1]" label="结束时间" />
                </div>
                <FormInput
                  v-model="item.eduDesc"
                  label="描述 (支持 markdown)"
                  textarea
                  :rows="3"
                  class="md:col-span-2"
                />
              </div>
            </div>
          </div>

          <div v-else-if="section === 'experience'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-800">工作经历</h3>
              <button :class="primaryBtn" @click="addExperience">新增</button>
            </div>
            <div v-for="(item, idx) in experienceList()" :key="idx" :class="cardClass">
              <div class="flex items-center justify-between text-sm text-slate-500">
                <span>第 {{ idx + 1 }} 条</span>
                <button :class="ghostBtn" @click="removeItem(experienceList(), idx)">删除</button>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <FormInput v-model="item.company" label="公司" />
                <FormInput v-model="item.partment" label="部门" />
                <FormInput v-model="item.jobTitle" label="职位" />
                <div class="grid grid-cols-2 gap-3">
                  <FormInput v-model="ensureJobTime(item)[0]" label="开始时间" />
                  <FormInput v-model="ensureJobTime(item)[1]" label="结束时间" />
                </div>
                <div class="md:col-span-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">工作内容</span>
                    <button :class="ghostBtn" @click="promptAdd(ensureJobDesc(item))">
                      添加一条
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(desc, dIdx) in ensureJobDesc(item)"
                      :key="dIdx"
                      class="flex items-start gap-2"
                    >
                      <textarea
                        v-model="ensureJobDesc(item)[dIdx]"
                        :class="textareaClass"
                        class="flex-1"
                        rows="2"
                      ></textarea>
                      <button :class="ghostBtn" @click="removeItem(ensureJobDesc(item), dIdx)">
                        删
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="section === 'projects'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-800">项目经历</h3>
              <button :class="primaryBtn" @click="addProject">新增</button>
            </div>
            <div v-for="(item, idx) in projectList()" :key="idx" :class="cardClass">
              <div class="flex items-center justify-between text-sm text-slate-500">
                <span>第 {{ idx + 1 }} 条</span>
                <button :class="ghostBtn" @click="removeItem(projectList(), idx)">删除</button>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <FormInput v-model="item.name" label="名称" />
                <FormInput v-model="item.role" label="角色" />
                <FormInput v-model="item.link" label="链接" />
                <div class="grid grid-cols-2 gap-3">
                  <FormInput v-model="ensureProjectTime(item)[0]" label="开始时间" />
                  <FormInput v-model="ensureProjectTime(item)[1]" label="结束时间" />
                </div>
                <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                  <span>技术栈 (逗号分隔)</span>
                  <input
                    :value="item.techStack?.join(', ')"
                    :class="inputClass"
                    placeholder="Vue, TypeScript, Tailwind"
                    @input="
                      item.techStack = (($event.target as HTMLInputElement).value || '')
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    "
                  />
                </label>
                <FormInput
                  v-model="item.projectDesc"
                  label="描述"
                  textarea
                  :rows="3"
                  class="md:col-span-2"
                />
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">主要工作</span>
                    <button
                      :class="ghostBtn"
                      @click="ensureMainWork(item).push({ title: '', desc: '' })"
                    >
                      新增
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(work, wIdx) in ensureMainWork(item)"
                      :key="wIdx"
                      class="rounded-lg border border-slate-200 p-3"
                    >
                      <FormInput v-model="work.title" label="标题" />
                      <FormInput v-model="work.desc" label="描述" textarea :rows="2" />
                      <button :class="ghostBtn" @click="removeItem(ensureMainWork(item), wIdx)">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">项目成果</span>
                    <button :class="ghostBtn" @click="promptAdd(ensureProjectAchievements(item))">
                      新增
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(ach, aIdx) in ensureProjectAchievements(item)"
                      :key="aIdx"
                      class="flex items-start gap-2"
                    >
                      <textarea
                        v-model="ensureProjectAchievements(item)[aIdx]"
                        :class="textareaClass"
                        class="flex-1"
                        rows="2"
                      ></textarea>
                      <button
                        :class="ghostBtn"
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

          <div v-else-if="section === 'awards'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-800">奖项</h3>
              <button :class="primaryBtn" @click="addAward">新增</button>
            </div>
            <div v-for="(item, idx) in awardList()" :key="idx" :class="cardClass">
              <div class="flex items-center justify-between text-sm text-slate-500">
                <span>第 {{ idx + 1 }} 条</span>
                <button :class="ghostBtn" @click="removeItem(awardList(), idx)">删除</button>
              </div>
              <div class="grid gap-3 md:grid-cols-3">
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
</style>
