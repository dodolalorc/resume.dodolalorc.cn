<script setup lang="ts">
import { onMounted, ref } from "vue";
import ViewLayout from "@/layout/view-layout.vue";
import type { ResumeConfig, Profile } from "@/types/resumeConfig";
import profileCard from "./components/ProfileCard.vue";

const config = ref<Partial<ResumeConfig>>({});
const profile = ref<Profile>({});

onMounted(async () => {
  try {
    const response = await fetch("/cv.json");
    const data = await response.json();
    config.value = data as ResumeConfig;
    profile.value = config.value.profile || {};
  } catch (error) {
    console.error("Error loading config:", error);
  }
});
</script>

<template>
  <ViewLayout>
    <div class="resume-shell">
      <!-- 个人基本信息 -->
      <profile-card v-model:profile="profile" />
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
}
</style>
