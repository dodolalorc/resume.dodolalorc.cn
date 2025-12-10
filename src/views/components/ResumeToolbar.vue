<script setup lang="ts">
import LogoIcon from '@/components/IconLogo.vue'
import type { ThemeDefinition, ThemeKey } from '@/stores/resume'

const props = defineProps<{
  themes: ThemeDefinition[]
  themeKey: ThemeKey
  lastSavedText: string
  isEditing: boolean
  isExporting: boolean
}>()

const autosaveEnabled = defineModel<boolean>('autosaveEnabled', {
  required: true,
})

const emit = defineEmits<{
  (e: 'toggle-edit'): void
  (e: 'export-pdf'): void
  (e: 'export-json'): void
  (e: 'reset'): void
  (e: 'set-theme', key: ThemeKey): void
}>()
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center gap-3">
    <div
      class="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 shadow-sm ring-1 ring-slate-200 backdrop-blur">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ $t('actions.theme') }}</span>
      <div class="flex flex-wrap gap-2">
        <button v-for="theme in props.themes" :key="theme.key"
          class="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition" :class="[
            props.themeKey === theme.key
              ? 'border-transparent bg-[var(--color-primary)] text-white shadow'
              : 'border-slate-200 bg-white text-slate-700 hover:border-[var(--color-muted)]',
          ]" @click="emit('set-theme', theme.key)">
          <span class="inline-block h-3 w-3 rounded-full" :style="{ background: theme.colors.primary }"></span>
          {{ theme.name }}
        </button>
      </div>
    </div>

    <div
      class="flex flex-wrap items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
      <label class="flex cursor-pointer items-center gap-2">
        <input v-model="autosaveEnabled" type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
        <span>{{ $t('actions.autosave') }}</span>
      </label>
      <span class="text-slate-400">| {{ $t('actions.lastSaved') }} {{ props.lastSavedText }}</span>
    </div>

    <div class="flex flex-wrap gap-2">
      <button class="primary-btn" @click="emit('toggle-edit')">
        <LogoIcon name="edit" class="h-4 w-4" />
        {{ props.isEditing ? $t('actions.closeEdit') : $t('actions.editMode') }}
      </button>
      <button class="primary-btn" :disabled="props.isExporting" @click="emit('export-pdf')">
        <LogoIcon v-if="!props.isExporting" name="file-pdf" class="h-4 w-4" />
        <span v-else class="loader" />
        {{ props.isExporting ? $t('actions.exporting') : $t('actions.exportPdf') }}
      </button>
      <button class="primary-btn" @click="emit('export-json')">
        <LogoIcon name="file-export" class="h-4 w-4" />
        {{ $t('actions.exportJson') }}
      </button>
      <button class="ghost-btn" @click="emit('reset')">
        <LogoIcon name="rotate-left" class="h-4 w-4" />
        {{ $t('actions.reset') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background-color: var(--color-primary);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-0.125rem);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.primary-btn:disabled {
  opacity: 0.6;
  box-shadow: none;
  transform: translateY(0);
  cursor: not-allowed;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240);
  background-color: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: rgb(51 65 85);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.ghost-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.loader {
  height: 1rem;
  width: 1rem;
  animation: spin 1s linear infinite;
  border-radius: 9999px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.4);
  border-top-color: currentColor;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
