# AI 友好化改造路线图

## 阶段 1：建立可靠边界（优先）

- 引入 `ResumeDocument`/`ResearchResume` 的明确类型，定义 JSON schema 版本和迁移入口。
- 将 JSON 文件和 URL 导入收敛为 `parseResumeImport()`：协议检查、体积限制、结构校验、用户可读错误。
- 为解析、主题顺序规范化、导入导出 round-trip 建立单测。

**完成标准：** 非法输入不污染页面状态；历史合法数据可读；类型与运行时规则一致。

## 阶段 2：收敛状态与副作用

- 选择 Pinia 或 composable 作为唯一状态归属；删除或接入当前未使用的 `useResumeStore`，不能维持双实现。
- 提取 `useResumeDocument`、`useResumePreferences`、`useResumeImportExport` 和 `useSectionOrder`。
- 用版本化的 preferences/document storage 服务集中管理 localStorage。

**完成标准：** `resume-view.vue` 仅保留页面装配与模板编排；所有状态可被独立测试。

## 阶段 3：模块化 UI 与主题契约

- 将工具栏、导入对话框、设置面板、简历画布拆分为明确组件。
- 用 section renderer 映射取代多处主题 key 条件分支；主题特有内容放在主题能力声明中。
- 为关键编辑器和预览卡片添加组件测试。

**完成标准：** 新增字段或主题时，影响面可通过类型和测试显式发现。

## 阶段 4：导出质量与交付自动化

- 为 HTML 和打印布局写浏览器级 smoke tests，覆盖单页、多页、长文本和带头像场景。
- 在 CI 中固定执行 type-check、unit、build；可选增加 lint 的只读检查命令，避免 `--fix` 混入验证。
- 增加贡献指南和 PR 模板，要求说明数据/打印影响。

**完成标准：** 每次变更都能由自动化验证构建与核心用户路径。
