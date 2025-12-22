<script setup lang="ts">
import type { ExperienceConfig } from '@/types/resume'

const experience = defineModel<ExperienceConfig[]>('experience', {
  type: Array as () => ExperienceConfig[],
  required: true,
  default: () => [],
})
</script>
<template>
  <section class="section-card">
    <header class="section-header">
      <div class="section-title">
        <h2>{{ $t('section.experience') }}</h2>
        <p class="eyebrow">Experience</p>
      </div>
      <div class="section-line" aria-hidden="true"></div>
      <span class="section-pill">{{ experience.length }} 段</span>
    </header>

    <div class="entry-list">
      <article v-for="(item, index) in experience" :key="index" class="entry">
        <div class="entry-head">
          <div class="entry-title-block">
            <div class="entry-title-row">
              <span class="entry-title">{{ item.company || '未填写公司' }}</span>
              <span v-if="item.partment" class="entry-sub">· {{ item.partment }}</span>
            </div>
            <div class="entry-meta">
              <span class="pill">{{ item.jobTitle || '职位' }}</span>
              <span v-if="item.jobTime?.length" class="text-slate-500">{{
                item.jobTime.join(' · ')
              }}</span>
            </div>
          </div>
          <span class="entry-index">#{{ index + 1 }}</span>
        </div>

        <ul v-if="item.jobDesc?.length" class="entry-desc">
          <li v-for="(desc, dIdx) in item.jobDesc" :key="dIdx" class="entry-desc-item">
            <span class="bullet">●</span>
            <span v-html="desc"></span>
          </li>
        </ul>
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
  background: var(--color-accent);
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

.entry-title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.entry-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.entry-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.entry-sub {
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

.entry-index {
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #94a3b8;
}

.entry-desc {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-desc-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.95rem;
  color: #334155;
}

.bullet {
  color: var(--color-primary);
  font-size: 0.85rem;
  line-height: 1.4;
}

ul :deep(a) {
  color: var(--color-primary);
}
</style>
