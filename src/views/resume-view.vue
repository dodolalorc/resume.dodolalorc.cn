<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/layout/view-layout.vue'
import type {
  ResumeConfig,
  Profile,
  EducationConfig,
  ExperienceConfig,
  SkillItem,
  CampusItem,
  Project,
  Award,
  EditorSection,
  ResumeSize,
  ResumeLocale,
} from '@/types/resume'
import LogoIcon from '@/components/icon-logo.vue'
import ResumeEditorDrawer from '@/views/modules/resume-editor/resume-editor-drawer.vue'
import ProfileCard from './components/profile-card.vue'
import EduCard from './components/edu-card.vue'
import ExpCard from './components/exp-card.vue'
import SkillCard from './components/skill-card.vue'
import CampusCard from './components/campus-card.vue'
import ProjectCard from './components/project-card.vue'
import AwardCard from './components/award-card.vue'
import ColorPickerPanel from './components/color-picker-panel.vue'
import cvData from '@/data/cv.json'
import { exportResumeHTML, printResumePDF } from '@/utils/resume-export'
import { resolveLocalizedText } from '@/utils/localized'
import { buildThemeStyleVars, getResumeTheme, resumeThemes, sectionHasData } from '@/themes'
import type { ResumeThemeSectionKey } from '@/themes/types'

type ReorderableSectionKey = Exclude<ResumeThemeSectionKey, 'profile'>
type ThemeColorSchemeKey =
  | 'theme-default'
  | 'business-blue'
  | 'business-green'
  | 'business-slate'
  | 'business-amber'

interface ThemeColorScheme {
  key: ThemeColorSchemeKey
  label: string
  primary: string
  secondary: string
  accent: string
}

const config = ref<Partial<ResumeConfig>>({})
const profile = ref<Profile>({})
const education = ref<EducationConfig[]>([])
const experience = ref<ExperienceConfig[]>([])
const projects = ref<Project[]>([])
const awards = ref<Award[]>([])
const researchResume = ref<ResumeConfig>({
  profile: {},
  education: [],
  experience: [],
  skills: [],
  campus: [],
  projects: [],
  awards: [],
})
const resumeLocale = ref<ResumeLocale>('zh')
const { locale: appLocale, t } = useI18n()
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
const selectedColorSchemeKey = ref<ThemeColorSchemeKey>('theme-default')
const resumeSize = ref<ResumeSize>('standard')
const preserveExportBackground = ref(true)
const resumeBackground = ref('#fffdf7')
const enableTitleBackground = ref(false)

const RESUME_THEME_STORAGE_KEY = 'resume-theme-preset-v1'
const RESUME_SIZE_STORAGE_KEY = 'resume-font-size-v1'
const RESUME_BACKGROUND_STORAGE_KEY = 'resume-background-v1'
const RESUME_PRESERVE_BG_STORAGE_KEY = 'resume-preserve-bg-v1'
const RESUME_LOCALE_STORAGE_KEY = 'resume-locale-v1'
const ENABLE_TITLE_BACKGROUND_STORAGE_KEY = 'enable-title-background-v1'
const THEME_SECTION_ORDER_STORAGE_KEY = 'resume-theme-section-order-v1'
const THEME_COLOR_SCHEME_STORAGE_KEY = 'resume-theme-color-scheme-v1'

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
  { key: 'blue-white', label: '浅蓝白', value: '#f3f7fb' },
  { key: 'beige', label: '米白', value: '#f7f2e8' },
  { key: 'soft-green', label: '浅鼠尾草', value: '#eff3ee' },
] as const

const THEME_COLOR_SCHEMES: ThemeColorScheme[] = [
  {
    key: 'theme-default',
    label: '跟随主题',
    primary: '',
    secondary: '',
    accent: '',
  },
  {
    key: 'business-blue',
    label: '商务蓝',
    primary: '#1d4ed8',
    secondary: '#2563eb',
    accent: '#0f766e',
  },
  {
    key: 'business-green',
    label: '商务绿',
    primary: '#166534',
    secondary: '#15803d',
    accent: '#0f766e',
  },
  {
    key: 'business-slate',
    label: '黑灰',
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#52525b',
  },
  {
    key: 'business-amber',
    label: '棕黄',
    primary: '#92400e',
    secondary: '#b45309',
    accent: '#78350f',
  },
]

const currentTheme = computed(() => getResumeTheme(selectedThemeKey.value))
const isResearchTheme = computed(() => currentTheme.value.key === 'research-scholar')
const activeProfile = computed({
  get: () => (isResearchTheme.value ? researchResume.value.profile : profile.value),
  set: (value: Profile) => {
    if (isResearchTheme.value) researchResume.value.profile = value
    else profile.value = value
  },
})
const activeEducation = computed({
  get: () => (isResearchTheme.value ? researchResume.value.education : education.value),
  set: (value: EducationConfig[]) => {
    if (isResearchTheme.value) researchResume.value.education = value
    else education.value = value
  },
})
const activeExperience = computed({
  get: () => (isResearchTheme.value ? researchResume.value.experience : experience.value),
  set: (value: ExperienceConfig[]) => {
    if (isResearchTheme.value) researchResume.value.experience = value
    else experience.value = value
  },
})
const activeSkills = computed({
  get: () => (isResearchTheme.value ? researchResume.value.skills || [] : []),
  set: (value: SkillItem[]) => {
    if (isResearchTheme.value) researchResume.value.skills = value
  },
})
const activeCampus = computed({
  get: () => (isResearchTheme.value ? researchResume.value.campus || [] : []),
  set: (value: CampusItem[]) => {
    if (isResearchTheme.value) researchResume.value.campus = value
  },
})
const activeProjects = computed({
  get: () => (isResearchTheme.value ? researchResume.value.projects || [] : projects.value),
  set: (value: Project[]) => {
    if (isResearchTheme.value) researchResume.value.projects = value
    else projects.value = value
  },
})
const activeAwards = computed({
  get: () => (isResearchTheme.value ? researchResume.value.awards || [] : awards.value),
  set: (value: Award[]) => {
    if (isResearchTheme.value) researchResume.value.awards = value
    else awards.value = value
  },
})
const sectionCounts = computed(() => ({
  education: activeEducation.value.length,
  experience: activeExperience.value.length,
  skills: activeSkills.value.length,
  campus: activeCampus.value.length,
  projects: activeProjects.value.length,
  awards: activeAwards.value.length,
}))
const themeSectionOrderMap = ref<Record<string, ReorderableSectionKey[]>>({})
const draggedSectionKey = ref<ReorderableSectionKey | null>(null)
const draggedSectionIndex = ref<number | null>(null)

const getThemeBaseSectionOrder = (themeKey: string): ReorderableSectionKey[] => {
  return getResumeTheme(themeKey).layout.sectionOrder.filter(
    (section): section is ReorderableSectionKey => section !== 'profile',
  )
}

const normalizeThemeSectionOrder = (
  themeKey: string,
  customOrder: unknown,
): ReorderableSectionKey[] => {
  const baseOrder = getThemeBaseSectionOrder(themeKey)
  if (!Array.isArray(customOrder)) return baseOrder

  const allowSet = new Set(baseOrder)
  const normalizedOrder: ReorderableSectionKey[] = []

  for (const section of customOrder) {
    if (typeof section !== 'string') continue
    if (!allowSet.has(section as ReorderableSectionKey)) continue
    const nextSection = section as ReorderableSectionKey
    if (!normalizedOrder.includes(nextSection)) {
      normalizedOrder.push(nextSection)
    }
  }

  for (const section of baseOrder) {
    if (!normalizedOrder.includes(section)) {
      normalizedOrder.push(section)
    }
  }

  return normalizedOrder
}

const ensureThemeSectionOrder = (themeKey: string) => {
  const normalizedOrder = normalizeThemeSectionOrder(themeKey, themeSectionOrderMap.value[themeKey])
  themeSectionOrderMap.value = {
    ...themeSectionOrderMap.value,
    [themeKey]: normalizedOrder,
  }
}

const updateCurrentThemeSectionOrder = (nextOrder: ReorderableSectionKey[]) => {
  const themeKey = currentTheme.value.key
  themeSectionOrderMap.value = {
    ...themeSectionOrderMap.value,
    [themeKey]: normalizeThemeSectionOrder(themeKey, nextOrder),
  }
}

const moveCurrentThemeSection = (fromIndex: number, toIndex: number) => {
  const currentOrder = normalizeThemeSectionOrder(
    currentTheme.value.key,
    themeSectionOrderMap.value[currentTheme.value.key],
  )
  if (fromIndex === toIndex) return
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= currentOrder.length ||
    toIndex >= currentOrder.length
  ) {
    return
  }

  const nextOrder = [...currentOrder]
  const [movedSection] = nextOrder.splice(fromIndex, 1)
  nextOrder.splice(toIndex, 0, movedSection)
  updateCurrentThemeSectionOrder(nextOrder)
}

const onSectionDragStart = (sectionKey: ReorderableSectionKey, index: number, event: DragEvent) => {
  draggedSectionKey.value = sectionKey
  draggedSectionIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

const onSectionDragOver = (index: number, event: DragEvent) => {
  if (draggedSectionIndex.value === null) return
  event.preventDefault()
  if (draggedSectionIndex.value === index) return
  moveCurrentThemeSection(draggedSectionIndex.value, index)
  draggedSectionIndex.value = index
}

const onSectionDrop = (event: DragEvent) => {
  event.preventDefault()
  draggedSectionKey.value = null
  draggedSectionIndex.value = null
}

const onSectionDragEnd = () => {
  draggedSectionKey.value = null
  draggedSectionIndex.value = null
}

const effectiveThemeSectionOrder = computed<ResumeThemeSectionKey[]>(() => {
  const baseOrder = currentTheme.value.layout.sectionOrder
  const reorderedSections = normalizeThemeSectionOrder(
    currentTheme.value.key,
    themeSectionOrderMap.value[currentTheme.value.key],
  )

  let reorderIndex = 0
  return baseOrder.map((section) => {
    if (section === 'profile') return section
    const mappedSection = reorderedSections[reorderIndex]
    reorderIndex += 1
    return mappedSection ?? section
  })
})

const orderableSections = computed(() =>
  normalizeThemeSectionOrder(
    currentTheme.value.key,
    themeSectionOrderMap.value[currentTheme.value.key],
  ).map((sectionKey) => ({
    key: sectionKey,
    label: t(`section.${sectionKey}`),
    count: sectionCounts.value[sectionKey],
  })),
)
const currentSizePreset = computed(
  () => RESUME_SIZE_PRESETS.find((item) => item.key === resumeSize.value) ?? RESUME_SIZE_PRESETS[2],
)
const isExporting = computed(() => exportingType.value !== 'none')
const currentProfileName = computed(() =>
  resolveLocalizedText(activeProfile.value.name, resumeLocale.value),
)
const languageText = computed(() =>
  resumeLocale.value === 'zh' ? 'Switch to English' : '切换中文',
)
const modeText = computed(() => (isEditing.value ? '编辑模式' : '预览模式'))
const exportingText = computed(() => {
  if (exportingType.value === 'html') return '导出HTML中...'
  if (exportingType.value === 'pdf') return '导出PDF中...'
  return '导出'
})

const themeSections = computed(() => {
  const sidebarSet = new Set(currentTheme.value.layout.sidebarSections)
  const sidebarSections = effectiveThemeSectionOrder.value.filter((section) =>
    sidebarSet.has(section),
  )
  const mainSections = effectiveThemeSectionOrder.value.filter(
    (section) => !sidebarSet.has(section),
  )
  return {
    sidebarSections: sidebarSections.filter((section) =>
      sectionHasData(section, sectionCounts.value),
    ),
    mainSections: mainSections.filter((section) => sectionHasData(section, sectionCounts.value)),
  }
})
const groupedThemes = computed(() => [
  {
    label: '求职向',
    themes: resumeThemes.filter((theme) => theme.key !== 'research-scholar'),
  },
  {
    label: '科研保研',
    themes: resumeThemes.filter((theme) => theme.key === 'research-scholar'),
  },
])

const currentColorScheme = computed(
  () =>
    THEME_COLOR_SCHEMES.find((item) => item.key === selectedColorSchemeKey.value) ||
    THEME_COLOR_SCHEMES[0],
)

const currentBackgroundLabel = computed(() => {
  const preset = RESUME_BACKGROUND_OPTIONS.find((item) => item.value === resumeBackground.value)
  return preset?.label || '自定义颜色'
})

const resumeScaleStyle = computed(() => {
  const baseStyle = buildThemeStyleVars(currentTheme.value, {
    backgroundColor: resumeBackground.value,
    fontScale: currentSizePreset.value.scale,
    titleScale: currentSizePreset.value.titleScale,
    avatarScale: currentSizePreset.value.avatarScale,
  })

  if (currentColorScheme.value.key === 'theme-default') {
    return baseStyle
  }

  return {
    ...baseStyle,
    '--color-primary': currentColorScheme.value.primary,
    '--color-secondary': currentColorScheme.value.secondary,
    '--color-accent': currentColorScheme.value.accent,
  }
})

const resumeData = computed<ResumeConfig>({
  get: () => ({
    profile: activeProfile.value,
    education: activeEducation.value,
    experience: activeExperience.value,
    skills: activeSkills.value,
    campus: activeCampus.value,
    projects: activeProjects.value,
    awards: activeAwards.value,
  }),
  set: (next) => {
    activeProfile.value = next.profile || {}
    activeEducation.value = next.education || []
    activeExperience.value = next.experience || []
    activeProjects.value = next.projects || []
    activeAwards.value = next.awards || []
  },
})

const applyResumeData = (payload: Partial<ResumeConfig>) => {
  profile.value = payload.profile || {}
  education.value = payload.education || []
  experience.value = payload.experience || []
  projects.value = payload.projects || []
  awards.value = payload.awards || []
  researchResume.value = {
    profile: payload.research?.profile || {},
    education: payload.research?.education || [],
    experience: payload.research?.experience || [],
    skills: payload.research?.skills || [],
    campus: payload.research?.campus || [],
    projects: payload.research?.projects || [],
    awards: payload.research?.awards || [],
  }
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

  ensureThemeSectionOrder(nextTheme.key)
}

const setResumeSize = (size: ResumeSize) => {
  resumeSize.value = size
}

const setThemeColorScheme = (key: ThemeColorSchemeKey) => {
  selectedColorSchemeKey.value = key
}

const togglePreserveExportBackground = () => {
  preserveExportBackground.value = !preserveExportBackground.value
}

const toggleResumeLocale = () => {
  resumeLocale.value = resumeLocale.value === 'zh' ? 'en' : 'zh'
  appLocale.value = resumeLocale.value === 'zh' ? 'zhHans' : 'en'
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
  const fileBaseName = currentProfileName.value || 'resume'
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
    const fileBaseName = currentProfileName.value || 'resume'

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

watch(enableTitleBackground, (value) => {
  try {
    localStorage.setItem(ENABLE_TITLE_BACKGROUND_STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    console.warn('保存标题背景配置失败:', error)
  }
})

watch(selectedColorSchemeKey, (value) => {
  try {
    localStorage.setItem(THEME_COLOR_SCHEME_STORAGE_KEY, value)
  } catch (error) {
    console.warn('保存主题色配置失败:', error)
  }
})

watch(
  themeSectionOrderMap,
  (value) => {
    try {
      localStorage.setItem(THEME_SECTION_ORDER_STORAGE_KEY, JSON.stringify(value))
    } catch (error) {
      console.warn('保存模块顺序配置失败:', error)
    }
  },
  { deep: true },
)

watch(resumeLocale, (value) => {
  appLocale.value = value === 'zh' ? 'zhHans' : 'en'
  try {
    localStorage.setItem(RESUME_LOCALE_STORAGE_KEY, value)
  } catch (error) {
    console.warn('保存语言配置失败:', error)
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
    const cachedTitleBackground = localStorage.getItem(ENABLE_TITLE_BACKGROUND_STORAGE_KEY)
    if (cachedTitleBackground !== null) {
      enableTitleBackground.value = JSON.parse(cachedTitleBackground)
    }
  } catch (error) {
    console.warn('读取标题背景配置失败:', error)
  }

  try {
    const cachedThemeSectionOrder = localStorage.getItem(THEME_SECTION_ORDER_STORAGE_KEY)
    if (cachedThemeSectionOrder) {
      const parsed = JSON.parse(cachedThemeSectionOrder) as Record<string, unknown>
      if (parsed && typeof parsed === 'object') {
        const normalizedOrderMap: Record<string, ReorderableSectionKey[]> = {}
        for (const theme of resumeThemes) {
          normalizedOrderMap[theme.key] = normalizeThemeSectionOrder(theme.key, parsed[theme.key])
        }
        themeSectionOrderMap.value = normalizedOrderMap
      }
    }
  } catch (error) {
    console.warn('读取模块顺序配置失败:', error)
  }

  if (Object.keys(themeSectionOrderMap.value).length === 0) {
    const fallbackOrderMap: Record<string, ReorderableSectionKey[]> = {}
    for (const theme of resumeThemes) {
      fallbackOrderMap[theme.key] = getThemeBaseSectionOrder(theme.key)
    }
    themeSectionOrderMap.value = fallbackOrderMap
  }

  ensureThemeSectionOrder(selectedThemeKey.value)

  try {
    const cachedColorScheme = localStorage.getItem(THEME_COLOR_SCHEME_STORAGE_KEY)
    if (cachedColorScheme && THEME_COLOR_SCHEMES.some((item) => item.key === cachedColorScheme)) {
      selectedColorSchemeKey.value = cachedColorScheme as ThemeColorSchemeKey
    }
  } catch (error) {
    console.warn('读取主题色配置失败:', error)
  }

  try {
    const cachedLocale = localStorage.getItem(RESUME_LOCALE_STORAGE_KEY) as ResumeLocale | null
    if (cachedLocale === 'zh' || cachedLocale === 'en') {
      resumeLocale.value = cachedLocale
      appLocale.value = cachedLocale === 'zh' ? 'zhHans' : 'en'
    }
  } catch (error) {
    console.warn('读取语言配置失败:', error)
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
          <span class="theme-name-row">
            <span class="theme-name">{{ currentTheme.name }}</span>
            <button
              class="language-icon-btn"
              :disabled="isExporting"
              :title="languageText"
              :aria-label="languageText"
              @click="toggleResumeLocale"
            >
              <LogoIcon name="globe" />
            </button>
          </span>
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
          <LogoIcon name="file-import" /> 导入
        </button>

        <button
          class="export-btn icon-btn"
          :disabled="isExporting"
          :title="isEditing ? '结束编辑' : '编辑'"
          :aria-label="isEditing ? '结束编辑' : '编辑'"
          @click="toggleEditMode"
        >
          <LogoIcon name="edit" />
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

            <div class="font-size-panel-grid">
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
                  <template v-for="group in groupedThemes" :key="group.label">
                    <div class="theme-group-label">{{ group.label }}</div>
                    <button
                      v-for="theme in group.themes"
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
                  </template>
                </div>
              </div>

              <div class="panel-section">
                <div class="font-size-panel-header compact">
                  <span class="font-size-panel-title">模块排列顺序</span>
                  <span class="font-size-panel-value">拖拽调整</span>
                </div>

                <div class="section-order-list" role="list" aria-label="模块排列顺序">
                  <div
                    v-for="(section, index) in orderableSections"
                    :key="section.key"
                    class="section-order-item"
                    :class="{ dragging: draggedSectionKey === section.key }"
                    role="listitem"
                    draggable="true"
                    @dragstart="onSectionDragStart(section.key, index, $event)"
                    @dragover="onSectionDragOver(index, $event)"
                    @drop="onSectionDrop($event)"
                    @dragend="onSectionDragEnd"
                  >
                    <span class="section-order-handle" aria-hidden="true">::</span>
                    <span class="section-order-name">{{ section.label }}</span>
                    <span class="section-order-count">{{ section.count }}</span>
                  </div>
                </div>

                <p class="section-order-tip">拖拽模块名称可调整顺序，个人信息固定不参与排序。</p>
              </div>

              <div class="panel-section">
                <div class="font-size-panel-header compact">
                  <span class="font-size-panel-title">主题色配置模块</span>
                  <span class="font-size-panel-value">{{ currentColorScheme.label }}</span>
                </div>

                <div class="theme-color-schemes" role="radiogroup" aria-label="主题色配置">
                  <button
                    v-for="scheme in THEME_COLOR_SCHEMES"
                    :key="scheme.key"
                    class="theme-color-chip"
                    :class="{ active: scheme.key === selectedColorSchemeKey }"
                    :aria-checked="scheme.key === selectedColorSchemeKey"
                    role="radio"
                    @click="setThemeColorScheme(scheme.key)"
                  >
                    <span
                      v-if="scheme.key === 'theme-default'"
                      class="theme-color-default-badge"
                      aria-hidden="true"
                      >A</span
                    >
                    <span v-else class="theme-color-dots" aria-hidden="true">
                      <span
                        class="theme-color-dot"
                        :style="{ backgroundColor: scheme.primary }"
                      ></span>
                      <span
                        class="theme-color-dot"
                        :style="{ backgroundColor: scheme.secondary }"
                      ></span>
                      <span
                        class="theme-color-dot"
                        :style="{ backgroundColor: scheme.accent }"
                      ></span>
                    </span>
                    <span class="theme-color-name">{{ scheme.label }}</span>
                  </button>
                </div>
              </div>

              <div class="panel-section">
                <div class="font-size-panel-header compact">
                  <span class="font-size-panel-title">简历背景色</span>
                  <span class="font-size-panel-value">{{ currentBackgroundLabel }}</span>
                </div>

                <ColorPickerPanel
                  v-model="resumeBackground"
                  :presets="RESUME_BACKGROUND_OPTIONS"
                  custom-label="自定义颜色"
                />
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

              <div class="panel-section panel-section-wide">
                <div class="font-size-panel-header compact">
                  <span class="font-size-panel-title">开关卡片区</span>
                  <span class="font-size-panel-value">显示与导出</span>
                </div>

                <div class="toggle-card-grid">
                  <label class="toggle-card">
                    <span class="toggle-card-main">
                      <span class="toggle-card-title">导出背景</span>
                      <span class="toggle-card-desc">导出时保留当前背景色</span>
                    </span>
                    <input
                      :checked="preserveExportBackground"
                      type="checkbox"
                      @change="togglePreserveExportBackground"
                    />
                  </label>

                  <label class="toggle-card">
                    <span class="toggle-card-main">
                      <span class="toggle-card-title">标题背景</span>
                      <span class="toggle-card-desc">填充标题背景色</span>
                    </span>
                    <input v-model="enableTitleBackground" type="checkbox" />
                  </label>
                </div>
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
              v-model:profile="activeProfile"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              @edit="openSectionEditor('profile')"
            />
            <EduCard
              v-else-if="section === 'education'"
              v-model:education="activeEducation"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('education')"
            />
            <SkillCard
              v-else-if="section === 'skills'"
              v-model:skills="activeSkills"
              :editable="isEditing"
              :locale="resumeLocale"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('skills')"
            />
            <CampusCard
              v-else-if="section === 'campus'"
              v-model:campus="activeCampus"
              :editable="isEditing"
              :locale="resumeLocale"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('campus')"
            />
            <ExpCard
              v-else-if="section === 'experience'"
              v-model:experience="activeExperience"
              :editable="isEditing"
              :locale="resumeLocale"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('experience')"
            />
            <ProjectCard
              v-else-if="section === 'projects'"
              v-model:projects="activeProjects"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('projects')"
            />
            <AwardCard
              v-else
              v-model:awards="activeAwards"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('awards')"
            />
          </template>
        </aside>

        <main class="resume-main">
          <template v-for="section in themeSections.mainSections" :key="section">
            <ProfileCard
              v-if="section === 'profile'"
              v-model:profile="activeProfile"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              @edit="openSectionEditor('profile')"
            />
            <EduCard
              v-else-if="section === 'education'"
              v-model:education="activeEducation"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('education')"
            />
            <SkillCard
              v-else-if="section === 'skills'"
              v-model:skills="activeSkills"
              :editable="isEditing"
              :locale="resumeLocale"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('skills')"
            />
            <CampusCard
              v-else-if="section === 'campus'"
              v-model:campus="activeCampus"
              :editable="isEditing"
              :locale="resumeLocale"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('campus')"
            />
            <ExpCard
              v-else-if="section === 'experience'"
              v-model:experience="activeExperience"
              :editable="isEditing"
              :locale="resumeLocale"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('experience')"
            />
            <ProjectCard
              v-else-if="section === 'projects'"
              v-model:projects="activeProjects"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
              @edit="openSectionEditor('projects')"
            />
            <AwardCard
              v-else
              v-model:awards="activeAwards"
              :editable="isEditing"
              :locale="resumeLocale"
              :theme-key="currentTheme.key"
              :title-style="currentTheme.layout.sectionTitleStyle"
              :enable-title-background="enableTitleBackground"
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
      :locale="resumeLocale"
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
  flex: 1 1 0;
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

.theme-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--resume-theme-border);
  border-radius: 50%;
  background: var(--resume-theme-button-bg);
  color: var(--resume-theme-muted);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;
}

.language-icon-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, white);
}

.language-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 0;
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

.theme-group-label {
  width: 100%;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--resume-theme-subtle);
  padding-top: 8px;
  margin-top: 4px;
}

.font-size-menu,
.export-menu {
  position: relative;
}

.font-size-panel {
  position: absolute;
  right: 0;
  transform: translateX(min(50%, calc((100vw - min(794px, calc(100vw - 24px))) / 2 - 12px)));
  top: calc(100% + 8px);
  width: min(720px, calc(100vw - 24px));
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

.font-size-panel-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px 16px;
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
  margin-top: 0;
  padding-top: 12px;
  border-top: 1px solid var(--resume-theme-divider);
  min-width: 0;
}

.panel-section-wide {
  grid-column: 1 / -1;
}

.section-order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-order-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--resume-theme-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--resume-theme-paper) 92%, white);
  padding: 9px 10px;
  cursor: grab;
  user-select: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.section-order-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.section-order-item:active {
  cursor: grabbing;
}

.section-order-item.dragging {
  opacity: 0.72;
  border-color: var(--color-primary);
  transform: scale(0.99);
}

.section-order-handle {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--resume-theme-subtle);
}

.section-order-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--resume-theme-text);
}

.section-order-count {
  font-size: 12px;
  color: var(--resume-theme-subtle);
}

.section-order-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--resume-theme-subtle);
}

.theme-color-schemes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.theme-color-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--resume-theme-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--resume-theme-paper) 94%, white);
  color: var(--resume-theme-text);
  padding: 8px 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.theme-color-chip:hover,
.theme-color-chip.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-1px);
}

.theme-color-dots {
  display: inline-flex;
  gap: 4px;
  flex: 0 0 auto;
}

.theme-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.theme-color-default-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: var(--resume-theme-subtle);
  border: 1px solid var(--resume-theme-border);
}

.theme-color-name {
  font-size: 12px;
  font-weight: 600;
}

.toggle-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--resume-theme-border);
  border-radius: 14px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--resume-theme-paper) 92%, white);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.toggle-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-1px);
}

.toggle-card-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.toggle-card-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--resume-theme-text);
}

.toggle-card-desc {
  font-size: 12px;
  color: var(--resume-theme-subtle);
}

.toggle-card input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  flex: 0 0 auto;
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
    transform: none;
    width: min(560px, calc(100vw - 24px));
  }

  .font-size-panel-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .theme-color-schemes {
    grid-template-columns: 1fr;
  }

  .toggle-card-grid {
    grid-template-columns: 1fr;
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

  .font-size-panel {
    width: min(420px, calc(100vw - 24px));
    transform: none;
  }

  .import-url-row {
    grid-template-columns: 1fr;
  }

  .resume-shell {
    padding: 18px 16px;
  }
}
</style>
