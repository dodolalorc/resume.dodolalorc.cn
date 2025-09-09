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

const config = ref<Partial<ResumeConfig>>({})
const profile = ref<Profile>({})
const education = ref<EducationConfig[]>([])
const experience = ref<ExperienceConfig[]>([])
const projects = ref<Project[]>([]) // 项目经历
const awards = ref<Award[]>([]) // 奖项
const isExporting = ref(false) // 导出状态

// PDF导出功能 - 一页纸优化版本
const exportToPDF = async () => {
  try {
    isExporting.value = true

    // 获取简历容器元素
    const element = document.querySelector('.resume-shell') as HTMLElement
    if (!element) {
      throw new Error('找不到简历容器')
    }

    // 使用html2canvas截取DOM元素 - 针对一页纸优化
    const canvas = await html2canvas(element, {
      scale: 1.8, // 适中的清晰度，避免文件过大
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight, // 确保捕获完整高度
      windowHeight: element.scrollHeight,
    })

    // 创建PDF
    const imgData = canvas.toDataURL('image/png', 0.8) // 压缩图片质量
    const pdf = new jsPDF('p', 'mm', 'a4')

    // 计算PDF尺寸 - 优化以适合一页
    const pdfWidth = 210 // A4宽度(mm)
    const pdfHeight = 297 // A4高度(mm)
    const imgWidth = pdfWidth - 20 // 留出边距
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // 如果内容高度超出一页，等比缩放以适应
    if (imgHeight > pdfHeight - 20) {
      const scaleFactor = (pdfHeight - 20) / imgHeight
      const finalWidth = imgWidth * scaleFactor
      const finalHeight = imgHeight * scaleFactor

      // 居中放置
      const x = (pdfWidth - finalWidth) / 2
      const y = 10

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
    } else {
      // 如果内容适合一页，居中放置
      const x = (pdfWidth - imgWidth) / 2
      const y = (pdfHeight - imgHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
    }

    // 下载PDF
    const fileName = `${profile.value.name || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('PDF导出失败:', error)
    alert('PDF导出失败，请稍后重试')
  } finally {
    isExporting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/cv.json')
    const data = await response.json()
    config.value = data as ResumeConfig
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
  width: 1000px; /* 进一步缩小宽度 */
  height: fit-content;
  min-height: auto; /* 移除最小高度限制 */
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
