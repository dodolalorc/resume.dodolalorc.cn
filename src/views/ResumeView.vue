<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { ResumeConfig } from "@/types/resumeConfig";
import profileCard from "@/components/profile-card.vue";

const config = ref<Partial<ResumeConfig>>({});
const profile = ref({});
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
  <div>
    <h1>{{ config }}</h1>
    <profile-card :profile="profile" />
  </div>
</template>
