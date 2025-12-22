<script setup lang="ts">
import type { Award } from '@/types/resume'
const awards = defineModel<Award[]>('awards', {
  type: Array as () => Award[],
  required: true,
  default: () => [],
})
</script>
<template>
  <section class="section-card">
    <header class="section-header">
      <div class="section-title">
        <h2>{{ $t('section.awards') }}</h2>
        <p class="eyebrow">Awards</p>
      </div>
      <div class="section-line" aria-hidden="true"></div>
      <span class="section-pill">{{ awards.length }} 项</span>
    </header>

    <div class="entry-list">
      <article v-for="(item, index) in awards" :key="index" class="entry">
        <div class="entry-head">
          <div>
            <h3 class="entry-title">{{ item.title }}</h3>
            <p v-if="item.level" class="entry-sub">{{ item.level }}</p>
          </div>
          <span v-if="item.date" class="entry-tag">{{ item.date }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
<style scoped>
.section-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.section-line {
  flex: 1;
  height: 1px;
  background: var(--color-muted);
  opacity: 0.8;
}

.section-pill {
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--color-secondary);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0 10px;
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
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.entry-sub {
  margin: 4px 0 0;
  color: var(--color-primary);
  font-size: 0.95rem;
}

.entry-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
