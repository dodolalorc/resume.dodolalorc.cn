<script setup lang="ts">
import type { Profile } from "@/types/resumeConfig";

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
    email: "john.doe@example.com",
    phone: "+1234567890",
  } as Profile)
});
</script>

<template>
  <div>
    <h2>Profile</h2>
    <p>Name: {{ profile.name }}</p>
    <p>Email: {{ profile.email }}</p>
    <font-awesome-icon icon="fa-solid fa-house" />
    <font-awesome-icon icon="fa-regular fa-circle-user" />
  </div>
</template>
