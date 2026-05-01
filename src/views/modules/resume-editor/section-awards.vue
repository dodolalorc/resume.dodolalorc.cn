<script setup lang="ts">
import type { Award, ResumeConfig, ResumeLocale } from '@/types/resume'
import FormInput from '../../components/form-input.vue'
import IconLogo from '@/components/icon-logo.vue'
import { resolveLocalizedText, setLocalizedText } from '@/utils/localized'

const props = defineProps<{
  locale: ResumeLocale
}>()

const resume = defineModel<ResumeConfig>('resume', { required: true })

const awardList = () => (resume.value.awards ??= [])
const fieldText = (item: Award, key: keyof Award) =>
  resolveLocalizedText(item[key] as never, props.locale)
const updateFieldText = (item: Award, key: keyof Award, value: string) => {
  setLocalizedText(item as unknown as Record<string, unknown>, key, props.locale, value)
}

const addAward = () => {
  awardList().push({ title: '', level: '', date: '' } as Award)
}

const removeAward = (index: number) => {
  awardList().splice(index, 1)
}
</script>

<template>
  <div class="section-content">
    <div class="section-header">
      <h3 class="section-title">奖项</h3>
      <button class="action-btn add" @click="addAward">
        <IconLogo name="add" /> 新增
      </button>
    </div>

    <div v-for="(item, idx) in awardList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="action-btn delete" @click="removeAward(idx)">
          <IconLogo name="delete" /> 删除
        </button>
      </div>
      <div class="form-grid-3">
        <FormInput
          :model-value="fieldText(item, 'title')"
          label="名称"
          @update:model-value="updateFieldText(item, 'title', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'level')"
          label="等级"
          @update:model-value="updateFieldText(item, 'level', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'issuer')"
          label="颁发机构"
          @update:model-value="updateFieldText(item, 'issuer', $event)"
        />
        <FormInput
          :model-value="fieldText(item, 'category')"
          label="奖项类别"
          placeholder="学业类 / 创新类 / 综合类"
          @update:model-value="updateFieldText(item, 'category', $event)"
        />
        <FormInput v-model="item.date" label="时间" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin: 0;
  font-size: 16px;
}

.card {
  border: 1px solid #d6d0c4;
  background: #fff;
  padding: 12px;
}

.card-header {
  margin-bottom: 8px;
  color: #6b665c;
  font-size: 13px;
}

.form-grid-3 {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .form-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d6d0c4;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn :deep(.icon-logo) {
  width: 14px;
  height: 14px;
  padding: 0;
}

.action-btn.add {
  border-color: #b8d8c0;
  background: #eff8f1;
  color: #25633b;
}

.action-btn.delete {
  border-color: #efc4bd;
  background: #fff1ef;
  color: #a33a2b;
}
</style>
