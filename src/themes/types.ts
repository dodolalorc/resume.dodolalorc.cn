import type { ResumeSize } from '@/types/resume'

export type ResumeThemeSectionKey =
  | 'profile'
  | 'education'
  | 'experience'
  | 'projects'
  | 'awards'

export type ResumeThemeProfileVariant = 'hero' | 'sidebar'
export type ResumeThemeSectionTitleStyle = 'divider' | 'capsule' | 'minimal'

export interface ResumeThemePalette {
  primary: string
  secondary: string
  accent: string
  canvas: string
  paper: string
  text: string
  mutedText: string
  subtleText: string
  border: string
  divider: string
  badgeBackground: string
  badgeText: string
  toolbarBackground: string
  toolbarText: string
  buttonBackground: string
  buttonText: string
  shadow: string
}

export interface ResumeThemeLayout {
  columns: 1 | 2
  sidebarWidth: string
  profileVariant: ResumeThemeProfileVariant
  sectionTitleStyle: ResumeThemeSectionTitleStyle
  sectionOrder: ResumeThemeSectionKey[]
  sidebarSections: ResumeThemeSectionKey[]
  paperPadding: string
  shellGap: string
  columnGap: string
  blockGap: string
  sectionGap: string
  paperRadius: string
}

export interface ResumeThemeDefaults {
  resumeSize: ResumeSize
  backgroundColor: string
  preserveExportBackground: boolean
}

export interface ResumeThemeMeta {
  key: string
  name: string
  description: string
  category: string
  audience: string
  previewTags: string[]
  order: number
}

export interface ResumeThemeConfig extends ResumeThemeMeta {
  palette: ResumeThemePalette
  layout: ResumeThemeLayout
  defaults: ResumeThemeDefaults
}
