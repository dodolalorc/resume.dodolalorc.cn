import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const themesDir = path.join(projectRoot, 'src', 'themes', 'presets')
const templatePath = path.join(projectRoot, 'src', 'themes', 'theme-template.ts')

const rawName = process.argv[2]?.trim()

if (!rawName) {
  console.error('Usage: bun run theme:new -- <theme-name>')
  process.exit(1)
}

const slug = rawName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

if (!slug) {
  console.error('Theme name must contain at least one letter or number.')
  process.exit(1)
}

const filePath = path.join(themesDir, `${slug}.ts`)

const template = await readFile(templatePath, 'utf8')
const content = template
  .replace("key: 'minimal-template'", `key: '${slug}'`)
  .replace("name: '极简约风'", `name: '${rawName}'`)
  .replace(
    "description: '用于新建主题的默认模版，可按需调整布局、颜色和区块顺序。'",
    `description: '${rawName} 主题，基于极简约风模板生成，可按需调整布局、颜色和区块顺序。'`,
  )

await mkdir(themesDir, { recursive: true })
await writeFile(filePath, content, { flag: 'wx' })

console.log(`Created theme file: ${path.relative(projectRoot, filePath)}`)
