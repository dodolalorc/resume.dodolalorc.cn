import type { CSSProperties } from 'vue'
import type { ResumeThemeConfig, ResumeThemeSectionKey } from '@/themes/types'

const modules = import.meta.glob('./presets/*.ts', {
  eager: true,
  import: 'default',
}) as Record<string, ResumeThemeConfig>

export const resumeThemes = Object.values(modules).sort((left, right) => left.order - right.order)

export const defaultResumeTheme = resumeThemes[0]

export const resumeThemeMap = resumeThemes.reduce<Record<string, ResumeThemeConfig>>((map, theme) => {
  map[theme.key] = theme
  return map
}, {})

export const getResumeTheme = (key: string | null | undefined) => {
  if (!key) return defaultResumeTheme
  return resumeThemeMap[key] || defaultResumeTheme
}

export const buildThemeStyleVars = (
  theme: ResumeThemeConfig,
  options: {
    backgroundColor: string
    fontScale: number
    titleScale: number
    avatarScale: number
  },
): CSSProperties => ({
  '--resume-font-scale': String(options.fontScale),
  '--resume-title-scale': String(options.titleScale),
  '--resume-avatar-scale': String(options.avatarScale),
  '--resume-surface-bg': options.backgroundColor,
  '--resume-theme-canvas': theme.palette.canvas,
  '--resume-theme-paper': theme.palette.paper,
  '--resume-theme-text': theme.palette.text,
  '--resume-theme-muted': theme.palette.mutedText,
  '--resume-theme-subtle': theme.palette.subtleText,
  '--resume-theme-border': theme.palette.border,
  '--resume-theme-divider': theme.palette.divider,
  '--resume-theme-badge-bg': theme.palette.badgeBackground,
  '--resume-theme-badge-text': theme.palette.badgeText,
  '--resume-theme-toolbar-bg': theme.palette.toolbarBackground,
  '--resume-theme-toolbar-text': theme.palette.toolbarText,
  '--resume-theme-button-bg': theme.palette.buttonBackground,
  '--resume-theme-button-text': theme.palette.buttonText,
  '--resume-theme-shadow': theme.palette.shadow,
  '--resume-paper-padding': theme.layout.paperPadding,
  '--resume-shell-gap': theme.layout.shellGap,
  '--resume-column-gap': theme.layout.columnGap,
  '--resume-sidebar-width': theme.layout.sidebarWidth,
  '--resume-block-gap': `calc(${theme.layout.blockGap} * var(--resume-font-scale))`,
  '--resume-section-gap': `calc(${theme.layout.sectionGap} * var(--resume-font-scale))`,
  '--resume-paper-radius': theme.layout.paperRadius,
  '--color-primary': theme.palette.primary,
  '--color-secondary': theme.palette.secondary,
  '--color-accent': theme.palette.accent,
  '--color-text': theme.palette.text,
})

export const resolveThemeSections = (theme: ResumeThemeConfig) => {
  const sidebarSet = new Set(theme.layout.sidebarSections)
  const sidebarSections = theme.layout.sectionOrder.filter((section) => sidebarSet.has(section))
  const mainSections = theme.layout.sectionOrder.filter((section) => !sidebarSet.has(section))

  return {
    sidebarSections,
    mainSections,
  }
}

export const sectionHasData = (
  section: ResumeThemeSectionKey,
  counts: Record<Exclude<ResumeThemeSectionKey, 'profile'>, number>,
) => {
  if (section === 'profile') return true
  return counts[section] > 0
}
