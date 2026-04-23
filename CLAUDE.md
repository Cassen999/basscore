# Claude Rules for BASSCORE

The full architecture and component registry live in `_dev/`. Read those files before making structural changes.

---

## Naming Conventions

- **Interfaces** use `i` prefix: `iCoords`, `iFretboardProps`, `iControlsContext`
- **Type aliases** use `t` prefix: `tInterval`, `tScaleType`, `tColorType`, `tSubdivision`
- **Components and pages**: PascalCase files, default export
- **Contexts**: PascalCase with `Context` suffix (e.g. `ControlsContext.tsx`), named export
- **Hooks**: camelCase with `use` prefix (e.g. `useDebounce.ts`), named export
- **Helpers and services**: camelCase (e.g. `fretboardHelpers.tsx`, `dictionaryService.ts`)
- **SCSS files**: camelCase, matching the component they style (e.g. `metronome.scss`)

---

## TypeScript

- All shared types go in `src/types/types.ts`
- Local-only types are defined at the top of the file that uses them
- Use `interface` for object shapes (prefixed `i`), `type` for unions and aliases (prefixed `t`)
- Every interface property that has a default value **must** include a `/** @default <value> */` JSDoc comment on the same line or the line above. This applies to all new types and any existing type you edit. Example: `/** @default 4 */ numStrings: number;`
- Use `import type` syntax for type-only imports

---

## Components

- Functional components only — no class components
- Props are typed with an `i`-prefixed interface and destructured in the function signature
- Default exports for components, named exports for contexts and hooks
- Use `useMemo` for expensive derived values (coordinate generation, context values)
- Use both `useState` and `useRef` when state is needed inside intervals/callbacks to avoid stale closures (see `Metronome.tsx`)

---

## Context

- Do not create a new context without permission — ask first
- If state needs to be shared across files, raise it rather than creating a new context
- Context values must be memoized with `useMemo`
- Group related state and setters together in the context value object

---

## SCSS / Styling

- All SCSS files are imported centrally through `src/styles/index.scss`
- Component SCSS files live in the component's folder (e.g. `src/components/Fretboard/fretboard.scss`)
- Global/root styles live in `src/styles/` (`globalStyles.scss`, `root.scss`, `variables.scss`)
- Reference `variables.scss` from a component SCSS file as `../../styles/variables.scss`
- Use CSS custom properties (`var(--primary-color)`) — no hardcoded color values
- BEM naming: `.block`, `.block__element`, `.block--modifier`
- Max 2 levels of nesting — nest only when it adds clarity
- Keyframe animations defined at the top of the SCSS file, outside any selector
- Avoid inline styles; use class names instead

---

## File Structure

- Each component lives in its own folder under `src/components/` (e.g. `src/components/Fretboard/Fretboard.tsx`)
- Its associated page lives in the same folder (e.g. `src/components/Metronome/MetronomePage.tsx` alongside `Metronome.tsx`)
- Its SCSS file also lives in the same folder (e.g. `src/components/Fretboard/fretboard.scss`)
- If a page and a component share the same domain, they share a single SCSS file in the same folder
- `src/styles/` contains only global and root styles: `index.scss`, `globalStyles.scss`, `root.scss`, `variables.scss`
- `src/styles/index.scss` imports all SCSS — reference component SCSS with path `../components/<Name>/<file>.scss`
- Check `_dev/COMPONENTS.md` before creating a new component, hook, or service — it may already exist
- Follow the "Adding New Files" checklist in `_dev/ARCHITECTURE.md` when adding pages or components

---

## Git

Branch model: `main` → `develop` → feature branches

- **`main`** — stable/release only. Never commit here directly.
- **`develop`** — integration branch. Triggers GitHub Pages deploy on push. Never commit here directly.
- **Feature branches** — always branch off `develop`. PR back into `develop` when done.
- Before any commit, confirm the current branch is a feature branch (not `main` or `develop`)
- When given the command **"commit all"**: stage all pending changes, confirm the branch with the user, then commit to the current branch

---

## Best Practices Guardrail

If a request contradicts current best practices for React, TypeScript, CSS, SASS, Vite, JavaScript, WCAG accessibility, or PrimeReact, flag it before proceeding. Specifically:

- State exactly what rule or guideline it violates
- Name the standard/version where relevant (e.g. WCAG 2.2, React 19, PrimeReact v10)
- Suggest the recommended alternative
- Then ask whether to proceed with the request or use the suggested approach

Do not silently comply with something that violates best practices.

---

## General

- Don't add features, refactors, or improvements beyond what was asked
- Don't add comments unless the logic isn't self-evident
- Don't add error handling for scenarios that can't happen
- Keep responses short and direct

## Testing

The full testing strategy lives in `_dev/TESTING_STRATEGY.md`. Read it before writing or running tests.

- Test files are colocated with the component: `<ComponentName>.test.tsx`
- Tests use **Vitest** + **React Testing Library** + **userEvent**
- Run `npm run test:run`, `npm run lint`, and `npm run build` before every commit — do not commit if any of them fail
- If tests fail, generate a report in `testing/TESTING_REPORTS.md` and a fix plan in `testing/FIX_PLANS.md` immediately
- Only implement a fix plan when explicitly instructed

When a new component, page, hook, or service is added, a corresponding test file must be created alongside it.

---

## Edge Case Handling

When an edge case is encountered that is not explicitly defined in the plan or feature spec:

- **Prefer non-destructive behavior** — do not remove, mutate, or overwrite existing data unless the feature explicitly requires it
- **Do not mutate existing coords** unless explicitly instructed
- **Log a warning in development** using `if (import.meta.env.DEV) console.warn(...)` so edge cases are visible during development without polluting production output
