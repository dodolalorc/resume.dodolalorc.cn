<template>
  <div class="do-editor">
    <textarea
      v-model="rawContent"
      @input="parseContent"
      placeholder="请输入内容..."
      rows="10"
      class="editor-textarea"
    ></textarea>
    <div class="editor-preview" v-html="parsedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rawContent = ref('')
const parsedContent = ref('')

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseContent() {
  let html = escapeHtml(rawContent.value)
  // 标题 ####、###、##、#
  html = html
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
  // 引用 >
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
  // 粗体 **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // 斜体 *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // 外部链接 [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
  // 分级任务 - 点样式
  html = html.replace(/^(\s*)- (.*)$/gm, (match, space, item) => {
    const indent = space.length / 2
    return `<li style="margin-left:${indent}em">${item}</li>`
  })
  // 包裹任务列表
  html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
  parsedContent.value = html
}
</script>

<style scoped>
.do-editor {
  display: flex;
  gap: 2rem;
}
.editor-textarea {
  width: 40%;
  min-height: 300px;
  font-size: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
}
.editor-preview {
  width: 60%;
  min-height: 300px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  overflow: auto;
}
h1,
h2,
h3,
h4 {
  margin: 0.5em 0;
}
blockquote {
  border-left: 4px solid #ccc;
  padding-left: 1em;
  color: #666;
  margin: 1em 0;
}
ul {
  padding-left: 1.5em;
}
li {
  margin: 0.3em 0;
}
</style>
