import type { ResumeConfig } from '@/types/resume'

const MAX_IMPORT_BYTES = 1_000_000

export class ResumeImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResumeImportError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasArrayIfPresent = (value: Record<string, unknown>, key: string) =>
  value[key] === undefined || Array.isArray(value[key])

const isResumeContent = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.profile)) return false
  return ['education', 'experience', 'skills', 'campus', 'projects', 'awards'].every((key) =>
    hasArrayIfPresent(value, key),
  )
}

export const parseResumeImport = (source: string): ResumeConfig => {
  if (!source.trim()) throw new ResumeImportError('请选择或粘贴简历 JSON 内容')
  if (new Blob([source]).size > MAX_IMPORT_BYTES) {
    throw new ResumeImportError('导入文件过大，最大支持 1 MB')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  } catch {
    throw new ResumeImportError('JSON 解析失败，请检查格式')
  }

  if (!isResumeContent(parsed)) {
    throw new ResumeImportError('简历数据格式无效：需包含 profile，且经历字段必须为数组')
  }

  if (isRecord(parsed) && parsed.research !== undefined && !isResumeContent(parsed.research)) {
    throw new ResumeImportError('科研简历数据格式无效')
  }

  return parsed as ResumeConfig
}

export const assertImportUrl = (rawUrl: string) => {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new ResumeImportError('请输入有效的在线 JSON URL')
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new ResumeImportError('仅支持 HTTP 或 HTTPS 链接')
  }
  return url
}
