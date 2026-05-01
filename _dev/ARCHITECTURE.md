# Architecture

## Overview
BASSCORE is a React + TypeScript SPA built with Vite. It is deployed to GitHub Pages at the `/basscore` subpath. All routes are nested under a single layout shell (`HomeContainer`).

---

## Folder Structure

```
src/
├── main.tsx               # Entry point — mounts App with StrictMode
├── App.tsx                # Route definitions (export default)
│
├── components/            # One folder per component; page and SCSS colocate inside
│   ├── Fretboard/
│   │   ├── Fretboard.tsx
│   │   └── fretboard.scss
│   ├── Metronome/
│   │   ├── Metronome.tsx        # component
│   │   ├── MetronomePage.tsx    # page (same domain)
│   │   └── metronome.scss       # shared by both (same domain)
│   ├── CustomFretboardEditor/
│   │   ├── CustomFretboardEditor.tsx
│   │   ├── CustomFretboard.tsx  # page
│   │   └── customFretboard.scss
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── HomeContainer.tsx    # layout shell
│   │   └── homepage.scss
│   ├── Timer/
│   │   ├── Timer.tsx
│   │   ├── TimerControls.tsx
│   │   └── timer.scss
│   └── ...                      # one folder per component or standalone page
├── contexts/              # React contexts — do not add without permission
├── hooks/                 # Custom hooks — must use 'use' prefix
├── services/              # External API calls
├── helpers/               # Pure utility/math functions (no side effects)
├── styles/                # Global and root styles only
│   ├── index.scss         # Aggregates all SCSS imports
│   ├── globalStyles.scss
│   ├── root.scss
│   └── variables.scss
├── test/                  # Vitest setup file
├── types/                 # types.ts — all shared TypeScript types
└── assets/                # Static files (images, fonts)
```

---

## Routing

Defined in `App.tsx`. All routes are children of the `HomeContainer` outlet, which provides the `Header`, `Footer`, and `ControlsProvider` context wrapper.

| Path | Component | File |
|---|---|---|
| `/` | Redirects to `/home` | — |
| `/home` | `Home` | `src/components/Home/Home.tsx` |
| `/scales` | `Scales` | `src/components/Scales/Scales.tsx` |
| `/intervals` | `Intervals` | `src/components/Intervals/Intervals.tsx` |
| `/metronome` | `MetronomePage` | `src/components/Metronome/MetronomePage.tsx` |
| `/tools/fretboard` | `CustomFretboard` | `src/components/CustomFretboardEditor/CustomFretboard.tsx` |

To add a new route: create a page file inside the appropriate `src/components/<Name>/` folder, add a `<Route>` in `App.tsx`, and add a nav item in `src/components/Header/Header.tsx`.

### GitHub Pages deep-link fix

GitHub Pages is a static file server — it returns 404 for any path it can't resolve to a real file. Because this app uses `BrowserRouter`, direct navigation to a route (e.g. `/basscore/home`) would 404 before React ever loads.

**How it works:**
- `public/404.html` — GitHub Pages serves this on any 404. A script encodes the requested path into a redirect to `index.html` (e.g. `/basscore/home` → `/basscore/?/home`).
- `index.html` (head script) — Detects the encoded query string, uses `history.replaceState` to restore the real path, then React mounts with the correct route.

If the base path in `vite.config.ts` ever changes from `/basscore/`, update `pathSegmentsToKeep` in `public/404.html` to match the new depth (1 segment = 1).

---

## File Naming

| Type | Convention | Example |
|---|---|---|
| Page component | `PascalCase.tsx` | `MetronomePage.tsx` |
| UI component | `PascalCase.tsx` | `Fretboard.tsx` |
| Custom hook | `camelCase.ts(x)` with `use` prefix | `useDebounce.ts` |
| Service | `camelCase.ts` | `dictionaryService.ts` |
| Helper | `camelCase.ts(x)` | `fretboardHelpers.tsx` |
| SCSS | `camelCase.scss` | `metronome.scss` |
| Context | `PascalCase.tsx` with `Context` suffix | `ControlsContext.tsx` |

If a page and a component share the same domain (e.g. `Metronome/Metronome.tsx` + `Metronome/MetronomePage.tsx`), they share a single SCSS file colocated in the same folder (e.g. `Metronome/metronome.scss`). Otherwise every component gets its own SCSS file in its folder.

When a page and a component share a name, the page file is suffixed with `Page` (e.g. `MetronomePage.tsx`) to avoid a filename collision inside the shared folder.

---

## Adding New Files

**New page:**
1. Determine if it shares a domain with an existing component (e.g. a new `FooPage` that renders `Foo`)
   - If yes: create `src/components/Foo/FooPage.tsx` alongside the component
   - If no: create `src/components/Foo/Foo.tsx` in a new folder named after the page
2. Add a `<Route>` in `App.tsx`
3. Add a nav link in `src/components/Header/Header.tsx`
4. Create `src/components/Foo/myPage.scss` (or share with a same-name component in the same folder)
5. Import the SCSS in `src/styles/index.scss` using the path `../components/Foo/myPage.scss`

**New component:**
1. Create `src/components/MyComponent/MyComponent.tsx`
2. Create `src/components/MyComponent/myComponent.scss` (or share with a same-name page)
3. Import the SCSS in `src/styles/index.scss` using the path `../components/MyComponent/myComponent.scss`

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

## Testing

Full strategy: `_dev/TESTING_STRATEGY.md`

| Item | Location |
|---|---|
| Test runner | Vitest (configured in `vite.config.ts`) |
| Setup file | `src/test/setup.ts` |
| Test files | Colocated with component — `<ComponentName>.test.tsx` |
| Failure reports | `testing/TESTING_REPORTS.md` |
| Fix plans | `testing/FIX_PLANS.md` |

**Scripts:**
```bash
npm test              # Watch mode
npm run test:run      # Single run (run before every commit)
npm run test:coverage # Run with coverage report
```

Coverage thresholds (enforced globally): lines ≥ 90%, branches ≥ 85%, functions ≥ 90%, statements ≥ 90%.

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
