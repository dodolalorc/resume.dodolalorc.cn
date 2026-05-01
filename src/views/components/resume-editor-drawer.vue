<script setup lang="ts">
import type { EditorSection, ResumeConfig, ResumeLocale } from '@/types/resume'
import ResumeEditorDrawerModule from '@/views/modules/resume-editor/resume-editor-drawer.vue'

const open = defineModel<boolean>('open', { required: true })
const section = defineModel<EditorSection>('section', { required: true })
const resume = defineModel<ResumeConfig>('resume', { required: true })

defineProps<{
  locale: ResumeLocale
}>()
</script>

<template>
  <ResumeEditorDrawerModule
    v-model:open="open"
    v-model:section="section"
    v-model:resume="resume"
    :locale="locale"
  />
</template>
