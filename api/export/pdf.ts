import chromium from '@sparticuz/chromium'
import { chromium as playwrightChromium } from 'playwright-core'

const MAX_HTML_BYTES = 1_500_000
const MAX_FILE_NAME_BYTES = 120
const REQUEST_TIMEOUT_MS = 30_000

interface ExportPdfBody {
  html: string
  fileName?: string
}

type VercelLikeRequest = {
  method?: string
  body?: unknown
}

type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse
  setHeader: (name: string, value: string) => void
  send: (body: string | Buffer | object) => void
}

const parseBody = (body: unknown): ExportPdfBody | null => {
  if (!body) return null
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as ExportPdfBody
    } catch {
      return null
    }
  }
  if (typeof body === 'object') {
    return body as ExportPdfBody
  }
  return null
}

const htmlSize = (html: string) => Buffer.byteLength(html, 'utf8')

const safeFileName = (value?: string) => {
  const raw = value?.trim() || 'resume_print.pdf'
  const base = raw.replace(/[^\w\u4e00-\u9fa5.\-() ]/g, '_').slice(0, MAX_FILE_NAME_BYTES).trim()
  return base.endsWith('.pdf') ? base : `${base || 'resume_print'}.pdf`
}

const toErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'unknown error')

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).send('Method Not Allowed')
    return
  }

  const body = parseBody(req.body)
  if (!body || typeof body.html !== 'string') {
    res.status(400).send({ error: 'Invalid request body: html is required.' })
    return
  }

  const html = body.html.trim()
  if (!html) {
    res.status(400).send({ error: 'Invalid request body: html is empty.' })
    return
  }

  if (htmlSize(html) > MAX_HTML_BYTES) {
    res.status(413).send({ error: 'HTML payload too large.' })
    return
  }

  const fileName = safeFileName(body.fileName)
  const timeoutAbort = AbortSignal.timeout(REQUEST_TIMEOUT_MS)

  try {
    const executablePath = await chromium.executablePath()
    const browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
    })

    try {
      const page = await browser.newPage()
      await page.emulateMedia({ media: 'print' })

      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: REQUEST_TIMEOUT_MS,
      })

      await page.evaluate(
        () =>
          Promise.race([
            document.fonts?.ready ?? Promise.resolve(),
            new Promise((resolve) => setTimeout(resolve, 10_000)),
          ]),
      )

      if (timeoutAbort.aborted) {
        throw new Error('PDF rendering timed out')
      }

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        timeout: REQUEST_TIMEOUT_MS,
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.setHeader('Cache-Control', 'no-store')
      res.status(200).send(Buffer.from(pdf))
    } finally {
      await browser.close()
    }
  } catch (error) {
    res.status(500).send({ error: `Failed to generate PDF: ${toErrorMessage(error)}` })
  }
}
