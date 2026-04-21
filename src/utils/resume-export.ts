import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export type PdfExportMode = 'screen' | 'print'

interface ExportPDFOptions {
  mode: PdfExportMode
  resumeSelector?: string
  fileBaseName?: string
}

interface ExportHTMLOptions {
  surfaceSelector?: string
  fileBaseName?: string
}

const getElement = (selector: string, errorText: string) => {
  const element = document.querySelector(selector) as HTMLElement | null
  if (!element) throw new Error(errorText)
  return element
}

const todayString = () => new Date().toISOString().split('T')[0]

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

export const exportResumePDF = async ({
  mode,
  resumeSelector = '.resume-shell',
  fileBaseName = 'resume',
}: ExportPDFOptions) => {
  let cleanupSnapshot: (() => void) | null = null

  try {
    const source = getElement(resumeSelector, '找不到简历内容容器')
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

export const exportResumeHTML = ({
  surfaceSelector = '.resume-export-surface',
  fileBaseName = 'resume',
}: ExportHTMLOptions) => {
  const element = getElement(surfaceSelector, '找不到简历容器')
  const styleText = collectStyleText()
  const bodyBg = getComputedStyle(document.body).backgroundColor || '#f3efe6'
  const title = `${fileBaseName}_${todayString()}`

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      margin: 0;
      background: ${bodyBg};
      display: flex;
      justify-content: center;
      padding: 24px 16px;
      box-sizing: border-box;
    }

    .resume-shell {
      width: 100%;
      max-width: 920px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    @page {
      size: A4 portrait;
      margin: 12mm;
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

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.html`
  a.click()
  URL.revokeObjectURL(url)
}
