<script setup lang="ts">
import type { Award, ResumeConfig } from '@/types/resume'
import FormInput from '../../components/form-input.vue'

const resume = defineModel<ResumeConfig>('resume', { required: true })

const awardList = () => (resume.value.awards ??= [])

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
      <button class="paper-btn" @click="addAward">新增</button>
    </div>

    <div v-for="(item, idx) in awardList()" :key="idx" class="card">
      <div class="card-header">
        <span>第 {{ idx + 1 }} 条</span>
        <button class="paper-btn ghost" @click="removeAward(idx)">删除</button>
      </div>
      <div class="form-grid-3">
        <FormInput v-model="item.title" label="名称" />
        <FormInput v-model="item.level" label="等级" />
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

.paper-btn {
  border: 1px solid #d6d0c4;
  background: #fffdf7;
  color: #2f2a24;
  padding: 4px 10px;
  cursor: pointer;
}

.paper-btn.ghost {
  background: #fff;
}
</style>
