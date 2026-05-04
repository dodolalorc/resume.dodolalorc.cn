<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface ColorPresetOption {
  key: string
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    presets: readonly ColorPresetOption[]
    customLabel?: string
  }>(),
  {
    customLabel: '自定义颜色',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const customPanelOpen = ref(false)
const customColor = ref('#ffffff')

const normalizeColor = (value: string) => value.trim().toLowerCase()

const isPresetColor = (value: string) =>
  props.presets.some((item) => normalizeColor(item.value) === normalizeColor(value))

const customColorPreview = computed(() => {
  if (isPresetColor(props.modelValue)) return customColor.value
  return props.modelValue
})

const currentLabel = computed(() => {
  const matched = props.presets.find(
    (item) => normalizeColor(item.value) === normalizeColor(props.modelValue),
  )
  return matched?.label || props.customLabel
})

const selectPresetColor = (value: string) => {
  customPanelOpen.value = false
  emit('update:modelValue', value)
}

const toggleCustomPanel = () => {
  customPanelOpen.value = !customPanelOpen.value
  if (customPanelOpen.value && !isPresetColor(props.modelValue)) {
    customColor.value = props.modelValue
  }
}

const applyCustomColor = (value: string) => {
  customColor.value = value
  emit('update:modelValue', value)
}

const normalizeHexColorInput = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  const withPrefix = normalized.startsWith('#') ? normalized : `#${normalized}`
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(withPrefix)) {
    return withPrefix
  }
  return null
}

const onHexInputChange = (value: string) => {
  customColor.value = value
  const parsed = normalizeHexColorInput(value)
  if (!parsed) return
  customColor.value = parsed
  emit('update:modelValue', parsed)
}

watch(
  () => props.modelValue,
  (value) => {
    if (!isPresetColor(value)) {
      customColor.value = value
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="color-picker-panel">
    <div class="color-picker-swatches" role="radiogroup" aria-label="背景色选择">
      <button
        v-for="option in presets"
        :key="option.key"
        class="color-swatch"
        :class="{ active: option.value === modelValue }"
        :aria-checked="option.value === modelValue"
        role="radio"
        @click="selectPresetColor(option.value)"
      >
        <span class="color-swatch-chip" :style="{ backgroundColor: option.value }"></span>
        <span class="color-swatch-label">{{ option.label }}</span>
      </button>

      <button
        class="color-swatch custom"
        :class="{ active: !isPresetColor(modelValue) }"
        :aria-checked="!isPresetColor(modelValue)"
        role="radio"
        @click="toggleCustomPanel"
      >
        <span class="color-swatch-chip" :style="{ backgroundColor: customColorPreview }"></span>
        <span class="color-swatch-label">{{ customLabel }}</span>
      </button>
    </div>

    <div v-if="customPanelOpen" class="custom-color-panel">
      <div class="custom-color-row">
        <input
          :value="customColor"
          class="native-color-input"
          type="color"
          @input="applyCustomColor(($event.target as HTMLInputElement).value)"
        />
        <input
          :value="customColor"
          class="hex-color-input"
          type="text"
          spellcheck="false"
          placeholder="#ffffff"
          @input="onHexInputChange(($event.target as HTMLInputElement).value)"
        />
      </div>
      <p class="custom-color-tip">选择后将直接应用到简历背景色。</p>
      <p class="custom-color-current">当前颜色：{{ currentLabel }}（{{ modelValue }}）</p>
    </div>
  </div>
</template>

<style scoped>
.color-picker-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-picker-swatches {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.color-swatch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--resume-theme-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--resume-theme-paper) 90%, white);
  color: var(--resume-theme-text);
  padding: 8px 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.color-swatch:hover,
.color-swatch.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-1px);
}

.color-swatch-chip {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  flex: 0 0 auto;
}

.color-swatch-label {
  font-size: 12px;
  color: var(--resume-theme-text);
}

.custom-color-panel {
  border: 1px solid var(--resume-theme-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--resume-theme-paper) 96%, white);
  padding: 10px;
}

.custom-color-row {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 8px;
  align-items: center;
}

.native-color-input {
  width: 42px;
  height: 34px;
  border: 1px solid var(--resume-theme-border);
  border-radius: 10px;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.hex-color-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--resume-theme-border);
  border-radius: 10px;
  background: #fff;
  color: var(--resume-theme-text);
  padding: 8px 10px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.hex-color-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.custom-color-tip,
.custom-color-current {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--resume-theme-subtle);
}

@media (max-width: 640px) {
  .color-picker-swatches {
    grid-template-columns: 1fr;
  }
}
</style>
