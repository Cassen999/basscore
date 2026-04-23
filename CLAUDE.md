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
- Add JSDoc comments with `@default` tags on interface properties
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
- Use CSS custom properties (`var(--primary-color)`) — no hardcoded color values
- BEM naming: `.block`, `.block__element`, `.block--modifier`
- Max 2 levels of nesting — nest only when it adds clarity
- Keyframe animations defined at the top of the SCSS file, outside any selector
- Avoid inline styles; use class names instead

---

## File Structure

- If a page and a component share the same domain (e.g. `Metronome.tsx` in both pages and components), they share a single SCSS file
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
