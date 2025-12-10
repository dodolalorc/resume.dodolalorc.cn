<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ViewLayout from '@/layout/view-layout.vue'
import ProfileCard from './components/ProfileCard.vue'
import EduCard from './components/EduCard.vue'
import ExpCard from './components/ExpCard.vue'
import ProjectCard from './components/ProjectCard.vue'
import AwardCard from './components/AwardCard.vue'
import ResumeToolbar from './components/ResumeToolbar.vue'
import ResumeEditorDrawer from './components/ResumeEditorDrawer.vue'
import { useResumeStore, type ThemeKey } from '@/stores/resume'
import type { EditorSection } from './types'

const resumeStore = useResumeStore()
const { resume, currentTheme, themes, themeKey, autosaveEnabled, lastSavedAt } = storeToRefs(resumeStore)

const isEditing = ref(false)
const activeSection = ref<EditorSection>('profile')
const isExporting = ref(false)
const resumeRoot = ref<HTMLElement | null>(null)

const themeVars = computed(() => ({
  '--color-primary': currentTheme.value.colors.primary,
  '--color-secondary': currentTheme.value.colors.secondary,
  '--color-accent': currentTheme.value.colors.accent,
  '--color-surface': currentTheme.value.colors.surface,
  '--color-muted': currentTheme.value.colors.muted,
  '--color-text': currentTheme.value.colors.text,
}))

const lastSavedText = computed(() => {
  if (!lastSavedAt.value) return '未保存'
  const date = new Date(lastSavedAt.value)
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
})

const ensureArrays = () => {
  resume.value.education ??= []
  resume.value.experience ??= []
  resume.value.projects ??= []
  resume.value.awards ??= []

  resume.value.profile.avatar ??= { url: '', rounded: true, size: 140 }
  resume.value.profile.jobIntention ??= { city: '', position: '', salary: '' }
  resume.value.profile.prepend ??= 'both'

  resume.value.education.forEach((item) => {
    item.eduTime ??= ['', '']
  })
  resume.value.experience.forEach((item) => {
    item.jobTime ??= ['', '']
    item.jobDesc ??= ['']
  })
  resume.value.projects.forEach((item) => {
    item.projectTime ??= ['', '']
    item.techStack ??= []
    item.projectAchievements ??= []
    item.mainWork ??= []
  })
  resume.value.awards.forEach((item) => {
    item.level ??= ''
    item.date ??= ''
  })
}

ensureArrays()

onMounted(() => {
  resumeStore.load()
  ensureArrays()
})

const exportToPDF = async () => {
  if (!resumeRoot.value) return

  try {
    isExporting.value = true
    const element = resumeRoot.value
    const scale = Math.min(1.2, window.devicePixelRatio || 1)
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
    })

    const MAX_WIDTH_PX = 1200
    let finalCanvas = canvas
    if (canvas.width > MAX_WIDTH_PX) {
      const off = document.createElement('canvas')
      off.width = MAX_WIDTH_PX
      off.height = Math.round((canvas.height * MAX_WIDTH_PX) / canvas.width)
      const ctx = off.getContext('2d')
      if (ctx) ctx.drawImage(canvas, 0, 0, off.width, off.height)
      finalCanvas = off
    }

    const imgData = finalCanvas.toDataURL('image/jpeg', 0.7)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = 210
    const pdfHeight = 297
    const margin = 10
    const imgWidthMm = pdfWidth - margin * 2
    const imgHeightMm = (finalCanvas.height * imgWidthMm) / finalCanvas.width

    let drawWidth = imgWidthMm
    let drawHeight = imgHeightMm
    if (imgHeightMm > pdfHeight - margin * 2) {
      const scaleFactor = (pdfHeight - margin * 2) / imgHeightMm
      drawWidth = imgWidthMm * scaleFactor
      drawHeight = imgHeightMm * scaleFactor
    }

    const x = (pdfWidth - drawWidth) / 2
    const y = (pdfHeight - drawHeight) / 2
    pdf.addImage(imgData, 'JPEG', x, y, drawWidth, drawHeight)

    const fileName = `${resume.value.profile?.name || 'resume'}_${new Date()
      .toISOString()
      .split('T')[0]}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('PDF导出失败:', error)
    alert('PDF导出失败，请稍后重试')
  } finally {
    isExporting.value = false
  }
}

const exportJson = () => {
  resumeStore.exportJson()
}

const resetData = () => {
  const ok = confirm('确定重置到默认数据吗？此操作会覆盖当前更改。')
  if (!ok) return
  resumeStore.reset()
  ensureArrays()
}

const toggleEditing = () => {
  isEditing.value = !isEditing.value
}

const setTheme = (key: ThemeKey) => {
  resumeStore.setTheme(key)
}
</script>

<template>
  <ViewLayout>
    <div class="w-full max-w-6xl px-6 pb-10 pt-6" :style="themeVars">
      <ResumeToolbar :themes="themes" :theme-key="themeKey" v-model:autosave-enabled="autosaveEnabled"
        :last-saved-text="lastSavedText" :is-editing="isEditing" :is-exporting="isExporting"
        @toggle-edit="toggleEditing" @export-pdf="exportToPDF" @export-json="exportJson" @reset="resetData"
        @set-theme="setTheme" />

      <div ref="resumeRoot" class="resume-shell">
        <ProfileCard v-model:profile="resume.profile" />
        <div class="mt-6 flex flex-col gap-8">
          <EduCard v-model:education="resume.education" />
          <ExpCard v-model:experience="resume.experience" />
          <ProjectCard v-if="resume.projects?.length" v-model:projects="resume.projects" />
          <AwardCard v-if="resume.awards?.length" v-model:awards="resume.awards" />
        </div>
      </div>
    </div>

    <ResumeEditorDrawer v-model:open="isEditing" v-model:section="activeSection" v-model:resume="resume" />
  </ViewLayout>
</template>

<style scoped>
.resume-shell {
  width: 100%;
  max-width: 1080px;
  min-height: 100%;
  background: linear-gradient(135deg, var(--color-surface), #ffffff);
  border: 1px solid var(--color-muted);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  margin: 0 auto;
}
</style>
