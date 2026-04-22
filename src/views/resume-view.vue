<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ViewLayout from '@/layout/view-layout.vue'
import type {
  ResumeConfig,
  Profile,
  EducationConfig,
  ExperienceConfig,
  Project,
  Award,
  EditorSection,
} from '@/types/resume'
import LogoIcon from '@/components/icon-logo.vue'
import ResumeEditorDrawer from '@/views/modules/resume-editor/resume-editor-drawer.vue'
import profileCard from './components/profile-card.vue'
import eduCard from './components/edu-card.vue'
import expCard from './components/exp-card.vue'
import projectCard from './components/project-card.vue'
import awardCard from './components/award-card.vue'
import cvData from '@/data/cv.json'
import { exportResumeHTML, exportResumePDF, exportResumePDFPrintViaServer } from '@/utils/resume-export'

const config = ref<Partial<ResumeConfig>>({})
const profile = ref<Profile>({})
const education = ref<EducationConfig[]>([])
const experience = ref<ExperienceConfig[]>([])
const projects = ref<Project[]>([]) // 项目经历
const awards = ref<Award[]>([]) // 奖项
const exportingType = ref<'none' | 'pdf-screen' | 'pdf-print' | 'html'>('none') // 导出状态
const showExportMenu = ref(false)
const exportMenuRef = ref<HTMLElement | null>(null)
const isEditing = ref(false)
const drawerOpen = ref(false)
const activeSection = ref<EditorSection>('profile')
const importDialogOpen = ref(false)
const importJsonText = ref('')
const importUrl = ref('')
const importError = ref('')
const importingFromUrl = ref(false)
const importFileInputRef = ref<HTMLInputElement | null>(null)

const isExporting = computed(() => exportingType.value !== 'none')
const modeText = computed(() => (isEditing.value ? '编辑模式' : '预览模式'))

const resumeData = computed<ResumeConfig>({
  get: () => ({
    profile: profile.value,
    education: education.value,
    experience: experience.value,
    projects: projects.value,
    awards: awards.value,
  }),
  set: (next) => {
    profile.value = next.profile || {}
    education.value = next.education || []
    experience.value = next.experience || []
    projects.value = next.projects || []
    awards.value = next.awards || []
  },
})

const exportingText = computed(() => {
  if (exportingType.value === 'html') return '导出HTML中...'
  if (exportingType.value === 'pdf-screen') return '导出PDF(屏幕)中...'
  if (exportingType.value === 'pdf-print') return '导出PDF(打印)中...'
  return '导出'
})

const applyResumeData = (payload: Partial<ResumeConfig>) => {
  profile.value = payload.profile || {}
  education.value = payload.education || []
  experience.value = payload.experience || []
  projects.value = payload.projects || []
  awards.value = payload.awards || []
}

const openSectionEditor = (section: EditorSection) => {
  if (!isEditing.value) return
  activeSection.value = section
  drawerOpen.value = true
}

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) drawerOpen.value = false
}

const toggleExportMenu = () => {
  if (isExporting.value) return
  showExportMenu.value = !showExportMenu.value
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!showExportMenu.value) return
  const target = event.target as Node | null
  if (!target) return
  if (exportMenuRef.value?.contains(target)) return
  showExportMenu.value = false
}

const exportResumeJSON = () => {
  const fileBaseName = profile.value.name || 'resume'
  const blob = new Blob([JSON.stringify(resumeData.value, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileBaseName}_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const startExport = async (mode: 'html' | 'pdf-screen' | 'pdf-print' | 'json') => {
  if (isExporting.value) return
  showExportMenu.value = false

  try {
    const fileBaseName = profile.value.name || 'resume'

    if (mode === 'json') {
      exportResumeJSON()
      return
    }

    if (mode === 'html') {
      exportingType.value = 'html'
      exportResumeHTML({
        surfaceSelector: '.resume-export-surface',
        fileBaseName,
      })
      return
    }

    exportingType.value = mode

    if (mode === 'pdf-print') {
      try {
        await exportResumePDFPrintViaServer({
          surfaceSelector: '.resume-export-surface',
          fileBaseName,
        })
      } catch (error) {
        console.warn('打印模式服务端导出失败，回退到本地截图导出:', error)
        await exportResumePDF({
          mode: 'print',
          resumeSelector: '.resume-shell',
          fileBaseName,
        })
      }
      return
    }

    await exportResumePDF({
      mode: 'screen',
      resumeSelector: '.resume-shell',
      fileBaseName,
    })
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请稍后重试')
  } finally {
    exportingType.value = 'none'
  }
}

const triggerImportFile = () => {
  importFileInputRef.value?.click()
}

const onImportFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    importJsonText.value = await file.text()
    importError.value = ''
  } catch {
    importError.value = '读取文件失败，请重试'
  } finally {
    input.value = ''
  }
}

const fetchImportFromUrl = async () => {
  if (!importUrl.value.trim()) {
    importError.value = '请先输入在线 JSON URL'
    return
  }

  importingFromUrl.value = true
  importError.value = ''

  try {
    const response = await fetch(importUrl.value.trim())
    if (!response.ok) {
      importError.value = `URL 请求失败：${response.status}`
      return
    }

    importJsonText.value = await response.text()
  } catch {
    importError.value = 'URL 读取失败，请检查链接是否可访问'
  } finally {
    importingFromUrl.value = false
  }
}

const applyImport = () => {
  try {
    const parsed = JSON.parse(importJsonText.value || '{}') as Partial<ResumeConfig>
    applyResumeData(parsed)
    importDialogOpen.value = false
    importJsonText.value = ''
    importUrl.value = ''
    importError.value = ''
  } catch {
    importError.value = 'JSON 解析失败，请检查格式'
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)

  try {
    config.value = cvData as ResumeConfig
    applyResumeData(config.value)
  } catch (error) {
    console.error('Error loading config:', error)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <ViewLayout>
    <!-- 导出按钮 -->
    <div class="export-toolbar">
      <div class="mode-tag">{{ modeText }}</div>

      <div class="toolbar-actions">
        <div ref="exportMenuRef" class="export-menu">
          <button @click="toggleExportMenu" :disabled="isExporting" class="export-btn">
            <logo-icon v-if="!isExporting" name="file-export" />
            <div v-else class="loading-spinner"></div>
            {{ exportingText }}
          </button>

          <div v-if="showExportMenu && !isExporting" class="export-options">
            <button class="export-option" @click="startExport('json')">导出 JSON</button>
            <button class="export-option" @click="startExport('html')">导出 HTML</button>
            <button class="export-option" @click="startExport('pdf-screen')">
              导出 PDF（屏幕）
            </button>
            <button class="export-option" @click="startExport('pdf-print')">
              导出 PDF（打印）
            </button>
          </div>
        </div>

        <button class="export-btn" @click="importDialogOpen = true" :disabled="isExporting">
          <logo-icon name="link" /> 导入
        </button>

        <button class="export-btn" @click="toggleEditMode" :disabled="isExporting">
          <logo-icon name="edit" /> {{ isEditing ? '结束编辑' : '编辑' }}
        </button>
      </div>
    </div>

    <div class="resume-export-surface">
      <div class="resume-shell">
        <!-- 个人基本信息 -->
        <profile-card
          v-model:profile="profile"
          :editable="isEditing"
          @edit="openSectionEditor('profile')"
        />
        <!-- 教育经历 -->
        <edu-card
          v-model:education="education"
          :editable="isEditing"
          @edit="openSectionEditor('education')"
        />
        <!-- 工作经历 -->
        <exp-card
          v-model:experience="experience"
          :editable="isEditing"
          @edit="openSectionEditor('experience')"
        />
        <!-- 项目经历 -->
        <project-card
          v-if="projects.length"
          v-model:projects="projects"
          :editable="isEditing"
          @edit="openSectionEditor('projects')"
        />
        <!-- 奖项 -->
        <award-card
          v-if="awards.length"
          v-model:awards="awards"
          :editable="isEditing"
          @edit="openSectionEditor('awards')"
        />
      </div>
    </div>

    <ResumeEditorDrawer
      v-model:open="drawerOpen"
      v-model:section="activeSection"
      v-model:resume="resumeData"
    />

    <Transition name="fade">
      <div v-if="importDialogOpen" class="import-overlay" @click.self="importDialogOpen = false">
        <div class="import-panel">
          <h3 class="import-title">导入简历 JSON</h3>
          <p class="import-tip">支持上传 JSON 文件、通过在线 URL 拉取、或直接粘贴 JSON 内容。</p>

          <div class="import-actions-row">
            <button class="export-btn" @click="triggerImportFile">上传 JSON 文件</button>
            <input
              ref="importFileInputRef"
              class="hidden-input"
              type="file"
              accept="application/json,.json"
              @change="onImportFileChange"
            />
          </div>

          <div class="import-url-row">
            <input
              v-model="importUrl"
              class="import-url-input"
              placeholder="在线 JSON URL，例如：https://example.com/resume.json"
            />
            <button class="export-btn" :disabled="importingFromUrl" @click="fetchImportFromUrl">
              {{ importingFromUrl ? '解析中...' : '从 URL 解析' }}
            </button>
          </div>

          <textarea
            v-model="importJsonText"
            class="import-textarea"
            placeholder="粘贴 JSON 内容"
          ></textarea>

          <p v-if="importError" class="import-error">{{ importError }}</p>

          <div class="import-actions-row">
            <button class="export-btn" @click="importDialogOpen = false">取消</button>
            <button class="export-btn" @click="applyImport">应用导入</button>
          </div>
        </div>
      </div>
    </Transition>
  </ViewLayout>
</template>

<style scoped>
.export-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: min(210mm, calc(100vw - 24px));
  margin: 0 auto 10px;
}

.mode-tag {
  font-size: 13px;
  color: #5b5448;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-menu {
  position: relative;
}

.export-options {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 180px;
  background-color: #fffdf7;
  border: 1px solid #d6d0c4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.export-option {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  color: #2f2a24;
  cursor: pointer;
}

.export-option:hover {
  background-color: #f6f1e7;
}

.resume-export-surface {
  width: 100%;
  max-width: min(210mm, calc(100vw - 24px));
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #fffdf7;
  color: #2f2a24;
  border: 0;
  border-radius: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.export-btn:hover:not(:disabled) {
  background-color: #f6f1e7;
}

.export-btn:disabled {
  background-color: #ede7dc;
  color: #7b7468;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.resume-shell {
  width: 100%;
  max-width: none;
  height: fit-content;
  min-height: auto;
  display: flex;
  flex-direction: column;

  border: 0;
  border-radius: 0;

  padding: 22px 28px;
  margin: 0 auto;

  background-color: #fffdf7;
  box-sizing: border-box;
  box-shadow: none;
}

.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 60;
}

.import-panel {
  width: min(700px, calc(100vw - 24px));
  background: #fffdf7;
  padding: 16px;
}

.import-title {
  margin: 0;
  font-size: 20px;
}

.import-tip {
  margin: 6px 0 12px;
  color: #6b665c;
  font-size: 13px;
}

.import-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.hidden-input {
  display: none;
}

.import-url-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin: 10px 0;
}

.import-url-input,
.import-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d6d0c4;
  padding: 10px;
  background: #fff;
  color: #2f2a24;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.import-url-input:focus,
.import-textarea:focus {
  border-color: #9c8f7a;
  box-shadow: 0 0 0 3px rgba(156, 143, 122, 0.2);
}

.import-textarea {
  min-height: 220px;
  resize: vertical;
}

.import-error {
  margin: 6px 0 0;
  color: #c53030;
  font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .export-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .resume-shell {
    padding: 16px;
  }
}
</style>
