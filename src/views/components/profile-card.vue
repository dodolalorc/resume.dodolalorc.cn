<script setup lang="ts">
import { computed } from 'vue'
import type { Profile } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'
import localAvatarUrl from '@/data/avatar.png'

defineProps<{
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const profile = defineModel<Profile>('profile', {
  type: Object,
  required: true,
  default: () =>
    ({
      name: 'John Doe',
      avatar: {
        url: 'https://placehold.co/240x240/png',
        rounded: true,
        size: 140,
      },
      prepend: 'both',
      email: 'john.doe@example.com',
      phone: '+1234567890',
    }) as Profile,
})

const showText = computed(
  () => profile.value.prepend === 'text' || profile.value.prepend === 'both',
)
const showIcon = computed(
  () => profile.value.prepend === 'icon' || profile.value.prepend === 'both',
)

const contactItems = computed(() => {
  const items = [
    {
      key: 'email',
      icon: 'email',
      value: profile.value.email,
      href: profile.value.email ? `mailto:${profile.value.email}` : '',
    },
    {
      key: 'phone',
      icon: 'phone',
      value: profile.value.phone,
      href: profile.value.phone ? `tel:${profile.value.phone}` : '',
    },
    {
      key: 'github',
      icon: 'github',
      value: profile.value.github?.label,
      href: profile.value.github?.url,
    },
    {
      key: 'blog',
      icon: 'blog',
      value: profile.value.blog?.label,
      href: profile.value.blog?.url,
    },
    { key: 'zhihu', icon: 'zhihu', value: profile.value.zhihu, href: profile.value.zhihu },
    {
      key: 'xiaohongshu',
      icon: 'book',
      value: profile.value.xiaohongshu,
      href: profile.value.xiaohongshu,
    },
    { key: 'wechat', icon: 'wechat', value: profile.value.wechat, href: '' },
    { key: 'workExpYear', icon: 'laptop', value: profile.value.workExpYear, href: '' },
  ]
  return items.filter((item) => item.value)
})

const intentions = computed(() => {
  if (!profile.value.jobIntention) return []
  return [
    {
      label: 'profile.jobIntention.city',
      icon: 'location-dot',
      value: profile.value.jobIntention.city,
    },
    {
      label: 'profile.jobIntention.position',
      icon: 'briefcase',
      value: profile.value.jobIntention.position,
    },
    {
      label: 'profile.jobIntention.salary',
      icon: 'dollar-sign',
      value: profile.value.jobIntention.salary,
    },
  ].filter((item) => item.value)
})

const avatarCssWidth = computed(
  () => `calc(${profile.value.avatar?.size || 140}px * var(--resume-avatar-scale, 1))`,
)

const avatarCssHeight = computed(() => {
  const size = profile.value.avatar?.size || 140
  const scale = 'var(--resume-avatar-scale, 1)'
  if (profile.value.avatar?.rounded) {
    // 圆形：正方形
    return `calc(${size}px * ${scale})`
  }
  // 矩形：1寸照片比例 25mm:35mm = 5:7
  return `calc(${size}px * 7 / 5 * ${scale})`
})

const avatarBorderRadius = computed(() => (profile.value.avatar?.rounded ? '50%' : '16px'))

const avatarUrl = computed(() => {
  const rawUrl = profile.value.avatar?.url?.trim()
  if (!rawUrl) return localAvatarUrl

  const normalized = rawUrl.replace(/\\/g, '/')
  const localAvatarTokens = new Set([
    'avatar.png',
    './avatar.png',
    'data/avatar.png',
    './data/avatar.png',
    'src/data/avatar.png',
    '/src/data/avatar.png',
    '@/data/avatar.png',
  ])

  if (localAvatarTokens.has(normalized)) return localAvatarUrl
  return rawUrl
})
</script>

<template>
  <section class="profile-card">
    <div class="profile-container">
      <div class="profile-content">
        <div>
          <div class="profile-title-row">
            <p class="resume-label">Resume</p>
            <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
              <IconLogo name="edit" />
            </button>
          </div>
          <h1 class="profile-name">
            {{ profile.name || '未填写姓名' }}
          </h1>
        </div>

        <div class="contact-grid">
          <div v-for="item in contactItems" :key="item.key" class="contact-item">
            <span v-if="showIcon" class="contact-icon">
              <IconLogo :name="item.icon" class="icon-size" />
            </span>
            <span v-if="showText" class="contact-label">{{ $t(`profile.${item.key}`) }}</span>
            <span class="separator">·</span>
            <a v-if="item.href" :href="item.href" class="contact-link">
              {{ item.value }}
            </a>
            <span v-else>{{ item.value }}</span>
          </div>
        </div>

        <div v-if="intentions.length" class="intentions-container">
          <div v-for="item in intentions" :key="item.label" class="intention-badge">
            <IconLogo :name="item.icon" class="icon-size" />
            <span>{{ $t(item.label) }} · {{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="avatar-container">
        <div class="avatar-ring">
          <div
            class="avatar-wrapper"
            :style="{
              borderRadius: avatarBorderRadius,
              width: avatarCssWidth,
              height: avatarCssHeight,
            }"
          >
            <img
              :src="avatarUrl"
              :alt="profile.name"
              class="avatar-image"
              :style="{ borderRadius: avatarBorderRadius }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-card {
  padding: calc(24px * var(--resume-font-scale, 1)) 0;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: calc(24px * var(--resume-font-scale, 1));
}

@media (min-width: 768px) {
  .profile-container {
    flex-direction: row;
    align-items: center;
  }
}

.profile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--resume-font-scale, 1));
}

.resume-label {
  font-size: calc(12px * var(--resume-font-scale, 1));
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-primary);
}

.profile-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-edit-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #666;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.profile-name {
  font-size: var(--resume-text-hero, 30px);
  font-weight: 600;
  color: var(--color-text);
}

@media (min-width: 768px) {
  .profile-name {
    font-size: var(--resume-text-hero-desktop, 36px);
  }
}

.contact-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, 1fr);
}

.contact-item {
  display: flex;
  align-items: center;
  line-height: 1.5;
  gap: 0.35rem;
  font-size: var(--resume-text-md, 14px);
  color: #475569;
}

.contact-item .separator {
  margin-inline: 0;
}

.contact-icon {
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.icon-size {
  height: calc(16px * var(--resume-font-scale, 1));
  width: calc(16px * var(--resume-font-scale, 1));
}

.contact-label {
  font-weight: 500;
  color: #334155;
}

.separator {
  color: #cbd5e1;
}

.contact-link {
  display: inline;
  white-space: normal;
  word-break: break-word;
  text-decoration: none;
  color: inherit;
}

.contact-link:hover {
  color: var(--color-primary);
}

.intentions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.intention-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  background-color: rgba(var(--color-secondary-rgb, 59, 130, 246), 0.1);
  padding: 0.2rem 0.6rem;
  font-size: calc(12px * var(--resume-font-scale, 1));
  font-weight: 600;
  color: var(--color-secondary);
}

.avatar-container {
  position: relative;
}

.avatar-ring {
  position: relative;
  border-radius: 50%;
}

.avatar-wrapper {
  overflow: hidden;
  background: #fff;
}

.avatar-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>

<style>
.resume-shell[data-export-size='small'] .contact-grid,
.resume-shell[data-export-size='xsmall'] .contact-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.resume-shell[data-export-size='standard'] .contact-grid,
.resume-shell[data-export-size='large'] .contact-grid {
  grid-template-columns: repeat(2, 1fr);
}
</style>
