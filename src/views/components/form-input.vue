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
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #7a7060;
}

.form-input,
.form-textarea {
  width: 100%;
  border-radius: 0;
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  padding: 6px 8px;
  font-size: 13px;
  color: #2f2a24;
  font-family: inherit;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #9c8f7a;
  outline: none;
  box-shadow: 0 0 0 2px rgba(156, 143, 122, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #b0a898;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}
</style>
