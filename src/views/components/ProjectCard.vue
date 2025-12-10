<script setup lang="ts">
import type { Project } from '@/types/resumeConfig'
const projects = defineModel<Project[]>('projects', {
  type: Array as () => Project[],
  required: true,
  default: () => [],
})
</script>
<template>
  <section class="section-card">
    <header class="section-header">
      <div class="section-title">
        <h2>{{ $t('section.projects') }}</h2>
        <p class="eyebrow">Projects</p>
      </div>
      <div class="section-line" aria-hidden="true"></div>
      <span class="section-pill">{{ projects.length }} 个</span>
    </header>

    <div class="entry-list">
      <article v-for="(item, index) in projects" :key="index" class="entry">
        <div class="entry-head">
          <div class="entry-title-block">
            <div class="entry-title-row">
              <span>{{ item.name }}</span>
              <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="entry-link">
                {{ item.link }}
              </a>
            </div>
            <div class="entry-meta">
              <span class="pill">{{ item.role || '角色' }}</span>
              <span v-if="item.projectTime?.length" class="text-slate-500">{{ item.projectTime.join(' · ') }}</span>
            </div>
          </div>
          <span class="entry-index">#{{ index + 1 }}</span>
        </div>

        <div v-if="item.techStack?.length" class="entry-tags">
          <span v-for="stack in item.techStack" :key="stack" class="tag-muted">
            {{ stack }}
          </span>
        </div>

        <div v-if="item.projectDesc" class="entry-desc prose prose-sm" v-html="item.projectDesc"></div>

        <div v-if="item.mainWork?.length" class="entry-block">
          <p class="entry-block-title">主要工作</p>
          <div v-for="(work, wIdx) in item.mainWork" :key="wIdx" class="entry-chip">
            <span v-if="work.title" class="entry-chip-title">{{ work.title }}：</span>
            <span class="entry-chip-text" v-html="work.desc"></span>
          </div>
        </div>

        <div v-if="item.projectAchievements?.length" class="entry-block">
          <p class="entry-block-title">项目成果</p>
          <div class="entry-tags">
            <span v-for="(ach, aIdx) in item.projectAchievements" :key="aIdx" class="tag-accent">
              {{ ach }}
            </span>
          </div>
        </div>
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
  justify-content: space-between;
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
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0 14px;
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
  gap: 8px;
  align-items: baseline;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.entry-link {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-primary);
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.95rem;
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

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-muted {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 600;
  font-size: 0.85rem;
}

.tag-accent {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}

.entry-desc {
  margin: 0;
  color: #334155;
}

.entry-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-block-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.entry-chip {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
}

.entry-chip-title {
  font-weight: 600;
  color: #0f172a;
}

.entry-chip-text {
  line-height: 1.5;
}

.section-pill,
.tag-accent,
.tag-muted,
.entry-chip {
  border: none;
  box-shadow: none;
}

.prose :deep(a) {
  color: var(--color-primary);
}
</style>
