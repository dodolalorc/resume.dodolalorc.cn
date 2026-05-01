<script setup lang="ts">
import type { Project, ResumeConfig, ResumeLocale } from '@/types/resume'
import FormInput from '../../components/form-input.vue'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedText, setLocalizedText } from '@/utils/localized'

const props = defineProps<{
  locale: ResumeLocale
}>()

const resume = defineModel<ResumeConfig>('resume', { required: true })

const projectList = () => (resume.value.projects ??= [])
const ensureProjectTime = (item: Project) => (item.projectTime ??= ['', ''])
const ensureProjectLink = (item: Project) => (item.link ??= { url: '', label: '' })
const ensureProjectAchievements = (item: Project) => (item.projectAchievements ??= [])
const ensureMainWork = (item: Project) => (item.mainWork ??= [])
const fieldText = (item: Project, key: keyof Project) =>
  resolveLocalizedText(item[key] as never, props.locale)
const updateFieldText = (item: Project, key: keyof Project, value: string) => {
  setLocalizedText(item as unknown as Record<string, unknown>, key, props.locale, value)
}
const updateTargetText = (target: Record<string, unknown>, key: string, value: string) => {
  setLocalizedText(target, key, props.locale, value)
}
const listText = (value: Project['projectAchievements'], index: number) =>
  resolveLocalizedText((value ?? [])[index], props.locale)
const updateListText = (item: Project, index: number, value: string) => {
  const list = ensureProjectAchievements(item)
  const current = list[index]
  if (props.locale === 'zh' && typeof current !== 'object') {
    list[index] = value
    return
  }
  const next = typeof current === 'object' ? { ...current } : { zh: current || '' }
  next[props.locale] = value
  list[index] = next
}

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
      <button class="action-btn add" @click="addProject">
        <IconLogo name="add" /> 新增
      </button>
    </div>

    <div v-for="(item, idx) in projectList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="action-btn delete" @click="removeProject(idx)">
          <IconLogo name="delete" /> 删除
        </button>
      </div>

      <div class="form-grid">
        <FormInput
          :model-value="fieldText(item, 'name')"
          label="名称"
          @update:model-value="updateFieldText(item, 'name', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'role')"
          label="角色"
          @update:model-value="updateFieldText(item, 'role', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'authorRank')"
          label="作者排名"
          placeholder="第一作者 / 第二作者"
          @update:model-value="updateFieldText(item, 'authorRank', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'venue')"
          label="会议/期刊/项目来源"
          @update:model-value="updateFieldText(item, 'venue', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'status')"
          label="状态"
          placeholder="录用 / 投稿中 / 结题优秀"
          @update:model-value="updateFieldText(item, 'status', $event)"
        />
        <FormInput v-model="ensureProjectLink(item).url" label="链接 URL" />
        <FormInput
          :model-value="resolveLocalizedText(ensureProjectLink(item).label, props.locale)"
          label="链接显示文字"
          @update:model-value="updateTargetText(ensureProjectLink(item) as unknown as Record<string, unknown>, 'label', $event)"
        />
        <div class="time-grid">
          <FormInput v-model="ensureProjectTime(item)[0]" label="开始时间" />
          <FormInput v-model="ensureProjectTime(item)[1]" label="结束时间" />
        </div>
        <label class="form-label full-width">
          <span>技术栈（逗号分隔）</span>
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
            :model-value="fieldText(item, 'projectDesc')"
            label="描述"
            textarea
            :rows="3"
            @update:model-value="updateFieldText(item, 'projectDesc', $event)"
          />
        </div>
      </div>

      <div class="project-details">
        <div>
          <div class="list-header">
            <span class="list-title">主要工作</span>
            <button class="action-btn add compact" @click="ensureMainWork(item).push({ title: '', desc: '' })">
              <IconLogo name="add" /> 新增
            </button>
          </div>
          <div class="list-items">
            <div v-for="(work, wIdx) in ensureMainWork(item)" :key="wIdx" class="work-item">
              <FormInput
                :model-value="resolveLocalizedText(work.title, props.locale)"
                label="标题"
                @update:model-value="updateTargetText(work as unknown as Record<string, unknown>, 'title', $event)"
              />
              <FormInput
                :model-value="resolveLocalizedText(work.desc, props.locale)"
                label="描述"
                textarea
                :rows="2"
                @update:model-value="updateTargetText(work as unknown as Record<string, unknown>, 'desc', $event)"
              />
              <button class="action-btn delete" @click="ensureMainWork(item).splice(wIdx, 1)">
                <IconLogo name="delete" /> 删除
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="list-header">
            <span class="list-title">项目成果</span>
            <button class="action-btn add compact" @click="ensureProjectAchievements(item).push('')">
              <IconLogo name="add" /> 新增
            </button>
          </div>
          <div class="list-items">
            <div
              v-for="(_ach, aIdx) in ensureProjectAchievements(item)"
              :key="aIdx"
              class="list-item"
            >
              <textarea
                :value="listText(item.projectAchievements, aIdx)"
                class="form-textarea"
                rows="2"
                @input="updateListText(item, aIdx, ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
              <button
                class="action-btn delete icon-only"
                @click="ensureProjectAchievements(item).splice(aIdx, 1)"
              >
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

.form-input,
.form-textarea {
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
  min-height: 72px;
  resize: vertical;
  font-size: 13px;
  font-family: inherit;
  color: #2f2a24;
  line-height: 1.5;
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
