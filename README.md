# Resume Builder · 在线简历生成器

一个基于 Vue 3 + TypeScript 构建的**在线简历填写与生成工具**。无需注册，打开即用，支持可视化编辑所有简历内容，并可一键导出为 PDF、HTML 或 JSON 格式。

> 🔗 在线体验：[resume.dodolalorc.cn](https://resume.dodolalorc.cn)  
> 📦 项目仓库：[github.com/dodolalorc/resume.dodolalorc.cn](https://github.com/dodolalorc/resume.dodolalorc.cn)

---

## 功能介绍

### 可视化编辑器

点击顶栏「编辑」按钮进入编辑模式，每个简历模块右上角出现编辑按钮，点击后侧边抽屉打开对应模块的编辑表单。支持编辑以下五个模块：

| 模块         | 支持字段                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| **个人信息** | 姓名、邮箱、电话、微信、头像（URL / 圆形 / 尺寸）、GitHub、博客、知乎、小红书、工作年限、意向职位 / 城市 / 薪资 |
| **教育经历** | 学校、学位、专业、起止时间、描述（支持 Markdown）；支持多条                                                     |
| **工作经历** | 公司、部门、职位、起止时间、工作内容列表（支持 Markdown）；支持多条                                             |
| **项目经历** | 项目名称、角色、描述、链接（URL + 显示文字）、起止时间、技术栈、主要工作、项目成果；支持多条                    |
| **所获奖项** | 奖项名称、等级、时间；支持多条                                                                                  |

### 数据导入

- **上传 JSON 文件** — 从本地选择之前导出的 `.json` 文件导入
- **从 URL 解析** — 填写在线 JSON 地址，自动 fetch 并解析填充
- **粘贴 JSON** — 直接在文本框中粘贴 JSON 字符串

### 导出功能

| 格式     | 说明                                                     |
| -------- | -------------------------------------------------------- |
| **PDF**  | 走浏览器原生打印预览（A4 / `@page`），可在系统对话框中保存为 PDF |
| **HTML** | 导出为独立 HTML 文件，内联样式，可离线查看或直接发送     |
| **JSON** | 导出当前简历全部数据为 JSON，用于备份或迁移              |

### 主题系统

内置 4 套可扩展的简历主题预设，实时切换，立即预览：

| 主题     | 风格     | 说明                              |
| -------- | -------- | --------------------------------- |
| 简约纸张 | 极简约风 | 白纸化单栏，校招/应届通用         |
| 稳重专业 | 稳重专业 | 双栏秩序结构，强调学历与经历层次  |
| 现代简约 | 现代简约 | 现代卡片 + 留白，清爽轻量         |
| 技术导向 | 技术导向 | 侧栏画像 + 项目优先，突出技术表达 |

每个主题都在 `src/themes/presets/` 下作为独立配置文件存在，结构一致，便于社区贡献。
主题能力由 `src/themes/types.ts`（类型约束）和 `src/themes/index.ts`（自动注册/读取）统一管理。

#### 新建主题（默认极简约风模板）

```bash
# 生成 src/themes/presets/my-theme.ts
bun run theme:new -- My Theme
```

生成文件基于 `src/themes/theme-template.ts`，默认是“极简约风”模板，可按需修改布局、配色、区块顺序与默认导出配置。

### 数据持久化

- **自动保存** — 编辑内容实时写入浏览器 `localStorage`，关闭页面不丢失
- **重置** — 一键恢复到内置默认数据（`src/data/cv.json`）
- **无需账号** — 所有数据存储在本地，不上传任何服务器

### 多语言支持

工具栏语言切换，支持以下 4 种语言：

- 🇨🇳 简体中文
- 🇹🇼 繁體中文
- 🇬🇧 English
- 🇯🇵 日本語

---

## 快速开始

### 环境要求

- Node.js >= 18
- [Bun](https://bun.sh/) >= 1.0（推荐）或 npm / pnpm

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/dodolalorc/resume.dodolalorc.cn.git
cd resume.dodolalorc.cn

# 安装依赖
bun install

# 启动开发服务器
bun dev
```

浏览器打开 `http://localhost:5173` 即可看到效果。

### PDF 导出说明

- `PDF`：前端生成隔离打印文档，等待样式、图片和字体加载完成后调用浏览器原生 `window.print()`。
- 在打印对话框中选择“另存为 PDF”即可保存文件；分页遵循 `@page` / `break-inside`，不使用 canvas 截图方案。

#### 本地开发运行方式

```bash
# 启动 Vite
bun dev
```

#### 部署说明

- 推荐部署到 **Vercel**（同仓库前端 + Serverless 一体化）。
- 仓库已提供 `vercel.json`，默认导入即可部署，无需在 Vercel UI 手动填写命令：
  - `installCommand`: `bun install`
  - `buildCommand`: `bun run build`
  - `outputDirectory`: `dist`
  - 路由：其他路径回退到 `index.html`（Vue Router history mode）。
- 已在 `package.json` 声明 `packageManager: bun@1.3.5`（与 `.bun-version` 一致），避免平台误判包管理器导致的安装/构建不一致。
- 若使用 **Cloudflare**，可作为可选方案单独实现（例如 Browser Rendering/其他服务端渲染方案）；本仓库当前未提供 Workers 版实现。

### 常用命令

```bash
bun dev           # 启动开发服务器（热更新）
bun run build     # 构建生产版本
bun preview       # 预览生产构建结果
bun lint          # ESLint + Biome 代码检查
bun run format    # Prettier 格式化代码
bun run type-check  # TypeScript 类型检查
bun test:unit     # 运行 Vitest 单元测试
bun run theme:new -- My Theme  # 通过极简约风模板新建主题文件
```

---

## 项目结构

```
src/
├── assets/icons/              # SVG 图标（Font Awesome / 阿里巴巴矢量库）
├── components/
│   └── common/                # 公共布局组件（HeaderBar 等）
├── data/
│   └── cv.json                # 内置默认简历数据（可直接编辑替换）
├── i18n/                      # 国际化文案（zh-Hans / zh-Hant / en / ja）
├── router/                    # Vue Router 路由配置
├── stores/
│   └── resume.ts              # Pinia 核心 Store（数据 + 自动保存）
├── themes/
│   ├── index.ts               # 主题加载/注册与样式变量构建
│   ├── types.ts               # 主题类型定义
│   ├── theme-template.ts      # 新建主题模板（默认极简约风）
│   └── presets/               # 主题预设目录（每个主题独立文件）
├── types/
│   └── resume.ts              # 全局 TypeScript 类型定义
├── utils/
│   └── resume-export.ts       # PDF / HTML 导出工具函数
└── views/
    ├── resume-view.vue        # 主页面（编辑/导入/导出入口）
    ├── components/            # 简历卡片展示组件（ProfileCard、EduCard 等）
    └── modules/
        └── resume-editor/     # 编辑器抽屉（各 section 独立 Vue 文件）
            ├── resume-editor-drawer.vue
            ├── section-profile.vue
            ├── section-education.vue
            ├── section-experience.vue
            ├── section-projects.vue
            └── section-awards.vue
```

### 关键数据流

```
cv.json（默认数据）
    ↓ 首次加载
Pinia Store（resume.ts）  ←→  localStorage（自动保存）
    ↓ computed
resume-view.vue（主视图）
    ├── 各 *Card.vue（展示层）
    └── resume-editor-drawer.vue（编辑层）
         └── section-*.vue（各模块表单）
```

---

## 自定义默认数据

编辑 `src/data/cv.json` 即可修改内置的默认简历模板，字段结构如下：

```json
{
  "profile": {
    "name": "姓名",
    "email": "your@email.com",
    "phone": "电话",
    "wechat": "微信",
    "avatar": { "url": "https://...", "rounded": true, "size": 140 },
    "github": { "url": "https://github.com/...", "label": "显示文字" },
    "blog": { "url": "https://...", "label": "显示文字" },
    "jobIntention": { "city": "意向城市", "position": "意向职位", "salary": "期望薪资" },
    "workExpYear": "3"
  },
  "education": [
    {
      "school": "学校名称",
      "degree": "本科",
      "major": "专业",
      "eduTime": ["2018-09", "2022-06"],
      "eduDesc": "描述，支持 **Markdown**"
    }
  ],
  "experience": [
    {
      "company": "公司名称",
      "partment": "部门",
      "jobTitle": "职位",
      "jobTime": ["2022-07", "至今"],
      "jobDesc": ["工作内容一", "工作内容二"]
    }
  ],
  "projects": [
    {
      "name": "项目名称",
      "role": "负责角色",
      "link": { "url": "https://...", "label": "项目链接" },
      "projectTime": ["2023-01", "2023-06"],
      "techStack": ["Vue 3", "TypeScript"],
      "projectDesc": "项目描述",
      "mainWork": [{ "title": "工作标题", "desc": "工作描述" }],
      "projectAchievements": ["成果一", "成果二"]
    }
  ],
  "awards": [{ "title": "奖项名称", "level": "一等奖", "date": "2023-11" }]
}
```

---

## 技术栈

| 类型     | 技术                          |
| -------- | ----------------------------- |
| 框架     | Vue 3.5 + Composition API     |
| 语言     | TypeScript 5.8                |
| 构建     | Vite 6                        |
| 状态     | Pinia 3                       |
| 路由     | Vue Router 4                  |
| 样式     | TailwindCSS 4                 |
| 国际化   | vue-i18n 11                   |
| PDF 导出 | 浏览器原生 `window.print()` |
| 代码质量 | ESLint + Biome + Prettier     |
| 测试     | Vitest                        |

---

## 参与贡献

**欢迎所有开源爱好者参与！** 无论是修复 Bug、优化样式、新增主题还是完善文档，贡献大小都同样受欢迎。

### 贡献方式

1. **Fork** 本仓库，克隆到本地
2. 创建新分支：`git checkout -b feat/your-feature`
3. 完成修改，确保代码通过检查：
   ```bash
   bun lint
   bun run type-check
   bun run build
   ```
4. 提交 commit（建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)）：
   ```
   feat: 添加新功能描述
   fix:  修复某个问题
   docs: 更新文档
   style: 样式调整
   refactor: 代码重构
   ```
5. 推送分支并提交 **Pull Request**，描述改动内容和动机

### 适合新手的贡献方向

- 🌍 **补全翻译** — `src/i18n/` 目录下的 `en.json`、`ja.json`、`zh-Hant.json` 中有部分字段尚未完整翻译
- 🎨 **新增主题** — 使用 `bun run theme:new -- <主题名>` 在 `src/themes/presets/` 生成并完善主题文件
- 🐛 **修复 Bug** — 查看 [Issues](https://github.com/dodolalorc/resume.dodolalorc.cn/issues) 中标记 `good first issue` 的任务
- 📝 **改进文档** — 完善使用说明、补充代码注释

### 适合进阶开发者的贡献方向

- 📱 移动端布局优化
- 🖨️ 打印样式进一步精细化
- ✅ 补充 Vitest 单元测试覆盖率
- 🔌 支持更多简历模板/布局
- ⚡ 性能优化（代码分割、懒加载）

### 提 Issue 前请确认

- 已阅读本 README
- 已在 Issues 列表中搜索是否有重复问题
- 提供清晰的复现步骤或截图

---

## 路线图

- [x] 可视化编辑模式（个人信息 / 教育 / 工作 / 项目 / 奖项）
- [x] PDF / HTML / JSON 多格式导出
- [x] JSON 导入（文件 / URL / 粘贴）
- [x] 主题系统（4 套配色）
- [x] 多语言支持（中 / 繁 / 英 / 日）
- [x] localStorage 自动保存
- [ ] 更多简历模板布局
- [ ] 打印样式深度优化
- [ ] 单元测试覆盖率提升
- [ ] SEO 与 meta 优化

---

## 浏览器支持

| Chrome | Firefox | Safari | Edge  |
| ------ | ------- | ------ | ----- |
| >= 88  | >= 78   | >= 14  | >= 88 |

---

## 许可证

[MIT License](./LICENSE) © 2024 [dodolalorc](https://github.com/dodolalorc)

---

## 联系作者

- **邮箱**: dodolalorc@gmail.com
- **博客**: [dodolalorc.cn](https://dodolalorc.cn/)
- **GitHub**: [@dodolalorc](https://github.com/dodolalorc)

如果这个项目对你有帮助，欢迎点个 ⭐ Star 支持一下！
