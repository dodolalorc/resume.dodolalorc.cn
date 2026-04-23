import { describe, expect, it } from 'vitest'
import {
    defaultResumeTheme,
    getResumeTheme,
    resolveThemeSections,
    resumeThemeMap,
    resumeThemes,
    sectionHasData,
} from '@/themes'

describe('resume theme registry', () => {
    it('registers preset themes and keeps ascending order by order field', () => {
        expect(resumeThemes.length).toBeGreaterThanOrEqual(4)

        const sorted = [...resumeThemes].sort((a, b) => a.order - b.order).map((item) => item.key)
        const actual = resumeThemes.map((item) => item.key)

        expect(actual).toEqual(sorted)

        const presetKeys = ['minimal-paper', 'professional-balance', 'modern-clarity', 'tech-grid']
        for (const key of presetKeys) {
            expect(actual).toContain(key)
            expect(resumeThemeMap[key]).toBeDefined()
        }
    })
})

describe('resume theme fallback', () => {
    it('uses default theme when key is empty or unknown', () => {
        expect(defaultResumeTheme).toBeDefined()
        expect(defaultResumeTheme.key).toBe('minimal-paper')

        expect(getResumeTheme(undefined).key).toBe(defaultResumeTheme.key)
        expect(getResumeTheme(null).key).toBe(defaultResumeTheme.key)
        expect(getResumeTheme('').key).toBe(defaultResumeTheme.key)
        expect(getResumeTheme('not-exists-theme').key).toBe(defaultResumeTheme.key)
    })

    it('returns exact theme when key exists', () => {
        const theme = getResumeTheme('tech-grid')
        expect(theme.key).toBe('tech-grid')
        expect(theme.name).toBe('技术导向')
    })
})

describe('resume theme sections', () => {
    it('splits sidebar/main sections according to layout', () => {
        const professional = getResumeTheme('professional-balance')
        const professionalSections = resolveThemeSections(professional)

        expect(professionalSections.sidebarSections).toEqual(['education', 'awards'])
        expect(professionalSections.mainSections).toEqual(['profile', 'experience', 'projects'])

        const tech = getResumeTheme('tech-grid')
        const techSections = resolveThemeSections(tech)

        expect(techSections.sidebarSections).toEqual(['profile', 'education', 'awards'])
        expect(techSections.mainSections).toEqual(['projects', 'experience'])
    })

    it('checks whether section has data', () => {
        const counts = {
            education: 0,
            experience: 2,
            projects: 1,
            awards: 0,
        }

        expect(sectionHasData('profile', counts)).toBe(true)
        expect(sectionHasData('experience', counts)).toBe(true)
        expect(sectionHasData('projects', counts)).toBe(true)
        expect(sectionHasData('education', counts)).toBe(false)
        expect(sectionHasData('awards', counts)).toBe(false)
    })
})
