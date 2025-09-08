<script setup lang="ts">
import { computed } from "vue";
import type { Profile } from "@/types/resumeConfig";
import iconLogo from "@/components/IconLogo.vue";

const profile = defineModel<Profile>('profile', {
  type: Object,
  required: true,
  default: () => ({
    name: "John Doe",
    avatar: {
      url: "https://example.com/avatar.jpg",
      rounded: true,
      size: 150
    },
    prepend: "text",
    email: "john.doe@example.com",
    phone: "+1234567890",
  } as Profile)
});

// 使用计算属性确保响应式更新
const showText = computed(() => profile.value.prepend === 'text' || profile.value.prepend === 'both');
const showIcon = computed(() => profile.value.prepend === 'icon' || profile.value.prepend === 'both');
</script>

<template>
  <div class="profile-card">
    <div class="text-info">
      <div class="name-container">
        <p>{{ profile.name }}</p>
      </div>
      <div class="basic-info">
        <!-- Email -->
        <div v-if="profile.email" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="email" />
          </span>
          <span v-show="showText">
            {{ $t('profile.email') }}
          </span>
          <span>：</span>
          <span>
            <a :href="'mailto:' + profile.email">{{ profile.email }}</a>
          </span>
        </div>
        <!-- Phone -->
        <div v-if="profile.phone" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="phone" />
          </span>
          <span v-show="showText">
            {{ $t('profile.phone') }}
          </span>
          <span>：</span>
          <span>
            <a :href="'tel:' + profile.phone">{{ profile.phone }}</a>
          </span>
        </div>
        <!-- Github -->
        <div v-if="profile.github" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="github" />
          </span>
          <span v-show="showText">
            {{ $t('profile.github') }}
          </span>
          <span>：</span>
          <span>
            <a :href="profile.github" target="_blank" rel="noopener noreferrer">{{ profile.github }}</a>
          </span>
        </div>
        <!-- Blog -->
        <div v-if="profile.blog" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="blog" />
          </span>
          <span v-show="showText">
            {{ $t('profile.blog') }}
          </span>
          <span>：</span>
          <span>
            <a :href="profile.blog" target="_blank" rel="noopener noreferrer">{{ profile.blog }}</a>
          </span>
        </div>
        <!-- zhihu -->
        <div v-if="profile.zhihu" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="zhihu" />
          </span>
          <span v-show="showText">
            {{ $t('profile.zhihu') }}
          </span>
          <span>：</span>
          <span>
            <a :href="profile.zhihu" target="_blank" rel="noopener noreferrer">{{ profile.zhihu }}</a>
          </span>
        </div>
        <!-- xiaohongshu -->
        <div v-if="profile.xiaohongshu" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="book" />
          </span>
          <span v-show="showText">
            {{ $t('profile.xiaohongshu') }}
          </span>
          <span>：</span>
          <span>
            <a :href="profile.xiaohongshu" target="_blank" rel="noopener noreferrer">{{ profile.xiaohongshu }}</a>
          </span>
        </div>
        <!-- Wechat -->
        <div v-if="profile.wechat" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="wechat" />
          </span>
          <span v-show="showText">
            {{ $t('profile.wechat') }}
          </span>
          <span>：</span>
          <span>
            {{ profile.wechat }}
          </span>
        </div>
        <!-- Work Experience Year -->
        <div v-if="profile.workExpYear" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="laptop" />
          </span>
          <span v-show="showText">
            {{ $t('profile.workExpYear') }}
          </span>
          <span>：</span>
          <span>
            {{ profile.workExpYear }}
          </span>
        </div>
      </div>
      <!-- Job Intention -->
      <div v-if="profile.jobIntention" class="intent-info">
        <!-- Position -->
        <div v-if="profile.jobIntention.position" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="briefcase" />
          </span>
          <span v-show="showText">
            {{ $t('profile.jobIntention.position') }}
          </span>
          <span>：</span>
          <span>
            {{ profile.jobIntention.position }}
          </span>
        </div>
        <!-- City -->
        <div v-if="profile.jobIntention.city" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="location-dot" />
          </span>
          <span v-show="showText">
            {{ $t('profile.jobIntention.city') }}
          </span>
          <span>：</span>
          <span>
            {{ profile.jobIntention.city }}
          </span>
        </div>
        <!-- Salary -->
        <div v-if="profile.jobIntention.salary" class="info-item">
          <span v-show="showIcon">
            <icon-logo name="dollar-sign" />
          </span>
          <span v-show="showText">
            {{ $t('profile.jobIntention.salary') }}
          </span>
          <span>：</span>
          <span>
            {{ profile.jobIntention.salary }}
          </span>
        </div>
      </div>
    </div>
    <div class="avatar-container">
      <img :src="profile.avatar?.url" :alt="profile.name" :style="{
        width: profile.avatar?.size + 'px',
        height: profile.avatar?.size + 'px',
        borderRadius: profile.avatar?.rounded ? '50%' : '0'
      }" />
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: #f9f9f9;

  display: flex;
  justify-content: space-between;
  align-items: center;

  .text-info {
    flex: 1;

    .name-container {
      font-size: 30px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .basic-info {
      font-size: 14px;
      color: #666;
      display: flex;
      flex-wrap: wrap;

      .info-item {
        width: 50%;
        line-height: 18px;
        display: flex;
        align-items: center;
      }
    }

    .intent-info {
      font-size: 14px;
      color: #666;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      .info-item {
        flex: 1;
        line-height: 18px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
    }
  }
}
</style>
