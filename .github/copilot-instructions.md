# 🤖 Copilot Instructions for resume.dodolalorc.cn

## Project Overview

A Vue 3 + TypeScript resume builder website with multi-language support (Chinese Simplified/Traditional, English, Japanese) and PDF export functionality. The app is configuration-driven: users configure their resume data in `src/data/cv.json`, following the `ResumeConfig` schema, and the app dynamically renders it.

## Architecture

### Core Application Flow
1. **Entry Point** (`src/main.ts`): Initializes Pinia store, Vue Router, and Vue I18n
2. **Single Route** (`src/router/index.ts`): Only one view - `ResumeView.vue`
3. **Config-Driven Rendering** (`src/views/ResumeView.vue`): Loads `cv.json`, binds data to card components
4. **Card Components** (`src/views/components/`): Specialized cards (ProfileCard, EduCard, ExpCard, ProjectCard, AwardCard) using `defineModel` for data binding with parent

### Key Data Flow
```
cv.json → ResumeView.vue → (import cvData) → ref<Partial<ResumeConfig>>() 
  → v-model binding to cards (ProfileCard, EduCard, etc.)
  → TailwindCSS styling + SVG icons
```

### Type Definitions
- **Main schema**: `src/types/resumeConfig.ts` - defines `ResumeConfig`, `Profile`, `ExperienceConfig`, `EducationConfig`, `Project`, `Award`
- All profile data is optional (`?:`) to support partial resumes
- Supports markdown in job descriptions and education descriptions

### Component Patterns
- **Card Components** use `defineModel()` for parent-child two-way binding (Vue 3 modern pattern)
- Example: `ProfileCard.vue` line 8: `const profile = defineModel<Profile>('profile', {...})`
- All cards import types from `@/types/resumeConfig.ts` and use computed properties for conditional rendering
- SVG icons via `vite-svg-loader` (default import as component)

## Development Workflow

### Setup & Build Commands
```bash
# Install (uses Bun by default, but npm/yarn/pnpm also work)
bun install

# Development server with hot reload
bun dev

# Full build: type-check + vite build
bun run build

# Production preview
bun preview

# Type checking only (Vue + TS strict mode)
bun run type-check
```

### Code Quality Tools (All Run Together)
```bash
# Single command that runs all linters in sequence
bun lint

# Includes:
# - oxlint: High-performance JS/TS linter (strict mode, correctness rules)
# - eslint: Vue + TypeScript rules with Prettier integration
# - biome: Formatter with organized imports

# Format code (Prettier on src/)
bun run format

# Run tests
bun test:unit
```

### Code Style & Linting Config
- **Biome** (`biome.json`): Tab indentation, double quotes, organizes imports automatically
- **ESLint** (`eslint.config.ts`): Vue essential + TypeScript recommended + Oxlint rules + Prettier (skip formatting)
- **Prettier** (`.prettierrc.json`): Integrated into eslint config for formatting
- **Oxlint** (`eslint-plugin-oxlint`): Runs in ESLint for correctness-focused rules

**Key Pattern**: When creating new Vue files, ensure they follow the `defineModel` pattern for data binding to parent components (not v-bind:prop emitted updates).

## Project Structure & Conventions

### Directories
- **`src/components/`**: Reusable UI components (IconLogo, common header components)
- **`src/views/`**: Page components; `ResumeView.vue` is the main resume renderer
- **`src/views/components/`**: Card components specific to resume sections (ProfileCard, EduCard, etc.)
- **`src/data/`**: `cv.json` - the resume configuration file users modify
- **`src/i18n/`**: i18n messages (4 language JSON files); default locale is `zhHans`
- **`src/stores/`**: Pinia stores (currently minimal; `counter.ts` is example-only)
- **`src/types/`**: TypeScript interfaces (critical: `resumeConfig.ts` defines all data structures)
- **`src/styles/`**: SCSS variables and base styles; TailwindCSS v4 via `@tailwindcss/vite` plugin
- **`src/router/`**: Vue Router config (single-route app)
- **`src/layout/`**: Layout wrapper component (`view-layout.vue`)

### Path Aliases
- `@/` resolves to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- Always use `@/` imports in new code

### TypeScript Config
- **Base config**: `tsconfig.json` with `baseUrl: "./"` and `@/*` path mapping
- **App config**: `tsconfig.app.json` (strict mode for src/)
- **Node config**: `tsconfig.node.json` (for Vite config files)
- **Test config**: `tsconfig.vitest.json` (for test files)

## Critical Features & Implementations

### PDF Export (`ResumeView.vue`, lines 26–80+)
- Uses `html2canvas` + `jsPDF` to export resume to PDF
- Optimizes file size: scale 1.2, JPEG compression, quality 0.8
- Watermark prevention: `allowTaint: true`, `useCORS: true`
- Canvas: 1080px fixed width for A4 (210mm at 72dpi)
- Error handling: try-catch with user feedback via `isExporting` flag

### Multi-Language Support (`src/i18n/index.ts`)
- 4 supported locales: `zhHans`, `zhHant`, `en`, `ja`
- Fallback locale: `en`
- **Usage**: `{{ $t('key.nested.key') }}` in templates
- Add translations to all 4 JSON files in `src/i18n/` when adding new text fields

### Responsive Design
- TailwindCSS v4 (integrated via `@tailwindcss/vite`)
- Mobile-first: Tailwind's default breakpoints apply
- Check card components for responsive grid classes (e.g., `md:grid-cols-2`)

## When Adding New Features

### Adding a New Resume Section
1. Add interface to `src/types/resumeConfig.ts` (follow `ExperienceConfig` pattern)
2. Add property to `ResumeConfig` interface as optional array
3. Create new card component in `src/views/components/` using `defineModel`
4. Import card in `ResumeView.vue`, bind with v-model
5. Add translations to all 4 files in `src/i18n/`
6. Add test data to `src/data/cv.json`

### Adding i18n Keys
- Update all 4 files: `src/i18n/{zh-Hans,zh-Hant,en,ja}.json`
- Keep structure consistent across languages
- Test in UI at startup to catch missing keys (Vue I18n warns in console)

### Testing
- Vitest framework configured in `vitest.config.ts`
- Test files: `src/**/__tests__/*`
- Run with `bun test:unit`
- ESLint plugin for Vitest enabled in `eslint.config.ts`

## Important Build Considerations

- **npm-run-all2**: Used for `build` script to run `type-check` and `build-only` in parallel (`run-p`)
- **Vite plugins**: Vue 3, Vue JSX, Tailwind CSS v4, SVG loader, Vue DevTools (dev-only recommended)
- **Build output**: `dist/` directory
- **Environment**: `import.meta.env` for env variables (e.g., `BASE_URL`)

## Common Pitfalls to Avoid

1. **Don't create custom state in Pinia** - current store (`counter.ts`) is example-only. New features should pass data via props/models.
2. **Don't add optional chaining without type checks** - strict TypeScript enabled; profile fields are optional but must be checked before use.
3. **i18n keys must be in all 4 languages** - missing keys cause console warnings and untranslated UI.
4. **Use `defineModel` in new cards** - not v-bind + emit; this is the Vue 3.4+ pattern used here.
5. **SVG imports need `vite-svg-loader` syntax** - import as component (e.g., `import Icon from '@/assets/icon.svg?component'`).

## Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `bun dev` | Hot-reload dev server |
| `bun build` | Type-check + build production |
| `bun lint` | Run all linters (oxlint + eslint) |
| `bun format` | Format src/ with Prettier |
| `bun test:unit` | Run Vitest suite |
| `bun type-check` | TypeScript check only |
| `bun preview` | Preview production build |
