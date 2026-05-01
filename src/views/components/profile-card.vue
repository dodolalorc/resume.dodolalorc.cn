<script setup lang="ts">
import { computed } from 'vue'
import type { Profile, ResumeLocale } from '@/types/resume'
import IconLogo from '@/components/icon-logo.vue'
import localAvatarUrl from '@/data/avatar.png'
import { resolveLocalizedText } from '@/utils/localized'

const props = withDefaults(
  defineProps<{
    editable?: boolean
    locale?: ResumeLocale
    themeKey?: string
  }>(),
  {
    locale: 'zh',
    themeKey: '',
  },
)

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
      value: resolveLocalizedText(profile.value.github?.label, props.locale),
      href: profile.value.github?.url,
    },
    {
      key: 'blog',
      icon: 'blog',
      value: resolveLocalizedText(profile.value.blog?.label, props.locale),
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
      value: resolveLocalizedText(profile.value.jobIntention.city, props.locale),
    },
    {
      label: 'profile.jobIntention.position',
      icon: 'briefcase',
      value: resolveLocalizedText(profile.value.jobIntention.position, props.locale),
    },
    {
      label: 'profile.jobIntention.salary',
      icon: 'dollar-sign',
      value: resolveLocalizedText(profile.value.jobIntention.salary, props.locale),
    },
  ].filter((item) => item.value)
})

const isResearchTheme = computed(() => props.themeKey === 'research-scholar')
const researchInfoItems = computed(() => {
  const gpa = resolveLocalizedText(profile.value.gpa, props.locale)
  const builtIn = [
    resolveLocalizedText(profile.value.ranking, props.locale),
    gpa ? `GPA: ${gpa}` : '',
    resolveLocalizedText(profile.value.birthplace, props.locale),
    profile.value.email,
    profile.value.phone,
  ].filter(Boolean)

  const custom = (profile.value.researchInfo ?? [])
    .map((item) => {
      const label = resolveLocalizedText(item.label, props.locale)
      const value = resolveLocalizedText(item.value, props.locale)
      if (!value) return ''
      if (/^(英语|语言|language|english)$/i.test(label)) return ''
      return label ? `${label}: ${value}` : value
    })
    .filter(Boolean)

  return [...builtIn, ...custom]
})

const researchSubtitle = computed(() =>
  [
    resolveLocalizedText(profile.value.school, props.locale),
    resolveLocalizedText(profile.value.major, props.locale),
  ]
    .filter(Boolean)
    .join(' | '),
)

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

const avatarBorderRadius = computed(() => '0')

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
  <section class="profile-card" :class="{ 'is-research': isResearchTheme }">
    <template v-if="isResearchTheme">
      <div class="research-profile-text">
        <div class="research-name-row">
          <h1 class="profile-name research-name">
            {{ resolveLocalizedText(profile.name, props.locale) || '未填写姓名' }}
          </h1>
          <button v-if="editable" class="section-edit-btn" @click="emit('edit')">
            <IconLogo name="edit" />
          </button>
        </div>
        <div v-if="researchSubtitle" class="research-subtitle">
          <strong>{{ researchSubtitle }}</strong>
        </div>
        <div v-if="researchInfoItems.length" class="research-meta">
          <span v-for="item in researchInfoItems" :key="item">{{ item }}</span>
        </div>
      </div>
      <div v-if="avatarUrl" class="research-avatar">
        <img :src="avatarUrl" :alt="resolveLocalizedText(profile.name, props.locale)" />
      </div>
    </template>
    <template v-else>
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
              {{ resolveLocalizedText(profile.name, props.locale) || '未填写姓名' }}
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
                :alt="resolveLocalizedText(profile.name, props.locale)"
                class="avatar-image"
                :style="{ borderRadius: avatarBorderRadius }"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.profile-card {
  position: relative;
  padding: calc(24px * var(--resume-font-scale, 1)) 0;
}

.profile-card.is-research {
  min-height: calc(96px * var(--resume-font-scale, 1));
  padding: 0 110px 12px;
  border-bottom: 2px solid #111;
  text-align: center;
}

.research-profile-text {
  min-width: 0;
}

.research-name {
  margin: 0 0 6px;
  font-size: calc(28px * var(--resume-title-scale, 1));
  font-weight: 700;
  color: #111;
}

.research-subtitle,
.research-meta {
  color: #222;
  font-size: var(--resume-text-base, 14px);
  line-height: 1.55;
}

.research-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 8px;
}

.research-meta span:not(:last-child)::after {
  content: '|';
  margin-left: 8px;
  color: #555;
}

.research-avatar {
  position: absolute;
  top: 0;
  right: 0;
  width: calc(78px * var(--resume-avatar-scale, 1));
  height: calc(104px * var(--resume-avatar-scale, 1));
  border: 1px solid #111;
  background: #fff;
}

.research-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0 !important;
}

.research-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
}

.research-name-row .section-edit-btn {
  position: absolute;
  right: 0;
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
