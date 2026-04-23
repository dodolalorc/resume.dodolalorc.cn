import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { ResumeSize } from '@/types/resume'

export type PdfExportMode = 'screen' | 'print'

interface ExportPDFOptions {
  mode: PdfExportMode
  resumeSelector?: string
  fileBaseName?: string
  size?: ResumeSize
}

interface ExportHTMLOptions {
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
}

interface BuildExportHTMLOptions {
  mode?: PdfExportMode | 'html'
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
}

interface ExportPrintPDFViaServerOptions {
  apiEndpoint?: string
  surfaceSelector?: string
  fileBaseName?: string
  size?: ResumeSize
}

const getElement = (selector: string, errorText: string) => {
  const element = document.querySelector(selector) as HTMLElement | null
  if (!element) throw new Error(errorText)
  return element
}

const todayString = () => new Date().toISOString().split('T')[0]

const PRINT_PAGE_MARGIN_MM = 12
const PRINT_EXPORT_REQUEST_TIMEOUT_MS = 30_000
const EXPORT_FONT_FAMILY =
  "'LXGW Bright', 'LXGW WenKai', 'PingFang SC', 'Microsoft YaHei', sans-serif"

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

export const buildExportHTML = ({
  mode = 'html',
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
}: BuildExportHTMLOptions = {}) => {
  const sourceElement = getElement(surfaceSelector, '找不到简历容器')
  const element = sourceElement.cloneNode(true) as HTMLElement
  element.setAttribute('data-export-size', size)
  const styleText = collectStyleText()
  const stylesheetLinks = collectStylesheetLinks()
  const bodyBg = getComputedStyle(document.body).backgroundColor || '#f3efe6'
  const title = `${fileBaseName}_${todayString()}`
  const bodyBgForMode = mode === 'print' ? '#ffffff' : bodyBg
  const bodyDisplayForMode = mode === 'print' ? 'block' : 'flex'
  const bodyPaddingForMode = mode === 'print' ? '0' : '24px 16px'

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${stylesheetLinks}
  <style>
    :root {
      color-scheme: light;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html,
    body {
      width: 100%;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: ${bodyBgForMode};
      display: ${bodyDisplayForMode};
      justify-content: center;
      padding: ${bodyPaddingForMode};
      box-sizing: border-box;
      font-family: ${EXPORT_FONT_FAMILY};
    }

    .resume-shell {
      width: 100%;
      max-width: 920px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    @page {
      size: A4 portrait;
      margin: ${PRINT_PAGE_MARGIN_MM}mm;
    }

    @media print {
      html,
      body {
        background: #ffffff !important;
      }

      body {
        display: block !important;
        padding: 0 !important;
      }

      .resume-shell {
        max-width: none !important;
        width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
      }

      .profile-card,
      .edu-shell,
      .exp-shell,
      .project-shell,
      .award-shell,
      .edu-item,
      .exp-item,
      .project-item,
      .award-item {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }

    ${styleText}
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`

  return {
    html,
    title,
  }
}

export const exportResumePDF = async ({
  mode,
  resumeSelector = '.resume-shell',
  fileBaseName = 'resume',
  size = 'standard',
}: ExportPDFOptions) => {
  let cleanupSnapshot: (() => void) | null = null

  try {
    const source = getElement(resumeSelector, '找不到简历内容容器')
    source.setAttribute('data-export-size', size)
    const snapshot = mode === 'print' ? createPrintSnapshotElement(source) : null
    const element = snapshot?.element ?? source
    cleanupSnapshot = snapshot?.cleanup ?? null

    const bgColor =
      mode === 'print' ? '#ffffff' : getComputedStyle(document.body).backgroundColor || '#f3efe6'

    const baseScale = Math.min(Math.max(window.devicePixelRatio || 1, 1.7), 3)
    const area = element.scrollWidth * element.scrollHeight
    const maxPixels = mode === 'print' ? 16_000_000 : 12_000_000
    const adaptiveScale = Math.min(baseScale, Math.sqrt(maxPixels / Math.max(area, 1)))
    const scale = Math.max(1.6, adaptiveScale)

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: bgColor,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
      windowWidth: element.scrollWidth,
    })

    const maxWidthPx = mode === 'print' ? 2480 : 2200
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

    const usePng = mode === 'print'
    const imgData = usePng
      ? finalCanvas.toDataURL('image/png')
      : finalCanvas.toDataURL('image/jpeg', 0.92)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      precision: 2,
    })

    const pageWidthMm = 210
    const pageHeightMm = 297
    const imgHeightMm = (finalCanvas.height * pageWidthMm) / finalCanvas.width
    let heightLeft = imgHeightMm
    let yOffset = 0

    pdf.addImage(imgData, usePng ? 'PNG' : 'JPEG', 0, yOffset, pageWidthMm, imgHeightMm)
    heightLeft -= pageHeightMm

    while (heightLeft > 0) {
      yOffset = heightLeft - imgHeightMm
      pdf.addPage()
      pdf.addImage(imgData, usePng ? 'PNG' : 'JPEG', 0, yOffset, pageWidthMm, imgHeightMm)
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
}: ExportPrintPDFViaServerOptions = {}) => {
  const { html, title } = buildExportHTML({
    mode: 'print',
    surfaceSelector,
    fileBaseName,
    size,
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
}: ExportHTMLOptions) => {
  const { html, title } = buildExportHTML({
    mode: 'html',
    surfaceSelector,
    fileBaseName,
    size,
  })
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${title}.html`)
}
