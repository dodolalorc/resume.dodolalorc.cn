import { describe, expect, it } from 'vitest'
import { assertImportUrl, parseResumeImport } from '@/utils/resume-import'

const validResume = JSON.stringify({
  schemaVersion: 1,
  profile: { name: '测试用户' },
  education: [],
  experience: [],
  projects: [],
  awards: [],
})

describe('parseResumeImport', () => {
  it('accepts a valid portable resume document', () => {
    expect(parseResumeImport(validResume).profile.name).toBe('测试用户')
  })

  it('accepts a research branch but rejects nested invalid research data', () => {
    const withResearch = JSON.stringify({ ...JSON.parse(validResume), research: JSON.parse(validResume) })
    expect(parseResumeImport(withResearch).research?.profile.name).toBe('测试用户')
    expect(() => parseResumeImport(JSON.stringify({ ...JSON.parse(validResume), research: [] }))).toThrow(
      '科研简历数据格式无效',
    )
  })

  it('rejects malformed JSON and invalid resume shapes', () => {
    expect(() => parseResumeImport('{')).toThrow('JSON 解析失败')
    expect(() => parseResumeImport(JSON.stringify({ profile: {}, education: {} }))).toThrow(
      '简历数据格式无效',
    )
  })
})

describe('assertImportUrl', () => {
  it('allows only HTTP(S) URLs', () => {
    expect(assertImportUrl('https://example.com/resume.json').hostname).toBe('example.com')
    expect(() => assertImportUrl('file:///tmp/resume.json')).toThrow('仅支持 HTTP 或 HTTPS')
  })
})
