<script setup lang="ts">
import { onMounted,ref } from 'vue';
import * as toml from 'toml'

interface ServerConfig {
  host: string
  port: number
}

interface FeaturesConfig {
  dark_mode: boolean
  analytics: boolean
}

interface AppConfig {
  title: string
  author: string
  description: string
  server: ServerConfig
  features: FeaturesConfig
}

const config = ref<Partial<AppConfig>>({})
onMounted(async () => {
  try {
    const response = await fetch('/resume.toml')
    const text = await response.text()
    config.value = toml.parse(text) as AppConfig
  } catch (error) {
    console.error('Error loading config:', error)
  }
})
</script>

<template>
  <div>
  <h1>{{ config }}</h1>
  </div>
</template>
