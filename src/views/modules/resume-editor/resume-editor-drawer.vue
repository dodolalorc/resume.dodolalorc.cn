<script setup lang="ts">
import { onMounted, watch } from 'vue'
import type { ResumeConfig, EditorSection } from '@/types/resume'
import SectionProfile from './section-profile.vue'
import SectionEducation from './section-education.vue'
import SectionExperience from './section-experience.vue'
import SectionProjects from './section-projects.vue'
import SectionAwards from './section-awards.vue'

const open = defineModel<boolean>('open', { required: true })
const section = defineModel<EditorSection>('section', { required: true })
const resume = defineModel<ResumeConfig>('resume', { required: true })

const normalize = () => {
  resume.value.profile ??= {}
  resume.value.profile.avatar ??= { url: '', rounded: true, size: 140 }
  resume.value.profile.github ??= { url: '', label: '' }
  resume.value.profile.blog ??= { url: '', label: '' }
  resume.value.profile.jobIntention ??= { city: '', position: '', salary: '' }
  resume.value.profile.prepend ??= 'both'

  resume.value.education ??= []
  resume.value.experience ??= []
  resume.value.projects ??= []
  resume.value.awards ??= []
}

onMounted(normalize)
watch(
  () => open.value,
  (v) => {
    if (v) normalize()
  },
)
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="drawer-overlay">
      <div class="drawer-container">
        <div class="drawer-header">
          <div class="header-left">
            <div class="nav-buttons">
              <button
                v-for="item in ['profile', 'education', 'experience', 'projects', 'awards']"
                :key="item"
                :class="['nav-button', section === (item as EditorSection) ? 'active' : '']"
                @click="section = item as EditorSection"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <button class="paper-btn ghost" @click="open = false">关闭</button>
        </div>

        <div class="drawer-content">
          <SectionProfile v-if="section === 'profile'" v-model:resume="resume" />
          <SectionEducation v-else-if="section === 'education'" v-model:resume="resume" />
          <SectionExperience v-else-if="section === 'experience'" v-model:resume="resume" />
          <SectionProjects v-else-if="section === 'projects'" v-model:resume="resume" />
          <SectionAwards v-else-if="section === 'awards'" v-model:resume="resume" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.22);
}

.drawer-container {
  display: flex;
  height: 100%;
  width: min(760px, 100%);
  flex-direction: column;
  background-color: #fffdf7;
  border-left: 1px solid #d6d0c4;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #d6d0c4;
  padding: 12px 16px;
  background: #faf6ee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-mode-badge {
  border: 1px solid #d6d0c4;
  background: #fff;
  padding: 2px 8px;
  font-size: 12px;
  color: #5b5448;
}

.nav-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.nav-button {
  border: 1px solid #d6d0c4;
  background: #fff;
  color: #5b5448;
  padding: 4px 10px;
  cursor: pointer;
  text-transform: capitalize;
}

.nav-button.active {
  background: #2f2a24;
  color: #fff;
  border-color: #2f2a24;
}

.paper-btn {
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  color: #2f2a24;
  padding: 4px 10px;
  cursor: pointer;
}

.paper-btn.ghost {
  background: #fff;
}

.drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 12px 16px;
}
</style>
