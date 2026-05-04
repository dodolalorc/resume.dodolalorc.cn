<script setup lang="ts">
import type { ResumeThemeSectionTitleStyle } from '@/themes/types'
import IconLogo from '@/components/icon-logo.vue'

withDefaults(
  defineProps<{
    title: string
    editable?: boolean
    enableTitleBackground?: boolean
    titleStyle?: ResumeThemeSectionTitleStyle
  }>(),
  {
    editable: false,
    enableTitleBackground: false,
    titleStyle: 'divider',
  },
)

const emit = defineEmits<{
  (e: 'edit'): void
}>()
</script>

<template>
  <div
    class="resume-section-header"
    :class="{
      'has-title-background': enableTitleBackground,
      'is-minimal': titleStyle === 'minimal',
    }"
  >
    <h2
      class="resume-section-title"
      :class="{
        'with-background': enableTitleBackground,
        'is-minimal': titleStyle === 'minimal',
      }"
    >
      {{ title }}
    </h2>
    <hr class="resume-section-divider" :class="{ 'with-background': enableTitleBackground }" />
    <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
      <IconLogo name="edit" />
    </button>
  </div>
</template>

<style scoped>
.section-edit-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #666;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 10px;
}
</style>
