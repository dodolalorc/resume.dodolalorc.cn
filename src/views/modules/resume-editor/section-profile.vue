<script setup lang="ts">
import type { Profile, ResumeConfig, ResumeLocale } from '@/types/resume'
import FormInput from '../../components/form-input.vue'
import { resolveLocalizedText, setLocalizedText } from '@/utils/localized'

const props = defineProps<{
  locale: ResumeLocale
}>()

const resume = defineModel<ResumeConfig>('resume', { required: true })

const profileAvatar = () => (resume.value.profile.avatar ??= { url: '', rounded: true, size: 140 })
const profileGithub = () => (resume.value.profile.github ??= { url: '', label: '' })
const profileBlog = () => (resume.value.profile.blog ??= { url: '', label: '' })
const jobIntention = () =>
  (resume.value.profile.jobIntention ??= { city: '', position: '', salary: '' })
const profileText = (key: keyof Profile) =>
  resolveLocalizedText(resume.value.profile[key] as never, props.locale)
const updateProfileText = (key: keyof Profile, value: string) => {
  setLocalizedText(resume.value.profile as unknown as Record<string, unknown>, key, props.locale, value)
}
const updateTargetText = (target: Record<string, unknown>, key: string, value: string) => {
  setLocalizedText(target, key, props.locale, value)
}
</script>

<template>
  <div class="section-content">
    <div class="section-title">基本信息</div>
    <div class="form-grid">
      <FormInput
        :model-value="profileText('name')"
        label="姓名"
        placeholder="Your name"
        @update:model-value="updateProfileText('name', $event)"
      />
      <FormInput v-model="resume.profile.email" label="邮箱" type="email" />
      <FormInput v-model="resume.profile.phone" label="电话" />
      <FormInput
        :model-value="profileText('workExpYear')"
        label="工作年限"
        placeholder="如：2年"
        @update:model-value="updateProfileText('workExpYear', $event)"
      />
    </div>

    <div class="section-title">科研申请信息</div>
    <div class="form-grid">
      <FormInput
        :model-value="profileText('school')"
        label="学校"
        @update:model-value="updateProfileText('school', $event)"
      />
      <FormInput
        :model-value="profileText('major')"
        label="专业"
        @update:model-value="updateProfileText('major', $event)"
      />
      <FormInput
        :model-value="profileText('ranking')"
        label="排名"
        placeholder="如：专业排名 3/126"
        @update:model-value="updateProfileText('ranking', $event)"
      />
      <FormInput
        :model-value="profileText('gpa')"
        label="GPA"
        placeholder="如：3.91/4.00"
        @update:model-value="updateProfileText('gpa', $event)"
      />
      <FormInput
        :model-value="profileText('gender')"
        label="性别"
        @update:model-value="updateProfileText('gender', $event)"
      />
      <FormInput
        :model-value="profileText('birthplace')"
        label="籍贯"
        @update:model-value="updateProfileText('birthplace', $event)"
      />
    </div>

    <div class="section-title">头像设置</div>
    <div class="form-grid">
      <FormInput
        v-model="profileAvatar().url"
        label="头像 URL"
        type="url"
        placeholder="avatar.png 或 https://"
      />
      <div class="form-control">
        <label>头像大小</label>
        <input
          v-model.number="profileAvatar().size"
          type="number"
          min="60"
          max="300"
          class="form-number-input"
        />
      </div>
    </div>

    <div class="section-title">联系方式与显示</div>
    <div class="form-grid">
      <FormInput v-model="resume.profile.wechat" label="微信" />
      <FormInput
        v-model="resume.profile.zhihu"
        label="知乎"
        placeholder="https://zhihu.com/people/..."
      />
      <FormInput
        v-model="resume.profile.xiaohongshu"
        label="小红书"
        placeholder="https://xiaohongshu.com/..."
      />
    </div>
    <div class="form-control">
      <label>联系方式显示方式</label>
      <div class="radio-group">
        <label class="radio-option">
          <input v-model="resume.profile.prepend" type="radio" value="both" />
          <span>图标+文字</span>
        </label>
        <label class="radio-option">
          <input v-model="resume.profile.prepend" type="radio" value="icon" />
          <span>仅图标</span>
        </label>
        <label class="radio-option">
          <input v-model="resume.profile.prepend" type="radio" value="text" />
          <span>仅文字</span>
        </label>
      </div>
    </div>

    <div class="section-title">社交与其他</div>
    <div class="form-grid">
      <FormInput v-model="profileGithub().url" label="GitHub URL" type="url" />
      <FormInput
        :model-value="resolveLocalizedText(profileGithub().label, props.locale)"
        label="GitHub 显示文字"
        @update:model-value="updateTargetText(profileGithub() as unknown as Record<string, unknown>, 'label', $event)"
      />
      <FormInput v-model="profileBlog().url" label="博客 URL" type="url" />
      <FormInput
        :model-value="resolveLocalizedText(profileBlog().label, props.locale)"
        label="博客显示文字"
        @update:model-value="updateTargetText(profileBlog() as unknown as Record<string, unknown>, 'label', $event)"
      />
    </div>

    <div class="section-title">求职意向</div>
    <div class="form-grid-3">
      <FormInput
        :model-value="resolveLocalizedText(jobIntention().city, props.locale)"
        label="意向城市"
        @update:model-value="updateTargetText(jobIntention() as unknown as Record<string, unknown>, 'city', $event)"
      />
      <FormInput
        :model-value="resolveLocalizedText(jobIntention().position, props.locale)"
        label="意向职位"
        @update:model-value="updateTargetText(jobIntention() as unknown as Record<string, unknown>, 'position', $event)"
      />
      <FormInput
        :model-value="resolveLocalizedText(jobIntention().salary, props.locale)"
        label="期望薪资"
        placeholder="如：15k-20k"
        @update:model-value="updateTargetText(jobIntention() as unknown as Record<string, unknown>, 'salary', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.section-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 8px 0 0 0;
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

.form-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-control > label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.form-number-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-number-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-checkbox,
.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox input[type='checkbox'],
.radio-option input[type='radio'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-checkbox label,
.radio-option {
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
