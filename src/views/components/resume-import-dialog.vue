<script setup lang="ts">
import { ref } from 'vue'
import type { ResumeConfig } from '@/types/resume'
import { assertImportUrl, parseResumeImport, ResumeImportError } from '@/utils/resume-import'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{
  (event: 'import', document: ResumeConfig): void
}>()

const importJsonText = ref('')
const importUrl = ref('')
const importError = ref('')
const importingFromUrl = ref(false)
const importFileInputRef = ref<HTMLInputElement | null>(null)

const close = () => {
  open.value = false
  importError.value = ''
}

const triggerImportFile = () => importFileInputRef.value?.click()

const onImportFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    importJsonText.value = await file.text()
    parseResumeImport(importJsonText.value)
    importError.value = ''
  } catch (error) {
    importError.value = error instanceof ResumeImportError ? error.message : '读取文件失败，请重试'
  } finally {
    input.value = ''
  }
}

const fetchImportFromUrl = async () => {
  importingFromUrl.value = true
  importError.value = ''
  let timeoutId: number | undefined
  try {
    const url = assertImportUrl(importUrl.value.trim())
    const controller = new AbortController()
    timeoutId = window.setTimeout(() => controller.abort(), 10_000)
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new ResumeImportError(`URL 请求失败：${response.status}`)
    if (Number(response.headers.get('content-length') || 0) > 1_000_000) {
      throw new ResumeImportError('导入文件过大，最大支持 1 MB')
    }
    const text = await response.text()
    parseResumeImport(text)
    importJsonText.value = text
  } catch (error) {
    importError.value =
      error instanceof ResumeImportError ? error.message : 'URL 读取失败，请检查链接是否可访问'
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    importingFromUrl.value = false
  }
}

const applyImport = () => {
  try {
    emit('import', parseResumeImport(importJsonText.value))
    close()
    importJsonText.value = ''
    importUrl.value = ''
  } catch (error) {
    importError.value = error instanceof ResumeImportError ? error.message : '导入失败，请稍后重试'
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="import-overlay" @click.self="close">
      <div class="import-panel">
        <h3 class="import-title">导入简历 JSON</h3>
        <p class="import-tip">支持上传 JSON 文件、通过在线 URL 拉取、或直接粘贴 JSON 内容。</p>
        <div class="import-actions-row">
          <button class="export-btn" @click="triggerImportFile">上传 JSON 文件</button>
          <input ref="importFileInputRef" class="hidden-input" type="file" accept="application/json,.json" @change="onImportFileChange" />
        </div>
        <div class="import-url-row">
          <input v-model="importUrl" class="import-url-input" placeholder="在线 JSON URL，例如：https://example.com/resume.json" />
          <button class="export-btn" :disabled="importingFromUrl" @click="fetchImportFromUrl">
            {{ importingFromUrl ? '解析中...' : '从 URL 解析' }}
          </button>
        </div>
        <textarea v-model="importJsonText" class="import-textarea" placeholder="粘贴 JSON 内容"></textarea>
        <p v-if="importError" class="import-error">{{ importError }}</p>
        <div class="import-actions-row">
          <button class="export-btn" @click="close">取消</button>
          <button class="export-btn" @click="applyImport">应用导入</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.import-overlay { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; background: rgb(15 23 42 / 28%); }
.import-panel { width: min(700px, calc(100vw - 24px)); padding: 18px; border: 1px solid #d7dce4; border-radius: 24px; background: #fff; box-shadow: 0 18px 40px rgb(15 23 42 / 18%); }
.import-title { margin: 0; font-size: 20px; color: #1f2937; }
.import-tip { margin: 6px 0 12px; color: #64748b; font-size: 13px; }
.import-actions-row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.hidden-input { display: none; }
.import-url-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin: 10px 0; }
.import-url-input, .import-textarea { width: 100%; box-sizing: border-box; border: 1px solid #d7dce4; border-radius: 16px; padding: 10px 12px; color: #1f2937; outline: none; }
.import-url-input:focus, .import-textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 16%); }
.import-textarea { min-height: 220px; resize: vertical; }
.import-error { margin: 6px 0 0; color: #c53030; font-size: 13px; }
.export-btn { border: 1px solid #2563eb; border-radius: 10px; padding: 8px 12px; background: #2563eb; color: #fff; cursor: pointer; }
.export-btn:disabled { opacity: .6; cursor: not-allowed; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 640px) { .import-url-row { grid-template-columns: 1fr; } }
</style>
