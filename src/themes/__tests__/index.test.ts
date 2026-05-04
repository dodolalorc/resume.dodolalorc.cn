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
        expect(resumeThemes.length).toBeGreaterThanOrEqual(2)

        const sorted = [...resumeThemes].sort((a, b) => a.order - b.order).map((item) => item.key)
        const actual = resumeThemes.map((item) => item.key)

        expect(actual).toEqual(sorted)

        const presetKeys = ['minimal-paper', 'research-scholar']
        for (const key of presetKeys) {
            expect(actual).toContain(key)
            expect(resumeThemeMap[key]).toBeDefined()
        }
    })
})

describe('resume theme fallback', () => {
    it('uses default theme when key is empty or unknown', () => {
        expect(defaultResumeTheme).toBeDefined()
        expect(defaultResumeTheme.key).toBe('research-scholar')

        expect(getResumeTheme(undefined).key).toBe(defaultResumeTheme.key)
        expect(getResumeTheme(null).key).toBe(defaultResumeTheme.key)
        expect(getResumeTheme('').key).toBe(defaultResumeTheme.key)
        expect(getResumeTheme('not-exists-theme').key).toBe(defaultResumeTheme.key)
    })

    it('returns exact theme when key exists', () => {
        const theme = getResumeTheme('research-scholar')
        expect(theme.key).toBe('research-scholar')
        expect(theme.name).toBe('科研保研')
    })
})

describe('resume theme sections', () => {
    it('splits sidebar/main sections according to layout', () => {
        const minimal = getResumeTheme('minimal-paper')
        const minimalSections = resolveThemeSections(minimal)

        expect(minimalSections.sidebarSections).toEqual([])
        expect(minimalSections.mainSections).toEqual(['profile', 'education', 'experience', 'projects', 'awards'])

        const research = getResumeTheme('research-scholar')
        const researchSections = resolveThemeSections(research)

        expect(researchSections.sidebarSections).toEqual([])
        expect(researchSections.mainSections).toEqual(['profile', 'education', 'skills', 'campus', 'projects', 'awards'])
    })

    it('checks whether section has data', () => {
        const counts = {
            education: 0,
            experience: 2,
            skills: 2,
            campus: 2,
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
