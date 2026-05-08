# Mobile Custom Fretboard — Implementation Plan

## Overview

Add a mobile/tablet-optimised experience to the Custom Fretboard page (breakpoint: `lg` / 1024px and below). The fretboard SVG renders with axes swapped: each string becomes a vertical line (running top-to-bottom, like a real bass neck held vertically), and each fret becomes a horizontal line crossing all strings. Strings are ordered left-to-right across the x-axis (string 1, low E, on the left; string N on the right). Fretpoint interaction switches from click/drag to a long-press model. All controls migrate to a new right-side slide-out menu.

This feature also introduces `AppSidebar` — a reusable slide-out wrapper that will be the shared pattern for all future control panel sidebars across pages.

**Guiding constraint:** Do not rewrite existing components or shared context unless strictly necessary. All changes are additive or conditional on `isMobile`.

---

## Design Decisions (from clarification)

| Question | Decision |
|---|---|
| String orientation | String 1 (low E) on the **left**; string N on the right |
| Cog button placement | **Fixed FAB**, top-right of viewport — directly across from the hamburger nav button |
| Fretboard dimensions | **Fixed SVG dimensions** using swapped config values (same pattern as Scales/Intervals mobile — no fluid behaviour) |
| Breakpoint | `lg` (1024px) — covers phones and tablets |
| Long press on already-active dot | **Handled explicitly** — OverlayPanel has no mask; the fretboard remains interactive while the menu is open. `onTouchStart` checks `isContextMenuOpen` first and calls `onContextMenuDismiss` if true, closing the menu without starting a timer or placing a dot. |
| Reusable sidebar | Create new `AppSidebar` component (see Step 5); do not modify `Header.tsx` |

---

## Suggestions

- **`AppSidebar` for nav sidebar**: The left nav sidebar in `Header.tsx` is a natural candidate to be migrated to `AppSidebar` in a future refactor — outside scope here, but worth noting.

---

## New Files

| File | Purpose |
|---|---|
| `src/hooks/useIsMobile.ts` | Returns `boolean` based on `window.matchMedia('(max-width: 1024px)')` |
| `src/hooks/useIsMobile.test.ts` | Unit tests |
| `src/components/AppSidebar/AppSidebar.tsx` | Reusable slide-out sidebar wrapper (new shared pattern for control panels) |
| `src/components/AppSidebar/AppSidebar.test.tsx` | Component tests |
| `src/components/CustomFretboardEditor/FretpointContextMenu.tsx` | OverlayPanel context menu for an active dot on mobile |
| `src/components/CustomFretboardEditor/FretpointContextMenu.test.tsx` | Component tests |
| `src/components/CustomFretboardEditor/MobileFretboardMenu.tsx` | Right-side slide-out controls menu for the Custom Fretboard page |
| `src/components/CustomFretboardEditor/MobileFretboardMenu.test.tsx` | Component tests |
| `src/components/CustomFretboardEditor/CustomFretboardEditor.test.tsx` | Unit tests for touch logic and axis-swap rendering (new file — editor had no dedicated tests) |

---

## Modified Files

| File | What changes |
|---|---|
| `src/types/types.ts` | Add `longPressThreshold` to `iControlsContext`; add `iAppSidebarProps`, `iFretpointContextMenuProps`, `iMobileFretboardMenuProps` |
| `src/contexts/ControlsContext.tsx` | Add `longPressThreshold` state (default 1000 ms) and setter |
| `src/components/CustomFretboardEditor/CustomFretboard.tsx` | Mobile state, conditional rendering, mobile-specific event handlers, mobile default fret count |
| `src/components/CustomFretboardEditor/CustomFretboardEditor.tsx` | Add `rotated`, `isMobile`, touch-event props; axis-swap rendering; nut/bridge labels |
| `src/components/CustomFretboardEditor/customFretboard.scss` | Mobile layout, cog FAB, accordion animation, context menu styles |
| `src/styles/index.scss` | Add import for AppSidebar SCSS (if any AppSidebar-specific styles are needed) |
| `src/components/CustomFretboardEditor/CustomFretboard.test.tsx` | Add mobile test cases |

---

## Implementation Steps

### Step 1 — `useIsMobile` hook

**File:** `src/hooks/useIsMobile.ts`

- Use `window.matchMedia('(max-width: 1024px)')` with `addEventListener('change', ...)`.
- Initialise state from the current `matches` value so the hook is correct on first render.
- Remove listener on unmount.
- Named export `useIsMobile`.
- This is a shared utility hook. Import it from `src/hooks/useIsMobile` wherever mobile detection is needed — it is not scoped to any single component.

**Tests:**
- Mock `window.matchMedia`.
- Assert `true` when media query matches, `false` when it does not.
- Assert listener is registered and removed on unmount.

---

### Step 2 — Extend `ControlsContext`

**File:** `src/contexts/ControlsContext.tsx`

Add to state:
```
longPressThreshold: number       // default 1000
setLongPressThreshold: Dispatch<SetStateAction<number>>
```

Add the corresponding entry to `iControlsContext` in `src/types/types.ts` with `/** @default 1000 */`. No UI is exposed for this value yet.

**Tests:** Update context tests to verify `longPressThreshold` default and setter.

---

### Step 3 — Update `CustomFretboardEditor.tsx` (axis-swap + touch events)

**New props to add:**

```
rotated?: boolean
isMobile?: boolean
onLongPressDot?: (id: string, clientX: number, clientY: number) => void
onLongPressCell?: (string: number, fret: number, clientX: number, clientY: number) => void
onTouchTapCell?: (string: number, fret: number) => void
longPressThreshold?: number
isContextMenuOpen?: boolean
onContextMenuDismiss?: () => void
```

#### Rotated layout (axis swap)

When `rotated=true`, swap coordinate axes across the entire SVG render without altering `fretboardConfig` or the `getX`/`getY` helpers:

- SVG element: `width={fretboardConfig.height}` and `height={fretboardConfig.width}` (swap the config values on the element attributes only).
- For every coordinate pair previously written as `(getX(fret), getY(string))`, use `(getY(string), getX(fret))` — i.e., string position drives x and fret position drives y.
- Result: string 1 (small `getY` value → small x) is on the **left**; fret 1 (small `getX` value → small y) is at the **top**.
- Fret lines that were vertical (`x1=x2`) become horizontal (`y1=y2`).
- String lines that were horizontal (`y1=y2`) become vertical (`x1=x2`).
- Position markers: recalculate `cx/cy` using the swapped axes.
- Hit area `x/y/width/height` attributes: use swapped coordinates; `hitWidth` becomes the fret span on the new x-axis and `hitHeight` becomes the string span on the new y-axis.
- Add CSS class `custom-fretboard-editor--rotated` to the SVG element (available for future overrides).

**NUT and BRIDGE labels:**

On desktop these labels are rendered outside the SVG by the page component. On mobile (`rotated=true`), they are rendered by `CustomFretboard.tsx` as `<span>` elements above and below the `CustomFretboardEditor` wrapper div (see Step 6).

#### Touch long-press detection

Add a single `longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)` and `touchStartPosRef = useRef<{x: number, y: number} | null>(null)` at the component level.

Each hit area gains `onTouchStart`, `onTouchMove`, and `onTouchEnd` handlers:

- `onTouchStart(s, f, e)`:
  - `e.preventDefault()` to suppress ghost mouse events.
  - If `isContextMenuOpen` is true: call `onContextMenuDismiss?.()` and return immediately — no timer started, no dot placed, no callbacks fired. This is the explicit guard that replaces the mask PrimeReact does not provide.
  - Record `touchStartPosRef` from `e.targetTouches[0].clientX/Y`.
  - If the cell is occupied: start timer → fires `onLongPressDot(dot.id, clientX, clientY)`.
  - If the cell is empty: start timer → fires `onLongPressCell(s, f, clientX, clientY)`.
- `onTouchMove(e)`:
  - Calculate displacement from `touchStartPosRef`.
  - If displacement > 8 px **and the cell is empty**: clear timer (touch is a scroll gesture).
  - Per spec, movement does not cancel long-press on an **occupied** cell.
- `onTouchEnd(e)`:
  - Clear timer if still pending.
  - If cell is **empty** and timer had not fired: call `onTouchTapCell(s, f)`.
  - If cell is **occupied** and timer had not fired: no-op.

**Haptic feedback:** When either long-press timer fires (occupied or empty cell), call `navigator.vibrate(50)` immediately before invoking the callback. This is a progressive enhancement — `navigator.vibrate` is a no-op on unsupported devices (Safari, desktop) and requires no feature-detection guard beyond the existence check: `navigator.vibrate?.(50)`.

**Disable drag on mobile:** When `isMobile=true`, do not attach `onMouseDown` to hit areas.

**Tests (`CustomFretboardEditor.test.tsx` — new file):**
- `isContextMenuOpen=true`: `onContextMenuDismiss` is called on `touchstart`; no timer is started; no tap/long-press callback fires.
- Short tap on empty cell fires `onTouchTapCell`; long-press timer does not fire.
- Long press on empty cell (stationary, timer allowed to fire) calls `onLongPressCell` and `navigator.vibrate`.
- Movement > 8 px on empty cell cancels the long-press timer.
- Movement on an occupied cell does not cancel the long-press timer.
- Long press on occupied cell calls `onLongPressDot` and `navigator.vibrate`.
- With `rotated=true`: SVG `width` equals `fretboardConfig.height` and `height` equals `fretboardConfig.width`.
- With `rotated=true`: fret lines have equal `y1`/`y2` (horizontal); string lines have equal `x1`/`x2` (vertical).

---

### Step 4 — Create `FretpointContextMenu.tsx`

**File:** `src/components/CustomFretboardEditor/FretpointContextMenu.tsx`

**Props interface `iFretpointContextMenuProps`:**

```
dot: iCoords | null
visible: boolean
anchorEl: HTMLElement | null        // zero-size div positioned at long-press clientX/Y (see Step 6)
applyToAll: boolean
onClose: () => void
onColorChange: (color: string) => void
onApplyToAllChange: (val: boolean) => void
onLabelChange: (val: string) => void
onReset: () => void
onDelete: () => void
```

Note: `resolvedPrimaryColor` is **not** a prop. Reset behaviour is handled entirely by `handleMobileReset` in `CustomFretboard.tsx` and exposed via `onReset`.

**Implementation:**

- Use PrimeReact `OverlayPanel` with a component `ref`.
- In a `useEffect` watching `visible` and `anchorEl`: call `overlayRef.current.show(null, anchorEl)` when `visible=true`; call `.hide()` when `visible=false`.
- Set `dismissable={false}` on the OverlayPanel. On mobile, PrimeReact's built-in outside-click detection synthesises events that can fire before button `click` handlers, causing all in-panel actions to silently fail. Outside-click dismissal is instead managed by the `mousedown` handler in `CustomFretboard.tsx` (see Step 7).
- OverlayPanel `onHide` → calls `onClose` (handles programmatic hide triggered by the useEffect).
- Content layout (top to bottom):
  1. Header row: `<h3>` "Dot Settings" title (left) + `Button` with `icon='pi pi-times'` (right, calls `onClose`). Use `justify-content: space-between`.
  2. Color row: `ColorPicker` (value stripped of `#`; `key={dot?.id}` to remount on dot change) + `Checkbox` labelled "Apply to all".
  3. `InputText` for label (max 2 chars, `maxLength={2}`). Only render when `dot` is non-null.
  4. Action row: `Button` "Reset" (text/secondary severity) + `Button` "Delete" (danger severity).
- **Reset**: calls `onReset()`. `handleMobileReset` in the parent reverts color to `resolvedPrimaryColor` and clears label. Does **not** call `onClose`.
- Apply class `fretpoint-context-menu` to the OverlayPanel for SCSS targeting.

**Tests (`FretpointContextMenu.test.tsx`):**
- Panel is hidden when `visible=false`.
- Panel is shown when `visible=true`.
- X button calls `onClose`.
- ColorPicker change calls `onColorChange`.
- Apply-to-all checkbox calls `onApplyToAllChange`.
- Label input enforces max 2 chars and calls `onLabelChange`.
- Reset calls `onReset` but NOT `onClose`.
- Delete calls `onDelete`.

---

### Step 5 — Create `AppSidebar.tsx` (reusable pattern)

**File:** `src/components/AppSidebar/AppSidebar.tsx`

This is the shared component for all future control panel slide-outs. It wraps PrimeReact `Sidebar` with the established visual pattern: dark `$overlay-1` background, bass guitar image at the bottom. The trigger button is the **caller's responsibility** — `AppSidebar` is a controlled component.

`nav-sidebar` styles are already defined globally in `homepage.scss` at the root level. Applying `className='nav-sidebar'` to the PrimeReact `Sidebar` is sufficient to inherit background, header, and image container styles. No new SCSS file is required for `AppSidebar` unless additional overrides are needed.

**Props interface `iAppSidebarProps`:**

```
visible: boolean
onHide: () => void
position?: 'left' | 'right' | 'top' | 'bottom'   // default 'right'
children: React.ReactNode
```

**Implementation:**

- Render PrimeReact `Sidebar` with `className='nav-sidebar'`, `visible`, `onHide`, `position`.
- Inside the Sidebar, render `{children}` followed by the bass guitar image using the existing `.nav-sidebar__img-container` / `.nav-sidebar__img` classes (same markup as the nav sidebar in `Header.tsx`).

**Tests (`AppSidebar.test.tsx`):**
- Renders children when visible.
- Renders bass guitar image.
- Calls `onHide` when PrimeReact Sidebar fires its close event.
- `position` prop is forwarded to the underlying Sidebar.

---

### Step 6 — Create `MobileFretboardMenu.tsx`

**File:** `src/components/CustomFretboardEditor/MobileFretboardMenu.tsx`

Uses `AppSidebar` for the slide-out panel. Manages its own open/close state for the accordion and inline save input.

**Props interface `iMobileFretboardMenuProps`:**

```
coords: iCoords[]
historyConfig: iFretboardConfig
presets: iCustomFretboardPreset[]
onFretCountChange: (n: number) => void
onStringCountChange: (n: number) => void
onLoadPreset: (id: string) => void
onDeletePreset: (id: string) => void
onSavePreset: (name: string) => void
savePresetName: string
onSavePresetNameChange: (name: string) => void
overwriteWarning: boolean
onExportSvg: () => void
onClearAll: () => void
```

**Internal state:**

```
menuVisible: boolean
presetsOpen: boolean        // accordion expanded state
saveInputOpen: boolean      // inline save input visible state
selectedPresetId: string | null
```

`selectedPresetId` is managed locally rather than lifted to `CustomFretboard` — on mobile, selection immediately calls `onLoadPreset` so there is no separate load step requiring parent-level coordination. When a preset is selected: set `selectedPresetId` and call `onLoadPreset(id)`. When a preset is deleted and it was the selected one: clear `selectedPresetId`.

When `AppSidebar`'s `onHide` fires (explicit close via cog toggle or outside click): reset `presetsOpen=false` and `saveInputOpen=false`.

**Cog trigger button:**

Rendered **outside** `AppSidebar`, in the `MobileFretboardMenu` JSX root. Positioned as a fixed FAB (top-right of viewport) via CSS class `mobile-fretboard-cog-fab` — mirroring the hamburger button's top-left position so the two controls sit symmetrically at opposite corners of the header row. Uses PrimeReact `Button` with `icon='pi pi-cog'` and `className='mobile-fretboard-cog-fab'`. The icon colour is set to `var(--primary-color)` in SCSS.

Clicking the cog toggles `menuVisible`. While the menu is open, clicking the cog also closes the menu (sets `menuVisible=false`, which propagates as `onHide` through `AppSidebar`).

**Slide-out contents (passed as `children` to `AppSidebar`):**

```
[Fret Count label + InputNumber (class: custom-fretboard-fret-count — constrained to 2-digit width)]
[String Count label + SelectButton: 4 | 5 | 6]

─────────────────────────────────────────
[Presets accordion row]
  label "Presets"  +  caret icon (rotates on open/close via CSS class)

  [accordion body — slide-down, visible when presetsOpen=true]
    [padding-left: 0.5rem, padding-bottom: 0.5rem when open]

    [Preset list — rendered ABOVE Save Preset button]
      Each item: [preset name text ────── Button pi-trash (danger, small, text)]
      Clicking item → setSelectedPresetId + onLoadPreset(id)
      Delete button: e.stopPropagation(), then onDeletePreset(id)
      Empty state: "No Saved Presets" text

    Button "Save Preset"  (primary, no severity — triggers saveInputOpen toggle)
      aria-expanded={saveInputOpen}

      [inline input area — conditional render, visible when saveInputOpen=true]
        InputText (placeholder="Preset name", background: map.get($colors, 'gray650'))
        overwrite warning text (conditional)
        Button "Cancel" (secondary)    Button "Save" (disabled if name empty)

[Export SVG button]
[Clear All button]
```

Note: The preset list uses a custom list with per-item trash buttons — not a PrimeReact `Dropdown`.

Bass guitar image is provided by `AppSidebar` automatically.

**Accordion / save input toggle rules:**
- Each category row div (Presets header, Save Preset header) acts as the toggle button.
- No exclusive-open logic: multiple categories can be open simultaneously.
- Accordion state persists while the sidebar is mounted; resets only on `onHide`.

**Preset dropdown `itemTemplate`:** The delete pill button calls `e.stopPropagation()` before `onDeletePreset(id)` so the Dropdown does not close and does not select/load the deleted preset.

**Tests (`MobileFretboardMenu.test.tsx`):**
- Cog button toggles sidebar open/close.
- Cog button while open closes the sidebar.
- Presets row click expands accordion; second click collapses.
- Multiple accordion interactions are independent (no forced single-open behaviour).
- Clicking a preset item calls `onLoadPreset` (no separate load button).
- Delete button calls `onDeletePreset` and does not call `onLoadPreset`.
- Deleting the currently selected preset clears `selectedPresetId`.
- Clicking "Save Preset" button toggles inline input (tested via `fireEvent.click`).
- Save button calls `onSavePreset` with trimmed name and collapses input.
- Cancel collapses input without calling `onSavePreset`.
- Export SVG button calls `onExportSvg`.
- Clear All button calls `onClearAll`.
- Sidebar `onHide` resets `presetsOpen` and `saveInputOpen`.

---

### Step 7 — Update `CustomFretboard.tsx`

**Mobile initial config:**

```typescript
const MOBILE_INITIAL_CONFIG: iFretboardConfig = {
  ...INITIAL_CONFIG,
  numFrets: 7,
  fretpointRadius: 16,
};
```

`fretpointRadius: 16` satisfies WCAG 2.5.5 (minimum 44×44 px touch target) — the hit area height is `fretpointRadius * 3 = 48 px`, which clears the threshold without changing string spacing.

Choose initial config via `isMobile ? MOBILE_INITIAL_CONFIG : INITIAL_CONFIG`. `useIsMobile` reads `window.matchMedia` synchronously on first render, so this is safe.

**New state:**

```
contextMenuVisible: boolean
contextMenuAnchorEl: HTMLElement | null
```

`contextMenuAnchorEl` points to a `useRef<HTMLDivElement>` anchor element rendered in the JSX as a zero-size `<div>` with `position: fixed`, `pointerEvents: none`. Its `style.left` and `style.top` are updated whenever a long-press fires, so `OverlayPanel` positions itself at the touch point.

**Mobile-specific event handlers:**

`handleTouchTapCell(string, fret)`:
- If context menu is open: close menu and deactivate (`setContextMenuVisible(false)`, `setSelectedDotId(null)`). Do **not** add a new dot.
- Otherwise: add new dot with `color: resolvedPrimaryColor`. Do not set `selectedDotId`. No context menu opened.

`handleLongPressCell(string, fret, clientX, clientY)`:
- Add new dot with `color: resolvedPrimaryColor`.
- `setSelectedDotId(newDot.id)`.
- Update anchor position: `anchorRef.current.style.left = clientX + 'px'`, `.style.top = clientY + 'px'`.
- `setContextMenuAnchorEl(anchorRef.current)`.
- `setContextMenuVisible(true)`.

`handleLongPressDot(id, clientX, clientY)`:
- `setSelectedDotId(id)`.
- Update anchor position.
- `setContextMenuAnchorEl(anchorRef.current)`.
- `setContextMenuVisible(true)`.

`handleContextMenuClose()`:
- `setContextMenuVisible(false)`.
- `setSelectedDotId(null)`.

`handleMobileReset()`:
- Revert active dot color to `resolvedPrimaryColor` and clear its label.
- `setHistory(...)` with updated coords.
- Does not touch `contextMenuVisible` or `selectedDotId`.

`handleApplyToAllChange(val: boolean)`:
- Calls `setApplyToAll(val)`.
- When `val=true` and a dot is selected: immediately maps all coords to the active dot's current color and calls `setHistory(...)`. This gives immediate visual feedback at toggle time.
- When `val=false`: only clears the flag, no coord mutation.
- Passed as `onApplyToAllChange` to `FretpointContextMenu` (replaces the bare `setApplyToAll`).

**Keyboard listeners:** Retain existing `keydown` listeners for undo/redo/delete (not shown in mobile UI but harmless to keep).

**`handleMobileExport`:**

Add a dedicated mobile export handler that bypasses the dialog entirely:
```
handleMobileExport() → exportSvg(lastLoadedPresetName ?? 'fretboard')
```
`MobileFretboardMenu` receives `onExportSvg={handleMobileExport}` (not `handleExportClick`). The existing `handleExportClick` → dialog flow is desktop-only and remains unchanged.

**`exportSvg` — iOS Web Share API:**

The existing anchor-click download works on Android Chrome but iOS Safari may preview the SVG inline in a new tab instead of saving it. On mobile, use the Web Share API as the primary path and fall back to the anchor-click if unsupported.

Logic inside `exportSvg` when `isMobile=true`:
1. Build the SVG string as normal.
2. Check `navigator.canShare?.({ files: [...] })` — supported on iOS 15.1+ and Android Chrome.
3. If supported: call `navigator.share({ files: [new File([svgStr], `${fileName}.svg`, { type: 'image/svg+xml' })] })`. This opens the native OS share sheet (iOS: "Save to Files", AirDrop, etc.; Android: standard share targets). No dialog needed — skip `exportDialog` entirely on mobile and call `exportSvg` directly from `onExportSvg`.
4. If not supported: fall back to the existing anchor-click approach.

The Export SVG Dialog (`exportDialog` state + `<Dialog>`) remains for desktop only. On mobile, the filename defaults to `lastLoadedPresetName ?? 'fretboard'` without prompting, consistent with how the rest of the mobile controls avoid modal dialogs.

**Tests to add for export:**
- When `isMobile=true` and `navigator.canShare` returns `true`: `navigator.share` is called with a `File` object; anchor-click is not used.
- When `isMobile=true` and `navigator.canShare` returns `false`: falls back to anchor-click.
- `exportDialog` is not shown on mobile.

**Render — mobile layout:**

```jsx
<div className='custom-fretboard-container'>
  <h1 className='page-title'>Custom Fretboard</h1>

  {/* Mobile layout */}
  <div className='custom-fretboard-page-section custom-fretboard-page-section--mobile'>

    {/* Rotated fretboard with nut/bridge labels */}
    <div className='custom-fretboard-editor-wrapper'>
      <span className='custom-fretboard-label'>NUT</span>
      <CustomFretboardEditor
        rotated
        isMobile
        onLongPressDot={handleLongPressDot}
        onLongPressCell={handleLongPressCell}
        onTouchTapCell={handleTouchTapCell}
        longPressThreshold={longPressThreshold}
        isContextMenuOpen={contextMenuVisible}
        onContextMenuDismiss={handleContextMenuClose}
        {/* ...all existing props unchanged */}
      />
      <span className='custom-fretboard-label'>BRIDGE</span>
    </div>

    {/* Zero-size anchor div for OverlayPanel positioning */}
    <div ref={anchorRef} style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }} />

    <FretpointContextMenu
      dot={selectedDot}
      visible={contextMenuVisible}
      anchorEl={contextMenuAnchorEl}
      applyToAll={applyToAll}
      onClose={handleContextMenuClose}
      onColorChange={handleColorChange}
      onApplyToAllChange={handleApplyToAllChange}
      onLabelChange={label => selectedDotId && handleDotLabelChange(selectedDotId, label)}
      onReset={handleMobileReset}
      onDelete={handleDeleteSelectedDot}
    />

    <MobileFretboardMenu
      coords={coords}
      historyConfig={historyConfig}
      presets={presets}
      onFretCountChange={handleFretCountChange}
      onStringCountChange={handleStringCountChange}
      onLoadPreset={handleLoadPreset}
      onDeletePreset={handleDeletePreset}
      onSavePreset={handleConfirmSave}
      savePresetName={savePresetDialog.name}
      onSavePresetNameChange={name => setSavePresetDialog(prev => ({ ...prev, name }))}
      overwriteWarning={overwriteWarning}
      onExportSvg={handleMobileExport}
      onClearAll={() => { setSelectedDotId(null); setHistory({ coords: [], fretboardConfig: historyConfig }); }}
    />
  </div>

  {/* Desktop layout — unchanged */}
  {!isMobile && (
    <div className='custom-fretboard-page-section'>
      ...
    </div>
  )}

  {/* Export SVG Dialog — shared by both layouts, unchanged */}
  <Dialog ... />
</div>
```

Note: The Save Preset `Dialog` is replaced on mobile by the inline input inside `MobileFretboardMenu`. `handleConfirmSave` must accept a `name` argument directly (instead of reading from `savePresetDialog.name`) so both mobile and desktop can call it. Refactor the save handler signature accordingly.

**Tests to add (`CustomFretboard.test.tsx`):**
- Mock `useIsMobile` to return `true`.
- Mobile initial fret count is 7 and fretpointRadius is 16.
- Tap on empty cell adds a dot with primary purple colour; context menu does not open.
- Long press on empty cell adds a dot and opens context menu.
- Long press on existing dot opens context menu without adding new dot.
- Tap on fretboard while context menu open: closes menu, deactivates dot, does NOT add new dot.
- Reset reverts colour and label; context menu remains open.
- Delete removes dot and closes context menu.
- Desktop `ControlPanel` is not rendered on mobile.
- Export SVG Dialog is not shown on mobile; `exportSvg` is called directly.
- Mobile export uses `navigator.share` when `navigator.canShare` returns `true`.
- Mobile export falls back to anchor-click when `navigator.canShare` returns `false`.

---

### Step 8 — Update SCSS (`customFretboard.scss`)

Add the following (do not modify existing selectors):

**Mobile page section:**
```scss
.custom-fretboard-page-section--mobile {
  flex-direction: column;
  align-items: center;
}
```

**Editor wrapper (holds nut/bridge labels):**
```scss
.custom-fretboard-editor-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

**Nut/Bridge labels:**
```scss
.custom-fretboard-label {
  font-size: 0.75rem;
  color: $secondary-text;
  padding: 0.25rem 0;
}
```

**Rotated SVG (class hook for future overrides):**
```scss
.custom-fretboard-editor--rotated {
  // Axis swap is done at render time — no CSS transform needed.
}
```

**Context menu layout:**
```scss
.fretpoint-context-menu {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-weight: 600;
    font-size: 0.95rem;
    margin: 0;        // reset default h3 margin
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
}
```

**Cog FAB (fixed, top-right of viewport):**
```scss
.mobile-fretboard-cog-fab {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;

  .p-button-icon {
    color: var(--primary-color);
  }
}
```

**Accordion caret and slide-down body:**
```scss
.mobile-fretboard-menu__accordion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem 0;
}

.mobile-fretboard-menu__caret {
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(180deg);
  }
}

.mobile-fretboard-menu__accordion-body {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.25s ease;

  &--open {
    max-height: 600px;
    padding-left: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

// Save preset input area
.mobile-fretboard-menu__save-input-area {
  margin-top: 0.5rem;

  .p-inputtext {
    background: map.get($colors, 'gray650');
    color: $primary-text;
    margin: 3px;       // prevents focus ring from being clipped by overflow: hidden
    width: calc(100% - 6px);

    &::placeholder {
      color: $secondary-text;
    }
  }
}
```

---

## Tests Summary

| File | Status | Coverage |
|---|---|---|
| `src/hooks/useIsMobile.test.ts` | New | matchMedia mock; true/false; listener cleanup |
| `src/components/AppSidebar/AppSidebar.test.tsx` | New | Children rendered; bass image present; onHide called; position forwarded |
| `FretpointContextMenu.test.tsx` | New | All controls: color, label, apply-to-all, reset, delete, close, outside-click |
| `MobileFretboardMenu.test.tsx` | New | Cog toggle; accordion; preset auto-load; delete pill; save inline flow; export; clear all; state reset on close |
| `CustomFretboard.test.tsx` | Update | All mobile interaction flows; mobile config defaults; conditional rendering |
| `ControlsContext` (existing test file) | Update | `longPressThreshold` default and setter |
