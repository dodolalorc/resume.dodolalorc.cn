<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ViewLayout from '@/layout/view-layout.vue'
import type {
  ResumeConfig,
  Profile,
  EducationConfig,
  ExperienceConfig,
  Project,
  Award,
} from '@/types/resumeConfig'
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
.resume-shell {
  width: 1200px;
  height: fit-content;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: #f9f9f9;
}
</style>
