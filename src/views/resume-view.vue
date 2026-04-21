<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ViewLayout from '@/layout/view-layout.vue'
import type {
  ResumeConfig,
  Profile,
  EducationConfig,
  ExperienceConfig,
  Project,
  Award,
} from '@/types/resume'
import LogoIcon from '@/components/icon-logo.vue'
import profileCard from './components/profile-card.vue'
import eduCard from './components/edu-card.vue'
import expCard from './components/exp-card.vue'
import projectCard from './components/project-card.vue'
import awardCard from './components/award-card.vue'
import cvData from '@/data/cv.json'
import { exportResumeHTML, exportResumePDF } from '@/utils/resume-export'

const config = ref<Partial<ResumeConfig>>({})
const profile = ref<Profile>({})
const education = ref<EducationConfig[]>([])
const experience = ref<ExperienceConfig[]>([])
const projects = ref<Project[]>([]) // 项目经历
const awards = ref<Award[]>([]) // 奖项
const exportingType = ref<'none' | 'pdf-screen' | 'pdf-print' | 'html'>('none') // 导出状态
const showExportMenu = ref(false)
const exportMenuRef = ref<HTMLElement | null>(null)

const isExporting = computed(() => exportingType.value !== 'none')

const exportingText = computed(() => {
  if (exportingType.value === 'html') return '导出HTML中...'
  if (exportingType.value === 'pdf-screen') return '导出PDF(屏幕)中...'
  if (exportingType.value === 'pdf-print') return '导出PDF(打印)中...'
  return '导出'
})

const toggleExportMenu = () => {
  if (isExporting.value) return
  showExportMenu.value = !showExportMenu.value
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!showExportMenu.value) return
  const target = event.target as Node | null
  if (!target) return
  if (exportMenuRef.value?.contains(target)) return
  showExportMenu.value = false
}

const startExport = async (mode: 'html' | 'pdf-screen' | 'pdf-print') => {
  if (isExporting.value) return
  showExportMenu.value = false

  try {
    const fileBaseName = profile.value.name || 'resume'

    if (mode === 'html') {
      exportingType.value = 'html'
      exportResumeHTML({
        surfaceSelector: '.resume-export-surface',
        fileBaseName,
      })
      return
    }

    exportingType.value = mode
    await exportResumePDF({
      mode: mode === 'pdf-print' ? 'print' : 'screen',
      resumeSelector: '.resume-shell',
      fileBaseName,
    })
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请稍后重试')
  } finally {
    exportingType.value = 'none'
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)

  try {
    // 直接使用导入的JSON数据
    config.value = cvData as ResumeConfig
    profile.value = config.value.profile || {}
    education.value = config.value.education || []
    experience.value = config.value.experience || []
    projects.value = config.value.projects || []
    awards.value = config.value.awards || []
  } catch (error) {
    console.error('Error loading config:', error)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <ViewLayout>
    <!-- 导出按钮 -->
    <div class="export-toolbar">
      <div ref="exportMenuRef" class="export-menu">
        <button @click="toggleExportMenu" :disabled="isExporting" class="export-btn">
          <logo-icon v-if="!isExporting" name="file-export" />
          <div v-else class="loading-spinner"></div>
          {{ exportingText }}
        </button>

        <div v-if="showExportMenu && !isExporting" class="export-options">
          <button class="export-option" @click="startExport('html')">导出 HTML</button>
          <button class="export-option" @click="startExport('pdf-screen')">导出 PDF（屏幕）</button>
          <button class="export-option" @click="startExport('pdf-print')">导出 PDF（打印）</button>
        </div>
      </div>
    </div>

    <div class="resume-export-surface">
      <div class="resume-shell">
        <!-- 个人基本信息 -->
        <profile-card v-model:profile="profile" />
        <!-- 教育经历 -->
        <edu-card v-model:education="education" />
        <!-- 工作经历 -->
        <exp-card v-model:experience="experience" />
        <!-- 项目经历 -->
        <project-card v-if="projects.length" v-model:projects="projects" />
        <!-- 奖项 -->
        <award-card v-if="awards.length" v-model:awards="awards" />
      </div>
    </div>
  </ViewLayout>
</template>

<style scoped>
.export-toolbar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  max-width: min(210mm, calc(100vw - 24px));
  margin: 0 auto 10px;
}

.export-menu {
  position: relative;
}

.export-options {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 180px;
  background-color: #fffdf7;
  border: 1px solid #d6d0c4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.export-option {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  color: #2f2a24;
  cursor: pointer;
}

.export-option:hover {
  background-color: #f6f1e7;
}

.resume-export-surface {
  width: 100%;
  max-width: min(210mm, calc(100vw - 24px));
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #fffdf7;
  color: #2f2a24;
  border: 0;
  border-radius: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.export-btn:hover:not(:disabled) {
  background-color: #f6f1e7;
}

.export-btn:disabled {
  background-color: #ede7dc;
  color: #7b7468;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.resume-shell {
  width: 100%;
  max-width: none;
  height: fit-content;
  min-height: auto;
  display: flex;
  flex-direction: column;

  border: 0;
  border-radius: 0;

  padding: 22px 28px;
  margin: 0 auto;

  background-color: #fffdf7;
  box-sizing: border-box;
  box-shadow: none;
}

@media (max-width: 960px) {
  .resume-shell {
    padding: 16px;
  }
}
</style>
