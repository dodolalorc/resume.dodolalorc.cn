# 简历数据与导入导出 Skill

## 数据事实

- 根类型是 `ResumeConfig`，定义在 `src/types/resume.ts`。
- 页面当前只展示简体中文，但需读取历史 `LocalizedText`：普通字符串或 `{ zh?, en? }`。
- 求职主题和科研主题使用不同数据分支：常规字段在根节点，科研内容在 `research` 节点。
- JSON 导入、JSON 导出、HTML 导出和打印 PDF 都是用户数据的边界。JSON 备份必须导出完整 document（含 `research`），HTML/PDF 只导出当前主题。

## 安全修改步骤

1. 先写清字段的 JSON 形状、是否可选、默认值和旧数据降级方式。
2. 更新 TypeScript 类型和 `src/data/cv.json` 示例。
3. 更新编辑器输入、预览卡片和主题差异化渲染。
4. 在导入路径增加运行时结构校验与可读错误信息；不要直接将 `unknown` 赋给响应式状态。
5. 验证 JSON 导出后能重新导入，HTML/PDF 中不包含编辑控件。

## 已知风险

- `research` 使用不含递归字段的 `ResearchResumeConfig`；迁移时不得再次引入无限嵌套。
- `resume-view.vue` 的 `resumeData` setter 没有写回 `skills` 与 `campus`，任何统一状态改造前都应先补测试并定义两种主题的行为。
- 远程 URL 导入应限制协议、处理超时和响应体大小；不能把网络返回值直接当作可信简历数据。
