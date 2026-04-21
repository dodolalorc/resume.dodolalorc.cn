<script setup lang="ts">
import type { EditorSection, ResumeConfig } from '@/types/resume'
import ResumeEditorDrawerModule from '@/views/modules/resume-editor/resume-editor-drawer.vue'

const open = defineModel<boolean>('open', { required: true })
const section = defineModel<EditorSection>('section', { required: true })
const resume = defineModel<ResumeConfig>('resume', { required: true })
</script>

<template>
  <ResumeEditorDrawerModule
    v-model:open="open"
    v-model:section="section"
    v-model:resume="resume"
  />
</template>
