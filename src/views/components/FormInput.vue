<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  modelValue: string | undefined
  type?: 'text' | 'email' | 'url'
  placeholder?: string
  rows?: number
  textarea?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  rows: 3,
  textarea: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClass = computed(
  () =>
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30',
)

const textareaClass = computed(() => `${inputClass.value} min-h-[96px] resize-vertical`)

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
    <span>{{ label }}</span>
    <textarea
      v-if="textarea"
      :value="modelValue"
      :class="textareaClass"
      :rows="rows"
      :placeholder="placeholder"
      @input="handleInput"
    ></textarea>
    <input
      v-else
      :value="modelValue"
      :type="type"
      :class="inputClass"
      :placeholder="placeholder"
      @input="handleInput"
    />
  </label>
</template>
