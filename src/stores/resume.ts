import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ResumeConfig } from '@/types/resumeConfig'
import defaultCv from '@/data/cv.json'

export type ThemeKey = 'calm' | 'sunset' | 'forest' | 'mono'

export interface ThemeDefinition {
    key: ThemeKey
    name: string
    colors: {
        primary: string
        secondary: string
        accent: string
        surface: string
        muted: string
        text: string
    }
}

const themes: ThemeDefinition[] = [
    {
        key: 'calm',
        name: 'Calm Glacier',
        colors: {
            primary: '#2563eb',
            secondary: '#0ea5e9',
            accent: '#22c55e',
            surface: '#f8fafc',
            muted: '#e2e8f0',
            text: '#0f172a',
        },
    },
    {
        key: 'sunset',
        name: 'Sunset Bloom',
        colors: {
            primary: '#ea580c',
            secondary: '#f97316',
            accent: '#a855f7',
            surface: '#fff7ed',
            muted: '#fed7aa',
            text: '#1f2937',
        },
    },
    {
        key: 'forest',
        name: 'Forest Mist',
        colors: {
            primary: '#16a34a',
            secondary: '#22c55e',
            accent: '#0ea5e9',
            surface: '#f0fdf4',
            muted: '#bbf7d0',
            text: '#052e16',
        },
    },
    {
        key: 'mono',
        name: 'Mono Focus',
        colors: {
            primary: '#111827',
            secondary: '#1f2937',
            accent: '#4b5563',
            surface: '#f9fafb',
            muted: '#e5e7eb',
            text: '#0b0f19',
        },
    },
]

const STORAGE_KEY = 'resume-app-data-v1'
const THEME_STORAGE_KEY = 'resume-app-theme-v1'
const AUTOSAVE_STORAGE_KEY = 'resume-app-autosave-v1'

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const useResumeStore = defineStore('resume', () => {
    const resume = ref<ResumeConfig>(deepClone(defaultCv as ResumeConfig))
    const themeKey = ref<ThemeKey>('calm')
    const autosaveEnabled = ref(true)
    const lastSavedAt = ref<number | null>(null)

    const themeMap = computed<Record<ThemeKey, ThemeDefinition>>(() => {
        return themes.reduce((map, item) => {
            map[item.key] = item
            return map
        }, {} as Record<ThemeKey, ThemeDefinition>)
    })

    const currentTheme = computed(() => themeMap.value[themeKey.value] || themes[0])

    const persist = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resume.value))
            lastSavedAt.value = Date.now()
        } catch (error) {
            console.error('Failed to save resume data', error)
        }
    }

    const persistTheme = () => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, themeKey.value)
        } catch (error) {
            console.error('Failed to save theme', error)
        }
    }

    const persistAutosave = () => {
        try {
            localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(autosaveEnabled.value))
        } catch (error) {
            console.error('Failed to save autosave preference', error)
        }
    }

    const load = () => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY)
            if (cached) {
                resume.value = JSON.parse(cached)
                lastSavedAt.value = Date.now()
            }
        } catch (error) {
            console.warn('Failed to load cached resume, using defaults', error)
        }

        try {
            const themeCached = localStorage.getItem(THEME_STORAGE_KEY) as ThemeKey | null
            if (themeCached && themeMap.value[themeCached]) themeKey.value = themeCached
        } catch (error) {
            console.warn('Failed to load cached theme, using default', error)
        }

        try {
            const autosaveCached = localStorage.getItem(AUTOSAVE_STORAGE_KEY)
            if (autosaveCached !== null) autosaveEnabled.value = JSON.parse(autosaveCached)
        } catch (error) {
            console.warn('Failed to load autosave preference, using default', error)
        }
    }

    const reset = () => {
        resume.value = deepClone(defaultCv as ResumeConfig)
        persist()
    }

    const setTheme = (key: ThemeKey) => {
        if (!themeMap.value[key]) return
        themeKey.value = key
        persistTheme()
    }

    const exportJson = () => {
        const blob = new Blob([JSON.stringify(resume.value, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const date = new Date().toISOString().split('T')[0]
        link.href = url
        link.download = `resume-data-${date}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    watch(
        resume,
        () => {
            if (autosaveEnabled.value) persist()
        },
        { deep: true }
    )

    watch(themeKey, persistTheme)
    watch(autosaveEnabled, persistAutosave)

    return {
        resume,
        themeKey,
        themes,
        currentTheme,
        autosaveEnabled,
        lastSavedAt,
        load,
        reset,
        setTheme,
        exportJson,
        persist,
    }
})
