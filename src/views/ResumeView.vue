<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { AppConfig } from "@/types/appConfig";

const config = ref<Partial<AppConfig>>({});
onMounted(async () => {
	try {
		const response = await fetch("/cv.json");
		const data = await response.json();
		config.value = data as AppConfig;
	} catch (error) {
		console.error("Error loading config:", error);
	}
});
</script>

<template>
  <div>
  <h1>{{ config }}</h1>
  </div>
</template>
