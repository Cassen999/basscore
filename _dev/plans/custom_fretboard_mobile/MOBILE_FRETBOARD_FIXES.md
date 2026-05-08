# Custom Fretboard Mobile View Fixes

> All items below have been resolved.

## Context menu functionality

1. **Header** — Added `<h3>` "Dot Settings" title to the header row alongside the close button. Header uses `justify-content: space-between`.

2. **Dot color changing** — Fixed two issues:
   - `ColorPicker` `value` prop was receiving `dot.color` with a `#` prefix; PrimeReact expects the hex string without `#`. Fixed with `String(dot?.color ?? '').replace('#', '')`.
   - Added `key={dot?.id}` to the `ColorPicker` so it remounts when the active dot changes, preventing stale color state from persisting.
   - Root cause of all in-panel actions failing: `CustomFretboard`'s `mousedown` handler (for outside-click deselection) was firing on every tap inside the `OverlayPanel` and clearing `selectedDotId` before button `click` handlers could run. Fixed by adding `.p-overlaypanel` to the exclusion selector. Additionally, `OverlayPanel` changed to `dismissable={false}` to prevent PrimeReact's own outside-click detection from interfering on mobile.

3. **Dot label** — Fixed by the same `dismissable={false}` and `.p-overlaypanel` exclusion fix above, which prevented the InputText from being dismissed on focus.

4. **Reset button** — Fixed by the `.p-overlaypanel` exclusion fix. `handleMobileReset` now runs with `selectedDotId` intact.

5. **Delete button** — Fixed by the same exclusion fix. `handleDeleteSelectedDot` now runs with `selectedDotId` intact.

**Additional fix:** Outside-click dismissal (closing the menu by tapping elsewhere) was restored by adding `setContextMenuVisible(false)` to the `mousedown` handler in `CustomFretboard.tsx`. This fires on outside taps (before any button click fires), while taps inside the panel remain excluded.

**Apply to all:** `handleApplyToAllChange` added — checking the checkbox immediately applies the active dot's color to all dots, giving instant visual feedback. Subsequent color picker changes also apply to all while the flag is set.

---

## Slide-out settings menu visual updates

1. **Fret count input width** — Applied existing `custom-fretboard-fret-count` class to the mobile `InputNumber`, constraining the input to `3rem` (fits 2-digit numbers comfortably).

2. **Save Preset button** — Changed from a plain accordion `div[role=button]` to a PrimeReact `<Button>` (primary style by default).

3. **Preset list / Save Preset order** — Swapped: preset list now renders above the Save Preset button.

4. **Save preset input styling:**
   - Background: `map.get($colors, 'gray650')` (`#262626`) with `$primary-text` foreground and `$secondary-text` placeholder.
   - Focus ring clipping: added `margin: 3px` to the `InputText` (parent has `overflow: hidden` for accordion animation; margin keeps the focus outline inside the visible area).

---

## Bass guitar image

Fixed in `AppSidebar.tsx` and `Header.tsx`. Changed `src='images/bass-guitar.png'` to `` src={`${import.meta.env.BASE_URL}images/bass-guitar.png`} ``. The app is deployed with `base: '/basscore/'` in `vite.config.ts`; a bare relative path resolves incorrectly for nested routes (e.g. `/tools/fretboard`). Using `import.meta.env.BASE_URL` ensures the correct path regardless of the current route.

---

## Hamburger icon

Changed `position: absolute` to `position: fixed` in `homepage.scss` and added `z-index: 1000` to match the cog FAB. The button is `display: none` on desktop so the change has no effect outside mobile.
