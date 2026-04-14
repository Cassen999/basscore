# Architecture

## Overview
BASSCORE is a React + TypeScript SPA built with Vite. It is deployed to GitHub Pages at the `/basscore` subpath. All routes are nested under a single layout shell (`HomeContainer`).

---

## Folder Structure

```
src/
├── main.tsx               # Entry point — mounts App with StrictMode
├── App.tsx                # Route definitions (export default)
├── index.scss             # Aggregates all SCSS imports
│
├── pages/                 # One file per route
├── components/            # Reusable UI components
├── contexts/              # React contexts — do not add without permission
├── hooks/                 # Custom hooks — must use 'use' prefix
├── services/              # External API calls
├── helpers/               # Pure utility/math functions (no side effects)
├── styles/                # All SCSS files
├── types/                 # types.ts — all shared TypeScript types
└── assets/                # Static files (images, fonts)
```

---

## Routing

Defined in `App.tsx`. All routes are children of the `HomeContainer` outlet, which provides the `Header`, `Footer`, and `ControlsProvider` context wrapper.

| Path | Component |
|---|---|
| `/` | Redirects to `/home` |
| `/home` | `Home` |
| `/scales` | `Scales` |
| `/intervals` | `Intervals` |
| `/metronome` | `MetronomePage` |

To add a new route: create a page in `src/pages/`, add a `<Route>` in `App.tsx`, and add a nav item in `Header.tsx`.

---

## File Naming

| Type | Convention | Example |
|---|---|---|
| Page component | `PascalCase.tsx` | `Metronome.tsx` |
| UI component | `PascalCase.tsx` | `Fretboard.tsx` |
| Custom hook | `camelCase.ts(x)` with `use` prefix | `useDebounce.ts` |
| Service | `camelCase.ts` | `dictionaryService.ts` |
| Helper | `camelCase.ts(x)` | `fretboardHelpers.tsx` |
| SCSS | `camelCase.scss` | `metronome.scss` |
| Context | `PascalCase.tsx` with `Context` suffix | `ControlsContext.tsx` |

If a page and a component share the same domain (e.g. `pages/Metronome.tsx` + `components/Metronome.tsx`), they share a single SCSS file (`styles/metronome.scss`). Otherwise every file gets its own SCSS file.

---

## Adding New Files

**New page:**
1. Create `src/pages/MyPage.tsx`
2. Add a `<Route>` in `App.tsx`
3. Add a nav link in `src/components/Header.tsx`
4. Create `src/styles/myPage.scss` (or share with a same-name component)
5. Import the SCSS in `src/styles/index.scss`

**New component:**
1. Create `src/components/MyComponent.tsx`
2. Create `src/styles/myComponent.scss` (or share with a same-name page)
3. Import the SCSS in `src/styles/index.scss`

**New hook:**
1. Create `src/hooks/useMyHook.ts`
2. No SCSS needed

**New service:**
1. Create `src/services/myService.ts`
2. May use `export default` if it will only ever export one thing

**New types:**
- Shared types → `src/types/types.ts`
- Local types → top of the file that uses them

---

## SCSS Conventions

- All SCSS is imported through `src/styles/index.scss`
- Max 2 levels of nesting — nest only when it adds clarity
- Use CSS custom properties (`var(--primary-color)`) over hardcoded values
- BEM naming: `.block`, `.block__element`, `.block--modifier`
- Keyframe animations are defined at the top of the relevant SCSS file, outside any selector

---

## Context

There is currently one context: `ControlsContext` (see `COMPONENTS.md`).
Do not create a new context without permission. If state needs to be shared across files, ask first.
