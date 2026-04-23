import type { ResumeSize } from '@/types/resume'
import exportResumeTemplate from '@/templates/export-resume.html?raw'

interface ExportHTMLOptions {
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

interface BuildExportHTMLOptions {
  mode?: 'pdf' | 'html'
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

interface ExportPDFViaServerOptions {
  apiEndpoint?: string
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

const getElement = (selector: string, errorText: string) => {
  const element = document.querySelector(selector) as HTMLElement | null
  if (!element) throw new Error(errorText)
  return element
}

const todayString = () => new Date().toISOString().split('T')[0]

const PRINT_PAGE_MARGIN_MM = 12
const PRINT_EXPORT_REQUEST_TIMEOUT_MS = 30_000

const collectStyleText = () => {
  const chunks: string[] = []

  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(styleSheet.cssRules)
      if (rules.length) chunks.push(rules.map((rule) => rule.cssText).join('\n'))
    } catch {
      // Ignore cross-origin stylesheets.
    }
  }

  for (const styleEl of Array.from(document.querySelectorAll('style'))) {
    if (styleEl.textContent) chunks.push(styleEl.textContent)
  }

  return chunks.join('\n')
}

const escapeHTMLAttr = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const collectStylesheetLinks = () =>
  Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
    .map((link) => link.getAttribute('href')?.trim())
    .filter((href): href is string => Boolean(href))
    .map((href) => {
      try {
        const resolvedHref = new URL(href, window.location.href).toString()
        return `<link rel="stylesheet" href="${escapeHTMLAttr(resolvedHref)}" />`
      } catch {
        return ''
      }
    })
    .filter(Boolean)
    .join('\n')

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

const applyTemplate = (template: string, replacements: Record<string, string>) => {
  return Object.entries(replacements).reduce((html, [key, value]) => {
    return html.split(`__${key}__`).join(value)
  }, template)
}

export const buildExportHTML = ({
  mode = 'html',
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
  preserveBackground = true,
  backgroundColor,
}: BuildExportHTMLOptions = {}) => {
  const sourceElement = getElement(surfaceSelector, '找不到简历容器')
  const element = sourceElement.cloneNode(true) as HTMLElement
  element.setAttribute('data-export-size', size)
  const bodyBg = getComputedStyle(document.body).backgroundColor || '#f3efe6'
  const exportBackground = preserveBackground ? bodyBg : backgroundColor || '#ffffff'
  element.style.backgroundColor = exportBackground
  const styleText = collectStyleText()
  const stylesheetLinks = collectStylesheetLinks()
  const bodyFontFamily = getComputedStyle(document.body).fontFamily
  const title = `${fileBaseName}_${todayString()}`
  const bodyDisplayForMode = mode === 'pdf' ? 'block' : 'flex'
  const bodyPaddingForMode = mode === 'pdf' ? '0' : '24px 16px'

  const html = applyTemplate(exportResumeTemplate, {
    EXPORT_TITLE: title,
    STYLESHEET_LINKS: stylesheetLinks,
    INLINE_STYLES: styleText,
    BODY_BACKGROUND: exportBackground,
    SURFACE_BACKGROUND: exportBackground,
    BODY_DISPLAY: bodyDisplayForMode,
    BODY_PADDING: bodyPaddingForMode,
    BODY_FONT_FAMILY: bodyFontFamily,
    PRINT_MARGIN: `${PRINT_PAGE_MARGIN_MM}mm`,
    RESUME_CONTENT: element.outerHTML,
  })

  return {
    html,
    title,
  }
}

export const exportResumePDFViaServer = async ({
  apiEndpoint = '/api/export/pdf',
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
  preserveBackground = true,
  backgroundColor,
}: ExportPDFViaServerOptions = {}) => {
  const { html, title } = buildExportHTML({
    mode: 'pdf',
    surfaceSelector,
    fileBaseName,
    size,
    preserveBackground,
    backgroundColor,
  })

  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(
    () => timeoutController.abort(),
    PRINT_EXPORT_REQUEST_TIMEOUT_MS,
  )

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        fileName: `${title}.pdf`,
      }),
      signal: timeoutController.signal,
    })

    if (!response.ok) {
      throw new Error(`PDF 服务失败（${response.status}）`)
    }

    const blob = await response.blob()
    if (!blob.size) {
      throw new Error('PDF 服务返回空文件')
    }

    downloadBlob(blob, `${title}.pdf`)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export const exportResumeHTML = ({
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
  preserveBackground = true,
  backgroundColor,
}: ExportHTMLOptions) => {
  const { html, title } = buildExportHTML({
    mode: 'html',
    surfaceSelector,
    fileBaseName,
    size,
    preserveBackground,
    backgroundColor,
  })
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${title}.html`)
}
