<script setup lang="ts">
import { onMounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ViewLayout from '@/layout/view-layout.vue'
import type {
  ResumeConfig,
  Profile,
  EducationConfig,
  ExperienceConfig,
  Project,
  Award,
} from '@/types/resumeConfig'
import LogoIcon from '@/components/IconLogo.vue'
import profileCard from './components/ProfileCard.vue'
import eduCard from './components/EduCard.vue'
import expCard from './components/ExpCard.vue'
import projectCard from './components/ProjectCard.vue'
import awardCard from './components/AwardCard.vue'
import cvData from '@/data/cv.json'

const config = ref<Partial<ResumeConfig>>({})
const profile = ref<Profile>({})
const education = ref<EducationConfig[]>([])
const experience = ref<ExperienceConfig[]>([])
const projects = ref<Project[]>([]) // 项目经历
const awards = ref<Award[]>([]) // 奖项
const isExporting = ref(false) // 导出状态

// PDF导出功能 - 优化文件大小（降分辨率 + JPEG压缩）
const exportToPDF = async () => {
  try {
    isExporting.value = true

    const element = document.querySelector('.resume-shell') as HTMLElement
    if (!element) throw new Error('找不到简历容器')

    // 使用较低的 scale，结合之后的重新缩放与JPEG压缩，显著减小文件体积
    const scale = Math.min(1.2, window.devicePixelRatio || 1)
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
    })

    // 限制最大像素宽度，避免超大图片（而不是直接使用canvas的原始分辨率）
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

    // 使用JPEG并设置较低质量以压缩体积
    const imgData = finalCanvas.toDataURL('image/jpeg', 0.7)

    // 生成PDF并将图片按比例放入单页
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

    const fileName = `${profile.value.name || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('PDF导出失败:', error)
    alert('PDF导出失败，请稍后重试')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
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
</script>

<template>
  <ViewLayout>
    <!-- 导出按钮 -->
    <div class="export-toolbar">
      <button @click="exportToPDF" :disabled="isExporting" class="export-btn">
        <logo-icon v-if="!isExporting" name="file-pdf" />
        <div v-else class="loading-spinner"></div>
        {{ isExporting ? '导出中...' : '导出PDF' }}
      </button>
    </div>

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
  </ViewLayout>
</template>

<style scoped>
.export-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover:not(:disabled) {
  background-color: #005a9e;
  transform: translateY(-1px);
}

.export-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
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
  width: 1000px;
  /* 进一步缩小宽度 */
  height: fit-content;
  min-height: auto;
  /* 移除最小高度限制 */
  display: flex;
  flex-direction: column;

  /* 简洁边框设计 */
  border: none;
  border-radius: 0;

  padding: 20px 25px;
  margin: 16px auto;

  /* 纯白背景，适合打印 */
  background-color: #ffffff;
  box-sizing: border-box;

  /* 添加轻微阴影，但仅在屏幕显示时 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
