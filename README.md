# 📄 Resume.dodolalorc.cn

> 基于 Vue 3 + TypeScript + TailwindCSS 构建的现代化个人简历网站

一个响应式、多语言、可配置的在线简历展示平台，支持通过 JSON 配置快速生成个人简历。

## ✨ 特性

- 🎨 **现代化设计** - 基于 TailwindCSS 的精美 UI 设计
- 🌍 **多语言支持** - 支持中文简体、繁体、英文、日文
- 📱 **响应式布局** - 完美适配桌面端和移动端
- ⚡ **性能优化** - 基于 Vite 构建，快速开发和部署
- 🔧 **配置驱动** - 通过 JSON 文件轻松配置个人信息
- 🎯 **TypeScript** - 完整的类型支持，提高开发效率
- 🧪 **测试覆盖** - 集成 Vitest 单元测试
- 📦 **组件化** - 模块化组件设计，易于维护和扩展

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
├── cv.json              # 个人简历数据配置
└── ...
```

## ⚙️ 配置说明

### 个人信息配置

编辑 `cv.json` 文件来配置你的个人信息：

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
  "skills": [...]
}
```

### 图标资源

本项目使用的图标来源：

- **Font Awesome** - 提供丰富的图标库
- **阿里巴巴矢量图标库** - 提供中文化的图标支持

所有图标以 SVG 格式存储在 `src/assets/icons/` 目录下。

## 📋 开发进度 (TODO)

### ✅ 已完成

- [x] 项目基础架构搭建
- [x] Vue 3 + TypeScript + Vite 环境配置
- [x] TailwindCSS 样式系统集成
- [x] 多语言 (i18n) 支持
- [x] 路由系统配置
- [x] 状态管理 (Pinia) 集成
- [x] 基础组件开发 (header-bar, profile-card)
- [x] 个人信息配置系统 (cv.json)
- [x] TypeScript 类型定义
- [x] SVG 图标库集成
- [x] 代码规范工具配置 (ESLint, Prettier, Biome)

### 🚧 进行中

- [ ] 完善简历页面布局设计
- [ ] 个人信息卡片组件完善
- [ ] 响应式布局优化

### 📅 待开发

- [ ] 教育经历模块
- [ ] 工作经验模块
- [ ] 技能展示模块
- [ ] 项目经历模块
- [ ] 获奖荣誉模块
- [ ] PDF 导出功能
- [ ] 主题切换功能 (明/暗主题)
- [ ] 打印样式优化
- [ ] SEO 优化
- [ ] 性能优化
- [ ] 单元测试完善
- [ ] 部署文档
- [ ] 移动端适配优化
- [ ] 动画效果增强
- [ ] 社交媒体链接组件

### 🎯 未来规划

- [ ] 多套简历模板支持
- [ ] 在线编辑器
- [ ] 简历分析功能
- [ ] 数据可视化图表
- [ ] 微信小程序版本
- [ ] 后端 API 集成
- [ ] 用户系统

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
- **博客**: [dodolalorc.cn](https://dodolalorc.cn/)

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
