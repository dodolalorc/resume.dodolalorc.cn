<script setup lang="ts">
import type { EducationConfig } from '@/types/resume'

const edu = defineModel<EducationConfig[]>('education', {
  type: Array as () => EducationConfig[],
  required: true,
  default: () => [],
})
</script>
<template>
  <section class="section-card">
    <header class="section-header">
      <div class="section-title">
        <h2>{{ $t('section.education') }}</h2>
        <p class="eyebrow">Education</p>
      </div>
      <div class="section-line" aria-hidden="true"></div>
      <span class="section-pill">累计 {{ edu.length }} 段</span>
    </header>

    <div class="entry-list">
      <article v-for="(item, index) in edu" :key="index" class="entry">
        <div class="entry-head">
          <div>
            <h3 class="entry-title">{{ item.school || '未填写学校' }}</h3>
            <p class="entry-sub">{{ item.major }}</p>
          </div>
          <div class="entry-meta">
            <span class="pill">{{ item.degree || '学位' }}</span>
            <span v-if="item.eduTime?.length" class="text-slate-500">{{
              item.eduTime.join(' · ')
            }}</span>
          </div>
        </div>
        <div v-if="item.eduDesc" class="entry-desc" v-html="item.eduDesc"></div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.section-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.section-title .eyebrow {
  margin-right: 2px;
}

.section-title h2 {
  margin-right: 2px;
}

.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 0;
  line-height: 1.25rem;
}

.section-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
  line-height: 1.25rem;
}

.section-pill {
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--color-secondary);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--color-muted);
  opacity: 0.8;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 12px;
  border-bottom: 1px solid var(--color-muted);
}

.entry:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.entry-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.entry-sub {
  margin: 4px 0 0;
  color: #475569;
  font-size: 0.95rem;
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
}

.entry-desc {
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
}

.prose :deep(a) {
  color: var(--color-primary);
}
</style>
