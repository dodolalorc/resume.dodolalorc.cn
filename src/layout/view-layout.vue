<script lang="ts" setup>
import HeaderBar from '@/components/common/HeaderBar.vue'
</script>

<template>
  <div class="view-shell">
    <HeaderBar />
    <slot />
  </div>
</template>

<style scoped>
.view-shell {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

header {
  flex: 0 0 auto;
}

main {
  flex: 1 1 auto;
  overflow-y: auto;
}
</style>
