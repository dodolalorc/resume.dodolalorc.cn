<script setup lang="ts">
import type { Project } from '@/types/resumeConfig'
const projects = defineModel<Project[]>('projects', {
  type: Array as () => Project[],
  required: true,
  default: () => [],
})
</script>
<template>
  <div class="project-shell">
    <div class="project-header">
      <h2 class="project-title">项目经历</h2>
      <hr class="project-divider" />
    </div>
    <div v-for="(item, index) in projects" :key="index" class="project-item">
      <span class="project-name">{{ item.name }}</span>
      <span class="project-time">{{ item.projectTime?.join(' - ') }}</span>
      <span class="project-role">{{ item.role }}</span>
      <span class="project-link">
        <span>链接：</span>
        <a :href="item.link" target="_blank">{{ item.link }}</a>
      </span>

      <div v-if="item.techStack && item.techStack.length" class="project-row">
        <span class="project-item-title">技术栈和框架：</span>
        <span class="project-content project-item-stack">{{ item.techStack.join(', ') }}</span>
      </div>
      <div v-if="item.projectDesc" class="project-row">
        <span class="project-content project-item-title">项目描述：</span>
        <span v-html="item.projectDesc" />
      </div>
      <div v-if="item.mainWork && item.mainWork.length" class="project-row">
        <span class="project-item-title">主要工作：</span>
        <div class="project-content">
          <div v-for="(work, index) in item.mainWork" :key="index" class="project-main-work-item">
            <span class="project-main-work-title" v-if="work.title">{{ work.title }}: </span>
            <span v-html="work.desc"></span>
          </div>
        </div>
      </div>
      <div v-if="item.projectAchievements && item.projectAchievements.length" class="project-row">
        <span class="project-item-title">项目成就：</span>
        <span class="project-content">{{ item.projectAchievements.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.project-shell {
  width: 100%;

  .project-header {
    display: flex;
    align-items: center;
    margin: 10px 0;

    .project-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }

    .project-divider {
      flex: 1;
      height: 1px;
      background-color: #eee;
      margin-left: 20px;
    }
  }

  .project-item {
    margin: 8px 0;

    .project-name {
      font-size: 18px;
      font-weight: bold;
    }

    .project-link {
      margin-left: 10px;
      font-size: 15px;
      color: #666;
    }

    .project-role {
      margin-left: 10px;
      color: #666;
    }

    .project-time {
      float: right;
      color: #999;
    }

    .project-row {
      display: flex;
      margin-top: 4px;
      font-size: 15px;
      width: 100%;

      .project-item-title {
        min-width: 90px;
        color: black;
        font-size: 15px;
        font-weight: bold;
      }

      .project-content {
        flex: 1;
      }

      .project-item-stack {
        color: #666;
      }

      .project-main-work-item {
        .project-main-work-title {
          font-weight: bold;
        }

      }
    }

  }
}
</style>
