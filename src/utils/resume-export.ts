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

interface PrintPDFOptions {
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

const PRINT_WINDOW_READY_TIMEOUT_MS = 10_000
const PRINT_FIT_SCALE_PRECISION = 1000
const PRINT_FIT_ITERATIONS = 4
const MIN_PRINT_LAYOUT_SCALE = 0.76
const PRINT_BASE_LAYOUT_SCALE = 0.92

const PRINT_SCALE_VARIABLES = [
  '--resume-font-scale',
  '--resume-title-scale',
  '--resume-avatar-scale',
] as const

const PRINT_LENGTH_VARIABLES = [
  '--resume-paper-padding',
  '--resume-shell-gap',
  '--resume-column-gap',
  '--resume-block-gap',
  '--resume-section-gap',
] as const

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

const createPrintFrame = () => {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.position = 'fixed'
  frame.style.left = '-10000px'
  frame.style.top = '0'
  frame.style.width = '210mm'
  frame.style.height = '297mm'
  frame.style.border = '0'
  frame.style.pointerEvents = 'none'
  frame.style.zIndex = '-1'
  document.body.appendChild(frame)
  return frame
}

const nextFrame = (targetWindow: Window) =>
  new Promise<void>((resolve) => targetWindow.requestAnimationFrame(() => resolve()))

const waitForWindowLoad = (printWindow: Window) =>
  new Promise<void>((resolve) => {
    const printDocument = printWindow.document
    if (printDocument.readyState === 'complete') {
      resolve()
      return
    }

    printWindow.addEventListener('load', () => resolve(), { once: true })
  })

const waitForImages = async (printDocument: Document) => {
  const images = Array.from(printDocument.images)
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    }),
  )
}

const waitForFonts = async (printDocument: Document) => {
  await (printDocument.fonts?.ready ?? Promise.resolve())
}

const withTimeout = async (task: Promise<void>, timeoutMs: number) => {
  let timeoutId = 0
  try {
    await Promise.race([
      task,
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, timeoutMs)
      }),
    ])
  } finally {
    window.clearTimeout(timeoutId)
  }
}

const waitForPrintDocumentReady = async (printWindow: Window) => {
  await withTimeout(
    (async () => {
      await waitForWindowLoad(printWindow)
      await waitForImages(printWindow.document)
      await waitForFonts(printWindow.document)
      await nextFrame(printWindow)
      await nextFrame(printWindow)
    })(),
    PRINT_WINDOW_READY_TIMEOUT_MS,
  )
}

const removePrintFrameAfterDialog = (printFrame: HTMLIFrameElement, printWindow: Window) => {
  const removeFrame = () => {
    window.setTimeout(() => {
      printFrame.remove()
    }, 250)
  }

  printWindow.addEventListener(
    'afterprint',
    removeFrame,
    { once: true },
  )

  window.setTimeout(() => {
    if (document.body.contains(printFrame)) removeFrame()
  }, 60_000)
}

const normalizeFitScale = (scale: number) => {
  if (!Number.isFinite(scale) || scale <= 0) return 1
  return Math.min(1, Math.floor(scale * PRINT_FIT_SCALE_PRECISION) / PRINT_FIT_SCALE_PRECISION)
}

const normalizeLayoutScale = (scale: number) =>
  Math.max(MIN_PRINT_LAYOUT_SCALE, normalizeFitScale(scale))

const getPrintFitScale = (printDocument: Document) => {
  const surface = printDocument.querySelector('.resume-export-surface') as HTMLElement | null
  const shell = printDocument.querySelector('.resume-shell') as HTMLElement | null
  if (!surface || !shell) return 1

  const pageWidth = surface.clientWidth
  const pageHeight = surface.clientHeight
  const contentWidth = Math.max(shell.scrollWidth, shell.offsetWidth)
  const contentHeight = Math.max(shell.scrollHeight, shell.offsetHeight)

  if (!pageWidth || !pageHeight || !contentWidth || !contentHeight) return 1

  return normalizeFitScale(Math.min(pageWidth / contentWidth, pageHeight / contentHeight))
}

const readNumberVariable = (element: HTMLElement, name: string) => {
  const value = getComputedStyle(element).getPropertyValue(name).trim()
  const numberValue = Number.parseFloat(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const scaleLengthValue = (value: string, scale: number) =>
  value.replace(
    /(-?\d*\.?\d+)(px|rem|em|mm|cm|pt|pc|in|vh|vw|vmin|vmax|%)\b/g,
    (_token, amountText: string, unit: string) => {
      const amount = Number.parseFloat(amountText)
      if (!Number.isFinite(amount)) return `${amountText}${unit}`
      return `${Number((amount * scale).toFixed(3))}${unit}`
    },
  )

const applyLayoutScale = (shell: HTMLElement, scale: number) => {
  const surface = shell.closest('.resume-export-surface') as HTMLElement | null
  const targets = [surface, shell].filter((element): element is HTMLElement => Boolean(element))

  for (const variableName of PRINT_SCALE_VARIABLES) {
    const baseValue = readNumberVariable(shell, variableName)
    if (baseValue === null) continue

    for (const target of targets) {
      target.style.setProperty(variableName, String(Number((baseValue * scale).toFixed(4))))
    }
  }

  const shellStyles = getComputedStyle(shell)
  for (const variableName of PRINT_LENGTH_VARIABLES) {
    const baseValue = shellStyles.getPropertyValue(variableName).trim()
    if (!baseValue) continue

    for (const target of targets) {
      target.style.setProperty(variableName, scaleLengthValue(baseValue, scale))
    }
  }
}

const applyCompactPrintFit = async (printWindow: Window) => {
  const printDocument = printWindow.document
  const shell = printDocument.querySelector('.resume-shell') as HTMLElement | null

  printDocument.documentElement.classList.add('print-fit-mode')

  await nextFrame(printWindow)
  await nextFrame(printWindow)

  if (shell) {
    applyLayoutScale(shell, PRINT_BASE_LAYOUT_SCALE)
    await nextFrame(printWindow)

    for (let index = 0; index < PRINT_FIT_ITERATIONS; index += 1) {
      const nextScale = getPrintFitScale(printDocument)
      if (nextScale >= 0.998) break

      applyLayoutScale(shell, normalizeLayoutScale(nextScale))
      await nextFrame(printWindow)
    }
  }

  await nextFrame(printWindow)
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
    RESUME_CONTENT: element.outerHTML,
  })

  return {
    html,
    title,
  }
}

export const printResumePDF = async ({
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
  size = 'standard',
  preserveBackground = true,
  backgroundColor,
}: PrintPDFOptions = {}) => {
  const { html, title } = buildExportHTML({
    mode: 'pdf',
    surfaceSelector,
    fileBaseName,
    size,
    preserveBackground,
    backgroundColor,
  })

  const printFrame = createPrintFrame()
  const printWindow = printFrame.contentWindow
  if (!printWindow) {
    printFrame.remove()
    throw new Error('浏览器无法创建打印文档，请稍后重试')
  }

  try {
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    await waitForPrintDocumentReady(printWindow)
    await applyCompactPrintFit(printWindow)
    printWindow.document.title = title
    removePrintFrameAfterDialog(printFrame, printWindow)
    printWindow.focus()
    printWindow.print()
  } catch (error) {
    printFrame.remove()
    throw error
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
