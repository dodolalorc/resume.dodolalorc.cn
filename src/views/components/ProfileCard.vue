<script setup lang="ts">
import { computed } from 'vue'
import type { Profile } from '@/types/resumeConfig'
import IconLogo from '@/components/IconLogo.vue'

const profile = defineModel<Profile>('profile', {
  type: Object,
  required: true,
  default: () => ({
    name: 'John Doe',
    avatar: {
      url: 'https://placehold.co/240x240/png',
      rounded: true,
      size: 140,
    },
    prepend: 'both',
    email: 'john.doe@example.com',
    phone: '+1234567890',
  } as Profile),
})

const showText = computed(() => profile.value.prepend === 'text' || profile.value.prepend === 'both')
const showIcon = computed(() => profile.value.prepend === 'icon' || profile.value.prepend === 'both')

const contactItems = computed(() => {
  const items = [
    { key: 'email', icon: 'email', value: profile.value.email, href: profile.value.email ? `mailto:${profile.value.email}` : '' },
    { key: 'phone', icon: 'phone', value: profile.value.phone, href: profile.value.phone ? `tel:${profile.value.phone}` : '' },
    { key: 'github', icon: 'github', value: profile.value.github, href: profile.value.github },
    { key: 'blog', icon: 'blog', value: profile.value.blog, href: profile.value.blog },
    { key: 'zhihu', icon: 'zhihu', value: profile.value.zhihu, href: profile.value.zhihu },
    { key: 'xiaohongshu', icon: 'book', value: profile.value.xiaohongshu, href: profile.value.xiaohongshu },
    { key: 'wechat', icon: 'wechat', value: profile.value.wechat, href: '' },
    { key: 'workExpYear', icon: 'laptop', value: profile.value.workExpYear, href: '' },
  ]
  return items.filter((item) => item.value)
})

const intentions = computed(() => {
  if (!profile.value.jobIntention) return []
  return [
    { label: 'profile.jobIntention.city', icon: 'location-dot', value: profile.value.jobIntention.city },
    { label: 'profile.jobIntention.position', icon: 'briefcase', value: profile.value.jobIntention.position },
    { label: 'profile.jobIntention.salary', icon: 'dollar-sign', value: profile.value.jobIntention.salary },
  ].filter((item) => item.value)
})

const avatarSize = computed(() => profile.value.avatar?.size || 140)
</script>

<template>
  <section class="rounded-2xl border border-[var(--color-muted)] bg-white/80 p-6 shadow-sm shadow-slate-200/70">
    <div class="flex flex-col gap-6 md:flex-row md:items-center">
      <div class="flex-1 space-y-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Resume</p>
          <h1 class="text-3xl font-semibold text-[var(--color-text)] md:text-4xl">
            {{ profile.name || '未填写姓名' }}
          </h1>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <div v-for="item in contactItems" :key="item.key" class="flex items-center gap-2 text-sm text-slate-600">
            <span v-if="showIcon" class="text-[var(--color-primary)]">
              <IconLogo :name="item.icon" class="h-4 w-4" />
            </span>
            <span v-if="showText" class="font-medium text-slate-700">{{ $t(`profile.${item.key}`) }}</span>
            <span class="text-slate-400">·</span>
            <a v-if="item.href" :href="item.href" class="truncate hover:text-[var(--color-primary)]">
              {{ item.value }}
            </a>
            <span v-else>{{ item.value }}</span>
          </div>
        </div>

        <div v-if="intentions.length" class="flex flex-wrap gap-2">
          <div v-for="item in intentions" :key="item.label"
            class="flex items-center gap-2 rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-secondary)]">
            <IconLogo :name="item.icon" class="h-4 w-4" />
            <span>{{ $t(item.label) }} · {{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="relative">
        <div class="avatar-ring">
          <div class="avatar-wrapper">
            <img :src="profile.avatar?.url" :alt="profile.name" class="h-full w-full object-cover"
              :style="{ borderRadius: profile.avatar?.rounded ? '50%' : '16px' }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.avatar-ring {
  position: relative;
  padding: 6px;
  border-radius: 50%;
  background: conic-gradient(from 120deg, var(--color-primary), var(--color-secondary), var(--color-accent));
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
}

.avatar-wrapper {
  width: v-bind(avatarSize + 'px');
  height: v-bind(avatarSize + 'px');
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}
</style>
