# 标题背景色填充功能

## 功能描述

新增"填充标题背景色"选项，位于设置面板中"整体字体大小"和"简历背景色"之间。

## 功能特性

### 1. Checkbox 开关

- 位置：字体大小面板 -> "整体字体大小"下方
- 标签：`填充标题背景色`
- 状态持久化：自动保存到 localStorage（键名：`enable-title-background-v1`）

### 2. 样式效果

当启用时，简历中各模块的标题将获得以下效果：

#### 背景色

- **颜色**：使用当前主题的主题色（primary color）
- **不透明度**：12%（`color-mix(in srgb, var(--color-primary) 12%, white)`）
- **覆盖范围**：仅在文字后面，不填满整行
- **实现方式**：使用 `display: inline-block` 确保背景只覆盖文字宽度

#### 分隔线对齐

- 标题后的横向分隔线从文字的基线（baseline）开始
- 通过 `align-self: flex-end` 和 `margin-bottom: 0.35em` 实现
- 使文字显得"在线上"而不是生硬的中间出现

### 3. 适用的标题

#### 标准主题（非科研）

- 教育经历（edu-title）
- 工作经历（exp-title）
- 项目经历（project-title）
- 奖项（award-title）

#### 科研主题（research-scholar）

- 教育经历（edu-title）
- 工作经历（exp-title）
- 掌握技能（exp-title - skills）
- 校园经历（exp-title - campus）
- 项目经历（project-title）
- 奖项（award-title）

## 实现细节

### 修改的文件

1. **src/views/resume-view.vue**

   - 添加 `enableTitleBackground` ref（默认值：false）
   - 添加存储键常量
   - 添加 watch 监听以保存状态
   - 在 onMounted 中恢复状态
   - 为所有卡片组件传递 `:enable-title-background` prop

2. **src/views/components/edu-card.vue**

   - 接收 `enableTitleBackground` prop
   - 在 h2.edu-title 上添加 `:class="{ 'with-background': enableTitleBackground }"`
   - 添加 `.edu-title.with-background` 样式

3. **src/views/components/exp-card.vue**

   - 接收 `enableTitleBackground` prop
   - 为三个标题（掌握技能、校园经历、工作经历）添加 class 绑定
   - 添加 `.exp-title.with-background` 样式

4. **src/views/components/project-card.vue**

   - 接收 `enableTitleBackground` prop
   - 在 h2.project-title 上添加 class 绑定
   - 添加 `.project-title.with-background` 样式

5. **src/views/components/award-card.vue**
   - 接收 `enableTitleBackground` prop
   - 在 h2.award-title 上添加 class 绑定
   - 添加 `.award-title.with-background` 样式

### CSS 样式规则

```scss
&.with-background {
  display: inline-block;
  background-color: color-mix(in srgb, var(--color-primary) 12%, white);
  padding: 2px 8px;
  border-radius: 3px;
}
```

分隔线调整：

```scss
.edu-divider {
  align-self: flex-end;
  margin-bottom: 0.35em;
}
```

## 用户使用流程

1. 点击设置按钮（齿轮图标）打开设置面板
2. 在"整体字体大小"下方找到"填充标题背景色"选项
3. 勾选复选框启用功能
4. 所有简历模块的标题立即获得背景色填充效果
5. 设置自动保存，页面刷新后保持该状态

## 技术要点

- **状态管理**：使用 Vue 3 Composition API 的 `ref`
- **持久化**：localStorage API
- **响应式**：Vue 的模板响应式绑定
- **样式**：SCSS 嵌套和 CSS color-mix 函数
- **兼容性**：支持所有现代浏览器（CSS color-mix 需要现代浏览器）

## 分支信息

- **分支名称**：`feature/title-background-color`
- **提交哈希**：d53c9cd
- **提交信息**：feat: add title background color feature
