<script setup lang="ts">
import type { ResumeConfig } from '@/types/resume'
import FormInput from '../../components/form-input.vue'

const resume = defineModel<ResumeConfig>('resume', { required: true })

const profileAvatar = () => (resume.value.profile.avatar ??= { url: '', rounded: true, size: 140 })
const profileGithub = () => (resume.value.profile.github ??= { url: '', label: '' })
const profileBlog = () => (resume.value.profile.blog ??= { url: '', label: '' })
const jobIntention = () =>
  (resume.value.profile.jobIntention ??= { city: '', position: '', salary: '' })
</script>

<template>
  <div class="section-content">
    <div class="form-grid">
      <FormInput v-model="resume.profile.name" label="姓名" placeholder="Your name" />
      <FormInput v-model="profileAvatar().url" label="头像 URL" type="url" placeholder="https://" />
      <FormInput v-model="resume.profile.email" label="邮箱" type="email" />
      <FormInput v-model="resume.profile.phone" label="电话" />
      <FormInput v-model="profileGithub().url" label="GitHub URL" type="url" />
      <FormInput v-model="profileGithub().label" label="GitHub 显示文字" />
      <FormInput v-model="profileBlog().url" label="博客 URL" type="url" />
      <FormInput v-model="profileBlog().label" label="博客显示文字" />
      <FormInput v-model="resume.profile.wechat" label="微信" />
      <FormInput v-model="resume.profile.workExpYear" label="工作年限" />
    </div>
    <div class="form-grid-3">
      <FormInput v-model="jobIntention().city" label="意向城市" />
      <FormInput v-model="jobIntention().position" label="意向职位" />
      <FormInput v-model="jobIntention().salary" label="期望薪资" />
    </div>
  </div>
</template>

<style scoped>
.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.form-grid-3 {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .form-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
