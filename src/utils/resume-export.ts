import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { ResumeSize } from '@/types/resume'
import exportResumeTemplate from '@/templates/export-resume.html?raw'

export type PdfExportMode = 'screen' | 'print'

interface ExportPDFOptions {
  mode: PdfExportMode
  resumeSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

interface ExportHTMLOptions {
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

interface BuildExportHTMLOptions {
  mode?: PdfExportMode | 'html'
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

interface ExportPrintPDFViaServerOptions {
  apiEndpoint?: string
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
  preserveBackground?: boolean
  backgroundColor?: string
}

interface CanvasRenderAttempt {
  foreignObjectRendering: boolean
  scale: number
}

const getElement = (selector: string, errorText: string) => {
  const element = document.querySelector(selector) as HTMLElement | null
  if (!element) throw new Error(errorText)
  return element
}

const todayString = () => new Date().toISOString().split('T')[0]

const PRINT_PAGE_MARGIN_MM = 12
const PRINT_EXPORT_REQUEST_TIMEOUT_MS = 30_000
const createPrintSnapshotElement = (source: HTMLElement) => {
  const wrapper = document.createElement('div')
  const clone = source.cloneNode(true) as HTMLElement

  wrapper.style.position = 'fixed'
  wrapper.style.left = '-10000px'
  wrapper.style.top = '0'
  wrapper.style.width = '794px'
  wrapper.style.padding = '0'
  wrapper.style.margin = '0'
  wrapper.style.background = '#ffffff'
  wrapper.style.zIndex = '-1'
  wrapper.style.pointerEvents = 'none'

  clone.style.width = '100%'
  clone.style.maxWidth = 'none'
  clone.style.margin = '0'
  clone.style.backgroundColor = '#ffffff'
  clone.style.boxShadow = 'none'
  clone.style.border = '0'

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  return {
    element: clone,
    cleanup: () => wrapper.remove(),
  }
}

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

const isCanvasLikelyBlank = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return false

  const sampleSize = 12
  const stepX = Math.max(1, Math.floor(canvas.width / sampleSize))
  const stepY = Math.max(1, Math.floor(canvas.height / sampleSize))
  const reference = context.getImageData(0, 0, 1, 1).data
  let differentPixels = 0

  for (let y = 0; y < canvas.height; y += stepY) {
    for (let x = 0; x < canvas.width; x += stepX) {
      const pixel = context.getImageData(x, y, 1, 1).data
      if (
        Math.abs(pixel[0] - reference[0]) > 4 ||
        Math.abs(pixel[1] - reference[1]) > 4 ||
        Math.abs(pixel[2] - reference[2]) > 4 ||
        Math.abs(pixel[3] - reference[3]) > 4
      ) {
        differentPixels += 1
        if (differentPixels >= 3) return false
      }
    }
  }

  return true
}

const renderResumeCanvas = async (
  element: HTMLElement,
  bgColor: string,
  mode: PdfExportMode,
) => {
  const baseScale = Math.min(Math.max(window.devicePixelRatio || 1, 2.6), 4.5)
  const area = element.scrollWidth * element.scrollHeight
  const maxPixels = mode === 'print' ? 42_000_000 : 32_000_000
  const adaptiveScale = Math.min(baseScale, Math.sqrt(maxPixels / Math.max(area, 1)))
  const preferredScale = Math.max(2.2, adaptiveScale)
  const fallbackScale = Math.max(1.8, Math.min(preferredScale, 2.4))

  const attempts: CanvasRenderAttempt[] = [
    { foreignObjectRendering: true, scale: preferredScale },
    { foreignObjectRendering: false, scale: preferredScale },
    { foreignObjectRendering: false, scale: fallbackScale },
  ]

  let lastCanvas: HTMLCanvasElement | null = null

  for (const attempt of attempts) {
    const canvas = await html2canvas(element, {
      scale: attempt.scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: bgColor,
      logging: false,
      foreignObjectRendering: attempt.foreignObjectRendering,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
      windowWidth: element.scrollWidth,
    })

    lastCanvas = canvas

    if (!isCanvasLikelyBlank(canvas)) {
      return canvas
    }

    console.warn(
      `检测到 PDF 导出画布可能为空白，回退重试（foreignObject=${String(attempt.foreignObjectRendering)}, scale=${attempt.scale.toFixed(2)}）`,
    )
  }

  if (!lastCanvas) throw new Error('简历导出失败：未生成画布')
  return lastCanvas
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
  const bodyBgForMode = exportBackground
  const bodyDisplayForMode = mode === 'print' ? 'block' : 'flex'
  const bodyPaddingForMode = mode === 'print' ? '0' : '24px 16px'

  const html = applyTemplate(exportResumeTemplate, {
    EXPORT_TITLE: title,
    STYLESHEET_LINKS: stylesheetLinks,
    INLINE_STYLES: styleText,
    BODY_BACKGROUND: bodyBgForMode,
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

export const exportResumePDF = async ({
  mode,
  resumeSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
  preserveBackground = true,
  backgroundColor,
}: ExportPDFOptions) => {
  let cleanupSnapshot: (() => void) | null = null

  try {
    const source = getElement(resumeSelector, '找不到简历内容容器')
    const sourceBg = getComputedStyle(document.body).backgroundColor || '#f3efe6'
    const exportBackground = preserveBackground ? sourceBg : backgroundColor || '#ffffff'
    const snapshot = createPrintSnapshotElement(source)
    const element = snapshot.element
    cleanupSnapshot = snapshot.cleanup
    element.setAttribute('data-export-size', size)
    element.style.backgroundColor = exportBackground

    const bgColor = exportBackground
    const canvas = await renderResumeCanvas(element, bgColor, mode)

    const maxWidthPx = mode === 'print' ? 3600 : 3200
    let finalCanvas = canvas
    if (canvas.width > maxWidthPx) {
      const off = document.createElement('canvas')
      off.width = maxWidthPx
      off.height = Math.round((canvas.height * maxWidthPx) / canvas.width)
      const ctx = off.getContext('2d')
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(canvas, 0, 0, off.width, off.height)
      }
      finalCanvas = off
    }

    const imgData = finalCanvas.toDataURL('image/png')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      precision: 12,
    })

    const pageWidthMm = 210
    const pageHeightMm = 297
    const imgHeightMm = (finalCanvas.height * pageWidthMm) / finalCanvas.width
    let heightLeft = imgHeightMm
    let yOffset = 0

    pdf.addImage(imgData, 'PNG', 0, yOffset, pageWidthMm, imgHeightMm)
    heightLeft -= pageHeightMm

    while (heightLeft > 0) {
      yOffset = heightLeft - imgHeightMm
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, yOffset, pageWidthMm, imgHeightMm)
      heightLeft -= pageHeightMm
    }

    pdf.save(`${fileBaseName}_${mode}_${todayString()}.pdf`)
  } finally {
    if (cleanupSnapshot) cleanupSnapshot()
  }
}

export const exportResumePDFPrintViaServer = async ({
  apiEndpoint = '/api/export/pdf',
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
  preserveBackground = true,
  backgroundColor,
}: ExportPrintPDFViaServerOptions = {}) => {
  const { html, title } = buildExportHTML({
    mode: 'print',
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
        fileName: `${title}_print.pdf`,
        size,
        preserveBackground,
        backgroundColor,
      }),
      signal: timeoutController.signal,
    })

    if (!response.ok) {
      throw new Error(`打印 PDF 服务失败（${response.status}）`)
    }

    const blob = await response.blob()
    if (!blob.size) {
      throw new Error('打印 PDF 服务返回空文件')
    }
    downloadBlob(blob, `${title}_print.pdf`)
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
