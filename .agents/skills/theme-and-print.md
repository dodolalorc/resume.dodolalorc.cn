# 主题与打印 Skill

主题注册依赖 `src/themes/index.ts` 的 `import.meta.glob`。主题配置必须可序列化、稳定排序，并包含 palette、layout、defaults 的完整字段。

修改预览样式时，同时检查：

1. 两套内置主题与自定义主题色。
2. 四档字号和空数据区块隐藏。
3. 编辑态控件不会进入 HTML/PDF。
4. A4 宽度、分页、背景开关、页码和图片加载。

`src/utils/resume-export.ts` 会复制 DOM 和样式到 iframe，并做打印缩放。不要以全局 `transform: scale()` 替代其中的布局适配；这通常会破坏分页和可打印区域。
