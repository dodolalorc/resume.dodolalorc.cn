<script setup lang="ts">
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

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <label class="form-label">
    <span>{{ label }}</span>
    <textarea
      v-if="textarea"
      :value="modelValue"
      class="form-textarea"
      :rows="rows"
      :placeholder="placeholder"
      @input="handleInput"
    ></textarea>
    <input
      v-else
      :value="modelValue"
      :type="type"
      class="form-input"
      :placeholder="placeholder"
      @input="handleInput"
    />
  </label>
</template>

<style scoped>
.form-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.form-input,
.form-textarea {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #1e293b;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 34, 197, 94), 0.3);
}

.form-textarea {
  min-height: 96px;
  resize: vertical;
}
</style>
