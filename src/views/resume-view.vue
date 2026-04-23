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
  ResumeSize,
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
const fontSizeMenuRef = ref<HTMLElement | null>(null)
const isEditing = ref(false)
const drawerOpen = ref(false)
const activeSection = ref<EditorSection>('profile')
const importDialogOpen = ref(false)
const importJsonText = ref('')
const importUrl = ref('')
const importError = ref('')
const importingFromUrl = ref(false)
const importFileInputRef = ref<HTMLInputElement | null>(null)
const fontSizeMenuOpen = ref(false)
const resumeSize = ref<ResumeSize>('standard')
const preserveExportBackground = ref(true)
const resumeBackground = ref('#fffdf7')

const RESUME_SIZE_STORAGE_KEY = 'resume-font-size-v1'
const RESUME_BACKGROUND_STORAGE_KEY = 'resume-background-v1'
const RESUME_PRESERVE_BG_STORAGE_KEY = 'resume-preserve-bg-v1'
const RESUME_SIZE_PRESETS: Array<{
  key: ResumeSize
  label: string
  shortLabel: string
  scale: number
  titleScale: number
  avatarScale: number
}> = [
  { key: 'xsmall', label: '极小', shortLabel: '极小', scale: 0.88, titleScale: 0.84, avatarScale: 0.86 },
  { key: 'small', label: '小', shortLabel: '小', scale: 0.94, titleScale: 0.92, avatarScale: 0.92 },
  { key: 'standard', label: '标准', shortLabel: '默认', scale: 1, titleScale: 0.97, avatarScale: 0.97 },
  { key: 'large', label: '加大', shortLabel: '加大', scale: 1.08, titleScale: 1.04, avatarScale: 1.04 },
]
const RESUME_BACKGROUND_OPTIONS = [
  { key: 'white', label: '纯白', value: '#ffffff' },
  { key: 'gray-white', label: '灰白', value: '#f5f5f4' },
  { key: 'mist', label: '雾灰白', value: '#f2f4f5' },
  { key: 'blue-white', label: '浅蓝白', value: '#f3f7fb' },
  { key: 'beige', label: '米白', value: '#f7f2e8' },
  { key: 'linen', label: '亚麻白', value: '#f6f1eb' },
  { key: 'warm-sand', label: '暖沙白', value: '#f3ede2' },
  { key: 'soft-green', label: '浅鼠尾草', value: '#eff3ee' },
] as const

const isExporting = computed(() => exportingType.value !== 'none')
const modeText = computed(() => (isEditing.value ? '编辑模式' : '预览模式'))
const currentSizePreset = computed(
  () => RESUME_SIZE_PRESETS.find((item) => item.key === resumeSize.value) ?? RESUME_SIZE_PRESETS[2],
)
const resumeScaleStyle = computed(() => ({
  '--resume-font-scale': String(currentSizePreset.value.scale),
  '--resume-title-scale': String(currentSizePreset.value.titleScale),
  '--resume-avatar-scale': String(currentSizePreset.value.avatarScale),
  '--resume-surface-bg': resumeBackground.value,
}))

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
  fontSizeMenuOpen.value = false
  showExportMenu.value = !showExportMenu.value
}

const toggleFontSizeMenu = () => {
  fontSizeMenuOpen.value = !fontSizeMenuOpen.value
  if (fontSizeMenuOpen.value) showExportMenu.value = false
}

const setResumeSize = (size: ResumeSize) => {
  resumeSize.value = size
  try {
    localStorage.setItem(RESUME_SIZE_STORAGE_KEY, size)
  } catch (error) {
    console.warn('保存字体大小配置失败:', error)
  }
}

const setResumeBackground = (color: string) => {
  resumeBackground.value = color
  try {
    localStorage.setItem(RESUME_BACKGROUND_STORAGE_KEY, color)
  } catch (error) {
    console.warn('保存背景色配置失败:', error)
  }
}

const togglePreserveExportBackground = () => {
  preserveExportBackground.value = !preserveExportBackground.value
  try {
    localStorage.setItem(RESUME_PRESERVE_BG_STORAGE_KEY, JSON.stringify(preserveExportBackground.value))
  } catch (error) {
    console.warn('保存导出背景配置失败:', error)
  }
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target) return
  if (showExportMenu.value && !exportMenuRef.value?.contains(target)) {
    showExportMenu.value = false
  }
  if (fontSizeMenuOpen.value && !fontSizeMenuRef.value?.contains(target)) {
    fontSizeMenuOpen.value = false
  }
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
        size: resumeSize.value,
        preserveBackground: preserveExportBackground.value,
        backgroundColor: resumeBackground.value,
      })
      return
    }

    exportingType.value = mode

    if (mode === 'pdf-print') {
      try {
        await exportResumePDFPrintViaServer({
          surfaceSelector: '.resume-export-surface',
          fileBaseName,
          size: resumeSize.value,
          preserveBackground: preserveExportBackground.value,
          backgroundColor: resumeBackground.value,
        })
      } catch (error) {
        console.warn('打印模式服务端导出失败，回退到本地截图导出:', error)
        await exportResumePDF({
          mode: 'print',
          resumeSelector: '.resume-export-surface',
          fileBaseName,
          size: resumeSize.value,
          preserveBackground: preserveExportBackground.value,
          backgroundColor: resumeBackground.value,
        })
      }
      return
    }

    await exportResumePDF({
      mode: 'screen',
      resumeSelector: '.resume-export-surface',
      fileBaseName,
      size: resumeSize.value,
      preserveBackground: preserveExportBackground.value,
      backgroundColor: resumeBackground.value,
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
    const cachedSize = localStorage.getItem(RESUME_SIZE_STORAGE_KEY) as ResumeSize | null
    if (cachedSize && RESUME_SIZE_PRESETS.some((item) => item.key === cachedSize)) {
      resumeSize.value = cachedSize
    }
  } catch (error) {
    console.warn('读取字体大小配置失败:', error)
  }

  try {
    const cachedBackground = localStorage.getItem(RESUME_BACKGROUND_STORAGE_KEY)
    if (cachedBackground && RESUME_BACKGROUND_OPTIONS.some((item) => item.value === cachedBackground)) {
      resumeBackground.value = cachedBackground
    }
  } catch (error) {
    console.warn('读取背景色配置失败:', error)
  }

  try {
    const cachedPreserveBackground = localStorage.getItem(RESUME_PRESERVE_BG_STORAGE_KEY)
    if (cachedPreserveBackground !== null) {
      preserveExportBackground.value = JSON.parse(cachedPreserveBackground)
    }
  } catch (error) {
    console.warn('读取导出背景配置失败:', error)
  }

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

        <div ref="fontSizeMenuRef" class="font-size-menu">
          <button
            class="export-btn icon-btn"
            :disabled="isExporting"
            @click="toggleFontSizeMenu"
            :aria-expanded="fontSizeMenuOpen"
          >
            <logo-icon name="gear" />
          </button>

          <div v-if="fontSizeMenuOpen" class="font-size-panel">
            <div class="font-size-panel-header">
              <span class="font-size-panel-title">整体字体大小</span>
              <span class="font-size-panel-value">{{ currentSizePreset.label }}</span>
            </div>

            <div class="font-size-track" role="radiogroup" aria-label="整体字体大小">
              <button
                v-for="(preset, index) in RESUME_SIZE_PRESETS"
                :key="preset.key"
                class="font-size-step"
                :class="{ active: preset.key === resumeSize }"
                :style="{ '--dot-size': `${12 + index * 4}px` }"
                :aria-checked="preset.key === resumeSize"
                :title="preset.label"
                role="radio"
                @click="setResumeSize(preset.key)"
              >
                <span class="font-size-step-dot"></span>
                <span class="font-size-step-label">{{ preset.shortLabel }}</span>
              </button>
            </div>

            <div class="panel-section">
              <label class="toggle-row">
                <input
                  :checked="preserveExportBackground"
                  type="checkbox"
                  @change="togglePreserveExportBackground"
                />
                <span>导出时保留当前背景色</span>
              </label>
            </div>

            <div class="panel-section">
              <div class="font-size-panel-header compact">
                <span class="font-size-panel-title">简历背景色</span>
                <span class="font-size-panel-value">
                  {{
                    RESUME_BACKGROUND_OPTIONS.find((item) => item.value === resumeBackground)?.label ||
                    '自定义'
                  }}
                </span>
              </div>

              <div class="background-swatches">
                <button
                  v-for="option in RESUME_BACKGROUND_OPTIONS"
                  :key="option.key"
                  class="background-swatch"
                  :class="{ active: option.value === resumeBackground }"
                  :title="option.label"
                  @click="setResumeBackground(option.value)"
                >
                  <span class="background-swatch-chip" :style="{ backgroundColor: option.value }"></span>
                  <span class="background-swatch-label">{{ option.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="resume-export-surface" :data-export-size="resumeSize">
      <div class="resume-shell" :style="resumeScaleStyle" :data-export-size="resumeSize">
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

.font-size-menu,
.export-menu {
  position: relative;
}

.font-size-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 320px;
  padding: 14px 16px 18px;
  background-color: #fffdf7;
  border: 1px solid #d6d0c4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 20;
}

.font-size-panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.font-size-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #5b5448;
}

.font-size-panel-value {
  font-size: 13px;
  color: #8a7d69;
}

.font-size-panel-header.compact {
  margin-bottom: 10px;
}

.font-size-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: end;
  gap: 12px;
}

.font-size-track::before {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  top: 13px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #dfd7ca 0%, #c7baa5 100%);
}

.font-size-step {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #7b7468;
}

.font-size-step-dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  border: 2px solid #b7ab95;
  background: #fffdf7;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.font-size-step-label {
  font-size: 12px;
  line-height: 1.2;
}

.font-size-step:hover .font-size-step-dot,
.font-size-step.active .font-size-step-dot {
  border-color: #6f624d;
  background: #6f624d;
  box-shadow: 0 0 0 4px rgba(111, 98, 77, 0.12);
  transform: translateY(-1px);
}

.font-size-step.active {
  color: #2f2a24;
  font-weight: 600;
}

.panel-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e5ddd0;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #4f483d;
  cursor: pointer;
}

.toggle-row input {
  width: 16px;
  height: 16px;
  accent-color: #6f624d;
}

.background-swatches {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.background-swatch {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid #ddd4c7;
  background: #fffdfa;
  padding: 8px 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.background-swatch:hover,
.background-swatch.active {
  border-color: #6f624d;
  box-shadow: 0 0 0 3px rgba(111, 98, 77, 0.1);
  transform: translateY(-1px);
}

.background-swatch-chip {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(47, 42, 36, 0.12);
  flex: 0 0 auto;
}

.background-swatch-label {
  font-size: 12px;
  color: #3e382f;
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
  background-color: var(--resume-surface-bg, #fffdf7);
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

.icon-btn {
  justify-content: center;
  min-width: 44px;
  padding-inline: 12px;
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
  --resume-font-scale: 1;
  --resume-title-scale: 0.97;
  --resume-avatar-scale: 0.97;
  --resume-text-sm: calc(13px * var(--resume-font-scale));
  --resume-text-md: calc(14px * var(--resume-font-scale));
  --resume-text-base: calc(15px * var(--resume-font-scale));
  --resume-text-lg: calc(18px * var(--resume-font-scale));
  --resume-text-xl: calc(24px * var(--resume-title-scale));
  --resume-text-hero: calc(30px * var(--resume-title-scale));
  --resume-text-hero-desktop: calc(36px * var(--resume-title-scale));
  --resume-section-gap: calc(8px * var(--resume-font-scale));
  --resume-block-gap: calc(10px * var(--resume-font-scale));
  width: 100%;
  max-width: none;
  height: fit-content;
  min-height: auto;
  display: flex;
  flex-direction: column;

  border: 0;
  border-radius: 0;

  padding: 20px 26px;
  margin: 0 auto;

  background-color: #fffdf7;
  background-color: var(--resume-surface-bg, #fffdf7);
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

  .font-size-panel {
    left: 0;
    right: auto;
    width: min(320px, calc(100vw - 24px));
  }

  .resume-shell {
    padding: 16px;
  }
}
</style>
