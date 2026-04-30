<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
import ProfileCard from './components/profile-card.vue'
import EduCard from './components/edu-card.vue'
import ExpCard from './components/exp-card.vue'
import ProjectCard from './components/project-card.vue'
import AwardCard from './components/award-card.vue'
import cvData from '@/data/cv.json'
import { exportResumeHTML, printResumePDF } from '@/utils/resume-export'
import {
  buildThemeStyleVars,
  getResumeTheme,
  resolveThemeSections,
  resumeThemes,
  sectionHasData,
} from '@/themes'

const config = ref<Partial<ResumeConfig>>({})
const profile = ref<Profile>({})
const education = ref<EducationConfig[]>([])
const experience = ref<ExperienceConfig[]>([])
const projects = ref<Project[]>([])
const awards = ref<Award[]>([])
const exportingType = ref<'none' | 'pdf' | 'html'>('none')
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
const selectedThemeKey = ref('')
const resumeSize = ref<ResumeSize>('standard')
const preserveExportBackground = ref(true)
const resumeBackground = ref('#fffdf7')

const RESUME_THEME_STORAGE_KEY = 'resume-theme-preset-v1'
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
  {
    key: 'xsmall',
    label: '极小',
    shortLabel: '极小',
    scale: 0.82,
    titleScale: 0.8,
    avatarScale: 0.82,
  },
  { key: 'small', label: '小', shortLabel: '小', scale: 0.88, titleScale: 0.86, avatarScale: 0.88 },
  {
    key: 'standard',
    label: '标准',
    shortLabel: '默认',
    scale: 0.94,
    titleScale: 0.91,
    avatarScale: 0.93,
  },
  {
    key: 'large',
    label: '加大',
    shortLabel: '加大',
    scale: 1,
    titleScale: 0.97,
    avatarScale: 0.98,
  },
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

const sectionCounts = computed(() => ({
  education: education.value.length,
  experience: experience.value.length,
  projects: projects.value.length,
  awards: awards.value.length,
}))

const currentTheme = computed(() => getResumeTheme(selectedThemeKey.value))
const currentSizePreset = computed(
  () => RESUME_SIZE_PRESETS.find((item) => item.key === resumeSize.value) ?? RESUME_SIZE_PRESETS[2],
)
const isExporting = computed(() => exportingType.value !== 'none')
const modeText = computed(() => (isEditing.value ? '编辑模式' : '预览模式'))
const exportingText = computed(() => {
  if (exportingType.value === 'html') return '导出HTML中...'
  if (exportingType.value === 'pdf') return '导出PDF中...'
  return '导出'
})

const themeSections = computed(() => {
  const { sidebarSections, mainSections } = resolveThemeSections(currentTheme.value)
  return {
    sidebarSections: sidebarSections.filter((section) =>
      sectionHasData(section, sectionCounts.value),
    ),
    mainSections: mainSections.filter((section) => sectionHasData(section, sectionCounts.value)),
  }
})

const resumeScaleStyle = computed(() =>
  buildThemeStyleVars(currentTheme.value, {
    backgroundColor: resumeBackground.value,
    fontScale: currentSizePreset.value.scale,
    titleScale: currentSizePreset.value.titleScale,
    avatarScale: currentSizePreset.value.avatarScale,
  }),
)

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

const applyThemeDefaults = () => {
  resumeSize.value = currentTheme.value.defaults.resumeSize
  resumeBackground.value = currentTheme.value.defaults.backgroundColor
  preserveExportBackground.value = currentTheme.value.defaults.preserveExportBackground
}

const setTheme = (key: string) => {
  const nextTheme = getResumeTheme(key)
  const previousTheme = currentTheme.value
  selectedThemeKey.value = nextTheme.key

  if (previousTheme.key !== nextTheme.key) {
    applyThemeDefaults()
  }
}

const setResumeSize = (size: ResumeSize) => {
  resumeSize.value = size
}

const setResumeBackground = (color: string) => {
  resumeBackground.value = color
}

const togglePreserveExportBackground = () => {
  preserveExportBackground.value = !preserveExportBackground.value
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

const startExport = async (mode: 'html' | 'pdf' | 'json') => {
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

    await printResumePDF({
      surfaceSelector: '.resume-export-surface',
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

watch(selectedThemeKey, (value) => {
  if (!value) return
  try {
    localStorage.setItem(RESUME_THEME_STORAGE_KEY, value)
  } catch (error) {
    console.warn('保存主题配置失败:', error)
  }
})

watch(resumeSize, (value) => {
  try {
    localStorage.setItem(RESUME_SIZE_STORAGE_KEY, value)
  } catch (error) {
    console.warn('保存字体大小配置失败:', error)
  }
})

watch(resumeBackground, (value) => {
  try {
    localStorage.setItem(RESUME_BACKGROUND_STORAGE_KEY, value)
  } catch (error) {
    console.warn('保存背景色配置失败:', error)
  }
})

watch(preserveExportBackground, (value) => {
  try {
    localStorage.setItem(RESUME_PRESERVE_BG_STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    console.warn('保存导出背景配置失败:', error)
  }
})

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)

  const initialTheme = resumeThemes[0]
  selectedThemeKey.value = initialTheme.key
  applyThemeDefaults()

  try {
    const cachedTheme = localStorage.getItem(RESUME_THEME_STORAGE_KEY)
    if (cachedTheme) {
      selectedThemeKey.value = getResumeTheme(cachedTheme).key
      applyThemeDefaults()
    }
  } catch (error) {
    console.warn('读取主题配置失败:', error)
  }

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
    if (cachedBackground) {
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
    <div class="export-toolbar" :style="resumeScaleStyle">
      <div class="toolbar-meta">
        <div class="mode-tag">{{ modeText }}</div>
        <div class="theme-intro">
          <span class="theme-name">{{ currentTheme.name }}</span>
          <span class="theme-description">{{ currentTheme.description }}</span>
        </div>
      </div>

      <div class="toolbar-actions">
        <div ref="exportMenuRef" class="export-menu">
          <button class="export-btn" :disabled="isExporting" @click="toggleExportMenu">
            <LogoIcon v-if="!isExporting" name="file-export" />
            <div v-else class="loading-spinner"></div>
            {{ exportingText }}
          </button>

          <div v-if="showExportMenu && !isExporting" class="export-options">
            <button class="export-option" @click="startExport('json')">导出 JSON</button>
            <button class="export-option" @click="startExport('html')">导出 HTML</button>
            <button class="export-option" @click="startExport('pdf')">导出 PDF</button>
          </div>
        </div>

        <button class="export-btn" :disabled="isExporting" @click="importDialogOpen = true">
          <LogoIcon name="link" /> 导入
        </button>

        <button class="export-btn" :disabled="isExporting" @click="toggleEditMode">
          <LogoIcon name="edit" /> {{ isEditing ? '结束编辑' : '编辑' }}
        </button>

        <div ref="fontSizeMenuRef" class="font-size-menu">
          <button
            class="export-btn icon-btn"
            :disabled="isExporting"
            :aria-expanded="fontSizeMenuOpen"
            @click="toggleFontSizeMenu"
          >
            <LogoIcon name="gear" />
          </button>

          <div v-if="fontSizeMenuOpen" class="font-size-panel">
            <div class="theme-panel-heading">
              <div>
                <div class="theme-panel-title">设置</div>
                <div class="theme-panel-subtitle">{{ currentTheme.audience }}</div>
              </div>
              <div class="theme-panel-tags">
                <span v-for="tag in currentTheme.previewTags" :key="tag" class="theme-panel-tag">{{
                  tag
                }}</span>
              </div>
            </div>

            <div class="panel-section">
              <div class="font-size-panel-header compact">
                <span class="font-size-panel-title">主题风格</span>
                <span class="font-size-panel-value">{{ currentTheme.name }}</span>
              </div>

              <div
                class="theme-switcher settings-theme-switcher"
                role="radiogroup"
                aria-label="简历主题"
              >
                <button
                  v-for="theme in resumeThemes"
                  :key="theme.key"
                  class="theme-pill"
                  :class="{ active: theme.key === currentTheme.key }"
                  :aria-checked="theme.key === currentTheme.key"
                  role="radio"
                  @click="setTheme(theme.key)"
                >
                  <span
                    class="theme-pill-chip"
                    :style="{ backgroundColor: theme.palette.primary }"
                  ></span>
                  <span class="theme-pill-name">{{ theme.name }}</span>
                  <span class="theme-pill-category">{{ theme.category }}</span>
                </button>
              </div>
            </div>

            <div class="panel-section">
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
                  <span class="font-size-step-axis">
                    <span class="font-size-step-dot"></span>
                  </span>
                  <span class="font-size-step-label">{{ preset.shortLabel }}</span>
                </button>
              </div>
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
                    RESUME_BACKGROUND_OPTIONS.find((item) => item.value === resumeBackground)
                      ?.label || '自定义'
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
                  <span
                    class="background-swatch-chip"
                    :style="{ backgroundColor: option.value }"
                  ></span>
                  <span class="background-swatch-label">{{ option.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="resume-export-surface" :data-export-size="resumeSize" :style="resumeScaleStyle">
      <div
        class="resume-shell"
        :class="{
          'is-two-column': currentTheme.layout.columns === 2,
          'is-profile-sidebar': currentTheme.layout.profileVariant === 'sidebar',
          [`title-style-${currentTheme.layout.sectionTitleStyle}`]: true,
        }"
        :style="resumeScaleStyle"
        :data-export-size="resumeSize"
        :data-theme-key="currentTheme.key"
      >
        <aside v-if="currentTheme.layout.columns === 2" class="resume-sidebar">
          <template v-for="section in themeSections.sidebarSections" :key="section">
            <ProfileCard
              v-if="section === 'profile'"
              v-model:profile="profile"
              :editable="isEditing"
              @edit="openSectionEditor('profile')"
            />
            <EduCard
              v-else-if="section === 'education'"
              v-model:education="education"
              :editable="isEditing"
              @edit="openSectionEditor('education')"
            />
            <ExpCard
              v-else-if="section === 'experience'"
              v-model:experience="experience"
              :editable="isEditing"
              @edit="openSectionEditor('experience')"
            />
            <ProjectCard
              v-else-if="section === 'projects'"
              v-model:projects="projects"
              :editable="isEditing"
              @edit="openSectionEditor('projects')"
            />
            <AwardCard
              v-else
              v-model:awards="awards"
              :editable="isEditing"
              @edit="openSectionEditor('awards')"
            />
          </template>
        </aside>

        <main class="resume-main">
          <template v-for="section in themeSections.mainSections" :key="section">
            <ProfileCard
              v-if="section === 'profile'"
              v-model:profile="profile"
              :editable="isEditing"
              @edit="openSectionEditor('profile')"
            />
            <EduCard
              v-else-if="section === 'education'"
              v-model:education="education"
              :editable="isEditing"
              @edit="openSectionEditor('education')"
            />
            <ExpCard
              v-else-if="section === 'experience'"
              v-model:experience="experience"
              :editable="isEditing"
              @edit="openSectionEditor('experience')"
            />
            <ProjectCard
              v-else-if="section === 'projects'"
              v-model:projects="projects"
              :editable="isEditing"
              @edit="openSectionEditor('projects')"
            />
            <AwardCard
              v-else
              v-model:awards="awards"
              :editable="isEditing"
              @edit="openSectionEditor('awards')"
            />
          </template>
        </main>
      </div>
    </div>

    <ResumeEditorDrawer
      v-model:open="drawerOpen"
      v-model:section="activeSection"
      v-model:resume="resumeData"
    />

    <Transition name="fade">
      <div v-if="importDialogOpen" class="import-overlay" @click.self="importDialogOpen = false">
        <div class="import-panel" :style="resumeScaleStyle">
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
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  max-width: min(210mm, calc(100vw - 24px));
  margin: 0 auto 14px;
  padding: 4px 2px 8px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  box-sizing: border-box;
  transition: color 0.24s ease;
}

.toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.mode-tag {
  font-size: 13px;
  color: var(--resume-theme-muted);
}

.theme-intro {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--resume-theme-text);
}

.theme-description {
  font-size: 13px;
  color: var(--resume-theme-muted);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.theme-switcher {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  max-width: 640px;
}

.settings-theme-switcher {
  justify-content: flex-start;
  max-width: none;
}

.theme-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--resume-theme-border);
  border-radius: 999px;
  background: var(--resume-theme-button-bg);
  color: var(--resume-theme-button-text);
  padding: 8px 12px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.theme-pill:hover,
.theme-pill.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
  transform: translateY(-1px);
}

.theme-pill.active {
  background: color-mix(in srgb, var(--color-primary) 8%, white);
}

.theme-pill-chip {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.theme-pill-name {
  font-size: 13px;
  font-weight: 700;
}

.theme-pill-category {
  font-size: 12px;
  color: var(--resume-theme-subtle);
}

.font-size-menu,
.export-menu {
  position: relative;
}

.font-size-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 360px;
  padding: 16px 18px 18px;
  background-color: var(--resume-theme-paper);
  border: 1px solid var(--resume-theme-border);
  border-radius: 24px;
  box-shadow: var(--resume-theme-shadow);
  z-index: 20;
}

.theme-panel-heading {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.theme-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--resume-theme-text);
}

.theme-panel-subtitle {
  font-size: 12px;
  color: var(--resume-theme-muted);
}

.theme-panel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.theme-panel-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--resume-theme-badge-bg);
  color: var(--resume-theme-badge-text);
  font-size: 12px;
  font-weight: 600;
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
  color: var(--resume-theme-muted);
}

.font-size-panel-value {
  font-size: 13px;
  color: var(--resume-theme-subtle);
}

.font-size-panel-header.compact {
  margin-bottom: 10px;
}

.font-size-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: start;
  gap: 12px;
}

.font-size-track::before {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  top: 15px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-primary) 24%, white) 0%,
    color-mix(in srgb, var(--color-primary) 52%, var(--color-secondary)) 100%
  );
}

.font-size-step {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: var(--resume-theme-subtle);
}

.font-size-step-axis {
  height: 32px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-size-step-dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--color-primary) 36%, white);
  background: var(--resume-theme-paper);
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
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 16%, transparent);
  transform: translateY(-1px);
}

.font-size-step.active {
  color: var(--resume-theme-text);
  font-weight: 600;
}

.panel-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--resume-theme-divider);
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--resume-theme-text);
  cursor: pointer;
}

.toggle-row input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
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
  border: 1px solid var(--resume-theme-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--resume-theme-paper) 90%, white);
  padding: 8px 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.background-swatch:hover,
.background-swatch.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-1px);
}

.background-swatch-chip {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  flex: 0 0 auto;
}

.background-swatch-label {
  font-size: 12px;
  color: var(--resume-theme-text);
}

.export-options {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 180px;
  background-color: var(--resume-theme-paper);
  border: 1px solid var(--resume-theme-border);
  border-radius: 18px;
  box-shadow: var(--resume-theme-shadow);
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.export-option {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--resume-theme-text);
  cursor: pointer;
}

.export-option:hover {
  background-color: color-mix(in srgb, var(--color-primary) 7%, white);
}

.resume-export-surface {
  width: 100%;
  max-width: min(210mm, calc(100vw - 24px));
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--resume-surface-bg, #fffdf7);
  transition: background-color 0.24s ease;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background-color: var(--resume-theme-button-bg);
  color: var(--resume-theme-button-text);
  border: 1px solid var(--resume-theme-border);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.icon-btn {
  justify-content: center;
  min-width: 44px;
  padding-inline: 12px;
}

.export-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, white);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.6;
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
  --resume-text-sm: calc(12px * var(--resume-font-scale));
  --resume-text-md: calc(13px * var(--resume-font-scale));
  --resume-text-base: calc(14px * var(--resume-font-scale));
  --resume-text-lg: calc(16px * var(--resume-font-scale));
  --resume-text-xl: calc(20px * var(--resume-title-scale));
  --resume-text-hero: calc(26px * var(--resume-title-scale));
  --resume-text-hero-desktop: calc(30px * var(--resume-title-scale));
  display: flex;
  flex-direction: column;
  gap: var(--resume-shell-gap);
  width: 100%;
  min-height: auto;
  padding: var(--resume-paper-padding);
  margin: 0 auto;
  border: 1px solid var(--resume-theme-border);
  border-radius: var(--resume-paper-radius);
  background-color: var(--resume-surface-bg, #fffdf7);
  box-sizing: border-box;
  box-shadow: var(--resume-theme-shadow);
  transition:
    background-color 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    border-radius 0.24s ease;
}

.resume-shell.is-two-column {
  display: grid;
  grid-template-columns: minmax(0, var(--resume-sidebar-width)) minmax(0, 1fr);
  column-gap: var(--resume-column-gap);
  align-items: start;
}

.resume-sidebar,
.resume-main {
  display: flex;
  flex-direction: column;
  gap: var(--resume-shell-gap);
  min-width: 0;
}

.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 60;
}

.import-panel {
  width: min(700px, calc(100vw - 24px));
  background: var(--resume-theme-paper);
  border: 1px solid var(--resume-theme-border);
  border-radius: 24px;
  box-shadow: var(--resume-theme-shadow);
  padding: 18px;
}

.import-title {
  margin: 0;
  font-size: 20px;
  color: var(--resume-theme-text);
}

.import-tip {
  margin: 6px 0 12px;
  color: var(--resume-theme-muted);
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
  border: 1px solid var(--resume-theme-border);
  border-radius: 16px;
  padding: 10px 12px;
  background: #fff;
  color: var(--resume-theme-text);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.import-url-input:focus,
.import-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 16%, transparent);
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
    justify-content: flex-start;
  }

  .theme-switcher {
    justify-content: flex-start;
  }

  .font-size-panel {
    left: 0;
    right: auto;
    width: min(360px, calc(100vw - 24px));
  }

  .resume-shell,
  .resume-shell.is-two-column {
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .export-toolbar {
    padding: 2px 0 6px;
  }

  .theme-pill {
    width: 100%;
    justify-content: flex-start;
  }

  .background-swatches {
    grid-template-columns: 1fr;
  }

  .import-url-row {
    grid-template-columns: 1fr;
  }

  .resume-shell {
    padding: 18px 16px;
  }
}
</style>
