# 架构基线（2026-07-16）

## 当前链路

```text
cv.json → resume-view.vue 的多个 ref → 编辑抽屉 / 预览卡片
                                    ├→ localStorage（设置项）
                                    └→ export-resume.html + iframe 打印
themes/*.ts → 主题注册表 → resume-view.vue → CSS 变量 / 卡片
```

## 已确认的问题

| 优先级 | 问题 | 证据 | 风险 |
| --- | --- | --- | --- |
| P0 | 运行时导入没有结构校验 | `applyImport` 仅 `JSON.parse` 后调用 `applyResumeData` | 畸形 JSON 可进入状态，后续渲染/导出不可靠 |
| P0 | 状态模型分裂 | 已注册的 `src/stores/resume.ts` 与 `resume-view.vue` 中实际使用的多组 `ref` 并存 | 修改一处不会反映到另一处，持久化与功能容易失效 |
| P1 | 核心页面过大 | `src/views/resume-view.vue` 约 2,030 行，同时管理状态、DOM 事件、设置、导入导出和模板 | 高冲突、高回归率，代理难以安全定位改动 |
| P1 | 持久化散落且键无统一版本/迁移 | 页面中定义并读写 7 个 localStorage 键，store 中还有 3 个未接入键 | 配置兼容无法集中管理，测试困难 |
| P1 | 自动化测试覆盖薄弱 | 当前只有主题注册表 1 个测试文件、5 个断言 | 导入、编辑、持久化、导出、主题切换均无回归保护 |
| P2 | 国际化与产品行为不一致 | 加载 `zh-Hans/zh-Hant/en/ja`，页面又固定 `resumeLocale = 'zh'` 且含大量硬编码中文 | 增加文案或恢复多语言时会产生双轨行为 |
| P2 | 类型命名与模型表达不清 | `avatarConfig`、`jobIntention`、`prependType` 未用 PascalCase，`research?: ResumeConfig` 无递归边界 | 公共契约难读，未来 schema 演进风险高 |

这份基线用于指导重构优先级；它不替代每次改动的测试与验收。
