import type { LocalizedText, ResumeLocale } from '@/types/resume'

type TextRecord = Record<ResumeLocale, string>

const isTextRecord = (value: unknown): value is Partial<TextRecord> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

export const resolveLocalizedText = (
  value: LocalizedText | null | undefined,
  locale: ResumeLocale,
) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return value[locale] || value.zh || value.en || ''
}

export const setLocalizedText = <T extends Record<string, unknown>>(
  target: T,
  key: keyof T,
  locale: ResumeLocale,
  nextValue: string,
) => {
  const current = target[key]
  if (locale === 'zh' && !isTextRecord(current)) {
    target[key] = nextValue as T[keyof T]
    return
  }

  const nextRecord: Partial<TextRecord> = isTextRecord(current)
    ? { ...current }
    : { zh: typeof current === 'string' ? current : '' }
  nextRecord[locale] = nextValue
  target[key] = nextRecord as T[keyof T]
}

export const resolveLocalizedList = (
  value: LocalizedText[] | null | undefined,
  locale: ResumeLocale,
) => (value ?? []).map((item) => resolveLocalizedText(item, locale)).filter(Boolean)

const escapeHTML = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const renderInlineMarkdown = (
  value: LocalizedText | null | undefined,
  locale: ResumeLocale,
) =>
  escapeHTML(resolveLocalizedText(value, locale))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')

export const splitTags = (value: string) =>
  value
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
