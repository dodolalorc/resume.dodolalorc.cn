# 📄 Resume.dodolalorc.cn

> 基于 Vue 3 + TypeScript + TailwindCSS 构建的现代化个人简历网站，内置可视化编辑、主题切换、PDF/JSON 导出与自动保存。

一个响应式、多语言、可配置的在线简历展示平台，支持实时编辑或通过 JSON 配置快速生成个人简历。

## ✨ 特性

- 🛠️ **可视化编辑** - 内置编辑面板，可随时增删改各简历段落
- 💾 **自动保存** - 本地存储、手动重置、导入导出 JSON
- 🎨 **主题系统** - 4 套可扩展主题（Calm/Sunset/Forest/Mono），实时切换
- 📄 **PDF/JSON 导出** - 一键生成 A4 PDF 或 JSON 数据备份
- 🌍 **多语言支持** - 支持中文简体、繁体、英文、日文
- 📱 **响应式布局** - 手写 Tailwind 风格原子类，桌面与移动友好
- 🔧 **配置驱动** - 通过 `src/data/cv.json` 或 UI 编辑同源数据
- 🎯 **TypeScript** - 完整的类型支持与严格模式

## 🛠️ 技术栈

### 核心技术

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供静态类型检查
- **Vite** - 下一代前端构建工具
- **Vue Router 4** - Vue.js 官方路由管理器
- **Pinia** - Vue 状态管理库

### 样式与UI

- **TailwindCSS 4** - 实用优先的 CSS 框架
- **SVG Icons** - 来自 Font Awesome 和阿里巴巴矢量库的图标

### 国际化

- **Vue I18n** - Vue.js 国际化插件

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Biome** - 快速格式化和检查工具
- **Oxlint** - 高性能 JavaScript/TypeScript 检查工具
- **Vitest** - 基于 Vite 的单元测试框架

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Bun >= 1.0 (推荐) 或 npm/yarn/pnpm

### 安装依赖

```bash
bun install
```

### 开发服务器

```bash
bun dev
```

### 构建生产版本

```bash
bun run build
```

### 预览生产版本

```bash
bun preview
```

### 代码检查和格式化

```bash
# 代码检查
bun lint

# 类型检查
bun run type-check

# 格式化代码
bun run format
```

### 运行测试

```bash
bun test:unit
```

## 📖 使用指南

1. 启动 `bun dev` 后在浏览器打开页面。
2. 顶部工具栏可切换主题、开关自动保存、进入/关闭编辑模式。
3. 编辑模式下，可在侧边抽屉增删改「个人信息/教育/工作/项目/奖项」；数据自动保存到本地存储。
4. 需要备份或迁移时：

- 点击「导出 JSON」保存当前数据
- 直接替换 `src/data/cv.json` 或在浏览器清空本地缓存后重新加载

5. 点击「导出 PDF」生成 A4 简历；如需恢复默认数据，使用「重置」按钮。

## 📁 项目结构

```
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   ├── icons/         # SVG 图标 (Font Awesome & 阿里巴巴矢量库)
│   │   └── ...
│   ├── components/        # 可复用组件
│   │   ├── common/        # 公共组件
│   │   └── ...
│   ├── i18n/             # 国际化配置
│   │   ├── zh-Hans.json  # 中文简体
│   │   ├── zh-Hant.json  # 中文繁体
│   │   ├── en.json       # 英文
│   │   └── ja.json       # 日文
│   ├── layout/           # 布局组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── views/            # 页面组件
│   └── main.ts          # 应用入口
├── src/data/cv.json     # 个人简历数据配置（默认模板，亦可通过 UI 覆盖）
└── ...
```

## ⚙️ 配置说明

### 个人信息配置

编辑 `src/data/cv.json` 文件或在 UI 中使用编辑模式，数据会写入本地存储：

```json
{
  "profile": {
    "name": "你的姓名",
    "avatar": {
      "url": "头像链接",
      "rounded": true,
      "size": 150
    },
    "email": "your@email.com",
    "phone": "电话号码",
    "github": "GitHub 链接",
    "blog": "博客链接",
    "jobIntention": {
      "city": "意向城市",
      "position": "意向职位",
      "salary": "期望薪资"
    }
  },
  "education": [...],
  "experience": [...],
  "projects": [...],
  "awards": [...]
}
```

### 图标资源

本项目使用的图标来源：

- **Font Awesome** - 提供丰富的图标库
- **阿里巴巴矢量图标库** - 提供中文化的图标支持

所有图标以 SVG 格式存储在 `src/assets/icons/` 目录下。

### 📋 开发进度 (TODO)

### ✅ 已完成

- [x] 可视化编辑模式 + 侧边抽屉
- [x] 主题系统与色板扩展
- [x] 自动保存 / 重置 / JSON 导出
- [x] PDF 导出（A4 尺寸，压缩优化）
- [x] 多语言与 i18n 文案补全

### 📅 待开发

- [ ] 打印样式进一步优化
- [ ] 更多主题/模板样式
- [ ] 关键流程单元测试补全
- [ ] SEO 与元信息优化
- [ ] 部署与使用文档完善

## 🎨 设计系统

- **主色调**: 现代化蓝色系
- **字体**: 系统字体栈，中英文混排优化
- **间距**: 基于 TailwindCSS 的 8px 基础间距系统
- **圆角**: 统一的圆角设计语言
- **阴影**: 层次化阴影系统

## 🌐 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 📝 开发建议

1. **组件开发**: 遵循 Vue 3 Composition API 最佳实践
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **响应式**: 移动端优先的响应式设计
4. **性能**: 注意组件懒加载和代码分割
5. **测试**: 为关键功能编写单元测试

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- **作者**: 哆哆啦
- **邮箱**: dodolalorc@gmail.com
- **GitHub**: [@dodolalorc](https://github.com/dodolalorc)
- **项目仓库**: https://github.com/dodolalorc/resume.dodolalorc.cn （喜欢的话点个 Star 吧）
- **博客**: [dodolalorc.cn](https://dodolalorc.cn/)

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
