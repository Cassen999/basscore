# Custom Fretboard — Implementation Plan

Lives under **Teaching Tools** in the nav. Route: `/teaching-tools/fretboard`.

See [`CUSTOM_FRETBOARD_DIAGRAM.md`](./CUSTOM_FRETBOARD_DIAGRAM.md) for geometry, data flow, and interaction diagrams.

---

## Overview

Custom Fretboard lets users build a custom bass fretboard layout: configure fret and string count (tracked in undo history), click to place or remove colored dot markers with optional 2-character text labels, drag dots to new positions (desktop) with collision-aware snapping, assign individual colors per dot with an "Apply to all" option, save named presets to localStorage (structured for future DB migration), undo/redo any change including config changes, and export the result as a standalone vector SVG via a filename prompt dialog.

Position markers (frets 3, 5, 7, 9, 12) render as static decorations centered between the strings, matching the grid line color. Markers repeat every 12 frets using modulo. All frets are equal in width.

---

## Confirmed Design Decisions

| Topic | Decision |
|---|---|
| Dot labels | 2 characters max (covers A–G, A#/Bb, R, b3, b7, #5, finger numbers 1–4) |
| Dot identity | Each dot has a UUID (`id`) — handlers use `id`, not array index |
| Per-dot color UX | Click dot to select → panel ColorPicker controls that dot |
| Color picker "Apply to all" | Checkbox below ColorPicker — applies current color to all existing dots |
| Selection ring | Outer ring rendered as a larger circle (`r = fretpointRadius + 3`) placed behind the dot fill circle — ring is entirely outside the dot so the full dot color is visible |
| Undo/redo scope | Tracks both `coords[]` and `fretboardConfig` (fret/string count changes included) |
| Load preset | Restores both dot coords and fretboardConfig |
| SVG export filename | Dialog pre-filled with last-loaded preset name or `fretboard` — user can rename |
| Collision on drag | Snap to next available fret on same string in direction of travel; reverse if bounds hit; cancel if none |
| Resize trim | Dots out of bounds are removed before `setHistory` — not after |
| Preset overwrite | Saving with a name that already exists in localStorage overwrites that entry |
| Delete key | Delete key deletes selected dot; Backspace removed. Delete button in Actions panel also deletes selected dot |
| Position markers | Repeat every 12 frets via modulo; equal-width frets |
| Edge cases | Prefer non-destructive behavior; log warning in dev (see CLAUDE.md) |
| Dot size | `fretpointRadius: 12` (default was 8) — margin in `fretboardHelpers` is now dynamic from config |
| Layout order | Fretboard on left, controls panel on right |
| Hit area focus outline | Removed (`outline: none`) — NOTE: this removes WCAG 2.4.7 Focus Visible compliance |
| Empty cell click (dot selected) | Deselects the current dot — does NOT move it. Tap-to-move mechanic removed. Only drag moves dots |
| Click outside fretboard | Global `mousedown` listener deselects when clicking outside SVG and outside controls panel |

---

## Step 1 — Types

**File:** `src/types/types.ts`

### Update `iCoords` (Fretboard Types section)

Add `id` as optional so existing usages in `fretpoints.tsx` (Scales, Intervals) are not broken. In Custom Fretboard, `id` is **always** populated via `crypto.randomUUID()`.

```ts
export interface iCoords {
  /** UUID — required in Custom Fretboard, optional elsewhere */
  id?: string;
  string: number;
  fret: number;
  /** @default var(--primary-color) */
  color: tColorType;
  /** @default undefined — max 2 characters (e.g. "A#", "Bb", "R", "b7") */
  label?: string;
}
```

### Add `iDragState`

`dotId` replaces `dotIndex` — dots are identified by UUID, not array position. `dragDirection` and `prevPreviewFret` are needed for collision-aware snapping.

```ts
export interface iDragState {
  /** UUID of the dot currently being dragged */
  dotId: string;
  previewString: number;
  previewFret: number;
  /** @default 1 — direction of travel: +1 = toward bridge, -1 = toward nut */
  dragDirection: 1 | -1;
  /** Fret position from the previous mouse move — used to compute dragDirection */
  prevPreviewFret: number;
}
```

### Add `iCustomFretboardPreset`

```ts
export interface iCustomFretboardPreset {
  /** UUID from crypto.randomUUID() — will serve as DB primary key */
  id: string;
  /** User-provided display name */
  name: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last-updated timestamp */
  updatedAt: string;
  /** Full dot state at time of save — id, color, and label included per dot */
  coords: iCoords[];
  /** Fretboard config snapshot — restored in full when preset is loaded */
  fretboardConfig: iFretboardConfig;
}
```

---

## Step 2 — `snapToCell` helper

**File:** `src/helpers/fretboardHelpers.tsx`

Existing planned helper — no changes. Returns raw snapped `{ string, fret }` without collision awareness. Collision resolution happens in `findAvailableFret` (Step 3).

```ts
export const snapToCell = (
  mouseX: number,
  mouseY: number,
  config: iFretboardConfig
): { string: number; fret: number }
```

---

## Step 3 — `findAvailableFret` helper

**File:** `src/helpers/fretboardHelpers.tsx`

New exported pure function. Called during drag to resolve collisions. No side effects.

```ts
export const findAvailableFret = (
  string: number,
  targetFret: number,
  direction: 1 | -1,
  coords: iCoords[],
  excludeId: string,
  config: iFretboardConfig
): number | null
```

### Algorithm

1. Build a `Set<number>` of occupied frets on `string`, excluding the dot with `excludeId`.
2. Starting from `targetFret`, walk in `direction` (±1 per step):
   - If the current fret is in `[1, numFrets]` and not in the occupied set → return it.
   - If out of bounds → stop this direction.
3. If no result found in the primary direction, reverse and walk from `targetFret` in `-direction`:
   - Apply same bounds and occupancy check.
4. If still no result → return `null` (no available fret; caller cancels the move).

> **Edge case:** If `targetFret` itself is unoccupied (the snapped cell is free), return `targetFret` immediately without searching — the common case.

---

## Step 4 — `customFretboardService`

**File:** `src/services/customFretboardService.ts`

Pure localStorage service. No React — no hooks, no state. All functions synchronous.

### Internal read/write helpers (not exported)

```ts
const STORAGE_KEY = 'basscore__custom_fretboard_presets';

const read = (): iCustomFretboardPreset[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

const write = (presets: iCustomFretboardPreset[]): void =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
```

### Exported functions

```ts
export const getAll = (): iCustomFretboardPreset[] =>
  read();

export const getById = (id: string): iCustomFretboardPreset | undefined =>
  read().find(p => p.id === id);

export const getByName = (name: string): iCustomFretboardPreset | undefined =>
  read().find(p => p.name === name);

export const save = (
  preset: Omit<iCustomFretboardPreset, 'id' | 'createdAt' | 'updatedAt'>
): iCustomFretboardPreset => {
  const now = new Date().toISOString();
  const full: iCustomFretboardPreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  write([...read(), full]);
  return full;
};

export const updateById = (
  id: string,
  partial: Partial<iCustomFretboardPreset>
): void => {
  const presets = read().map(p =>
    p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p
  );
  write(presets);
};

export const deleteById = (id: string): void =>
  write(read().filter(p => p.id !== id));
```

`save` is the only function that generates `id` and `createdAt`. `updateById` always writes a new `updatedAt`. `getByName` is used to detect duplicate names before saving (preset overwrite logic in the page).

---

## Step 5 — `useCustomFretboardHistory` hook

**File:** `src/hooks/useCustomFretboardHistory.ts`

Manages a past/present/future undo stack. Tracks a **snapshot** of both `coords` and `fretboardConfig` so config changes (numFrets, numStrings) are fully reversible.

### Local type (defined at top of file — not in `types.ts`)

```ts
interface iHistorySnapshot {
  coords: iCoords[];
  fretboardConfig: iFretboardConfig;
}
```

### Signature

```ts
export const useCustomFretboardHistory = (initial: iHistorySnapshot) => {
  return {
    present,    // iHistorySnapshot — { coords, fretboardConfig }
    setHistory, // (snapshot: iHistorySnapshot) => void
    undo,       // () => void
    redo,       // () => void
    canUndo,    // boolean
    canRedo,    // boolean
  };
};
```

### Internal state

```ts
const [past, setPast] = useState<iHistorySnapshot[]>([]);
const [present, setPresent] = useState<iHistorySnapshot>(initial);
const [future, setFuture] = useState<iHistorySnapshot[]>([]);
```

### `setHistory(snapshot)`
Push current `present` onto `past`. Set `snapshot` as `present`. Clear `future`.

### `undo()`
Guard: if `past` is empty, return. Pop last entry from `past`, push `present` onto `future`, set popped entry as `present`.

### `redo()`
Guard: if `future` is empty, return. Pop first entry from `future`, push `present` onto `past`, set popped entry as `present`.

### Actions that call `setHistory` (tracked in undo/redo)

| Action | Snapshot contents |
|---|---|
| Add dot | new coords + current fretboardConfig |
| Remove dot (click selected dot, Delete key, or Delete button) | new coords + current fretboardConfig |
| Drag-move release | new coords + current fretboardConfig |
| Individual dot color change | new coords + current fretboardConfig |
| Apply-to-all color change | new coords + current fretboardConfig |
| Dot label edit | new coords + current fretboardConfig |
| Clear all | empty coords + current fretboardConfig |
| Load preset | preset.coords + preset.fretboardConfig |
| Fret count change | trimmed coords + new fretboardConfig |
| String count change | trimmed coords + new fretboardConfig |

### Actions that do NOT call `setHistory`
Active new-dot color change (`scaleNoteColor`) · export dialog · preset name input · selection state · drag preview movement

---

## Step 6 — `CustomFretboardEditor` component

**File:** `src/components/CustomFretboardEditor.tsx`

New component. Does **not** import or wrap `Fretboard` — owns the full SVG directly. Fully controlled: all state lives in the parent page.

### Props (local interface at top of file)

```ts
interface iCustomFretboardEditorProps {
  coords: iCoords[];
  dragState: iDragState | null;
  selectedDotId: string | null;
  svgRef: React.RefObject<SVGSVGElement>;
  onCellClick: (string: number, fret: number) => void;
  onDotMouseDown: (id: string) => void;
  onDotSelect: (id: string) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseUp: () => void;
  onBackgroundClick: () => void;
}
```

### SVG layers in render order

| # | Layer | Element | Notes |
|---|---|---|---|
| ① | Fret lines | `<line>` × (numFrets + 1) | Same layout math as `Fretboard.tsx` — equal-width cells |
| ② | String lines | `<line>` × numStrings | Same layout math as `Fretboard.tsx` |
| ③ | Position markers | `<circle>` | Repeating via modulo — see Position Marker section |
| ④ | Background rect | `<rect>` full SVG size, fill transparent | Catches `onClick` → `onBackgroundClick` for deselect |
| ⑤ | Hit areas | `<rect>` × (numStrings × numFrets) | `role="button"` · `tabIndex={0}` · `aria-label` |
| ⑥ | User dots | `<circle>` × coords.length | Inline `fill` + optional selection `stroke` · `pointerEvents="none"` |
| ⑦ | Dot labels | `<text>` × coords with labels | Centered in dot · auto-contrast fill · `pointerEvents="none"` |
| ⑧ | Drag preview | `<circle>` | Visible only when `dragState !== null` |

### Dot fill and selection ring — inline attributes

All user dot `<circle>` elements write `fill` as an **inline SVG attribute**. The selected dot additionally writes `stroke` (resolved `var(--primary-color)`) and `strokeWidth="2"` as inline attributes. Both survive SVG export without CSS resolution.

Default dot color at placement time: `getComputedStyle(document.documentElement).getPropertyValue('--primary-color')` resolved in the parent.

### Dot label rendering

`<text>` centered via `textAnchor="middle"` and `dominantBaseline="central"`. Font size scales with `fretpointRadius`. Text `fill` auto-computed from dot luminance: black for light dots, white for dark (WCAG 1.4.3 compliance). Labels are truncated to 2 characters before render.

### Equal fret width

`getX(i, config)` uses `margin + i * ((width - 2 * margin) / numFrets)` — all cells are equal width by construction. Fret 1 cell is between `getX(0)` and `getX(1)` — the leftmost cell on desktop, topmost when rotated on mobile.

### Position markers — repeating via modulo

```ts
const SINGLE_MARKER_POSITIONS = new Set([3, 5, 7, 9]);
const DOUBLE_MARKER_POSITION = 12;

// For each fret f in [1..numFrets]:
const markerPosition = f % 12 === 0 ? 12 : f % 12;
const isSingle = SINGLE_MARKER_POSITIONS.has(markerPosition);
const isDouble = markerPosition === DOUBLE_MARKER_POSITION;
```

### Hit area accessibility (WCAG 2.2)

Each `<rect>`:
- `role="button"` · `tabIndex={0}`
- `aria-label="String {s}, Fret {f} — {empty | label | occupied}"`
- `onKeyDown`: `Enter` or `Space` fires same action as `onClick`

`<svg>` element: `role="application"` · `aria-label="Custom fretboard editor"`.

### Drag events

`onMouseDown` on hit area (when occupied) initiates drag via `onDotMouseDown(id)`. `onMouseMove` and `onMouseUp` attach to `<svg>`. Mouse-only — no touch handlers.

---

## Step 7 — `CustomFretboard` page

**File:** `src/pages/CustomFretboard.tsx`

### Context values used

```ts
const {
  fretboardConfig,
  setFretboardConfig,
  scaleNoteColor,
  setScaleNoteColor,
} = useControls();
```

### Local state and hooks

```ts
const { present, setHistory, undo, redo, canUndo, canRedo } = useCustomFretboardHistory({
  coords: [],
  fretboardConfig: { width: 700, height: 200, numFrets: 12, numStrings: 4, fretpointRadius: 8 },
});
const { coords, fretboardConfig: historyConfig } = present;

const [dragState, setDragState] = useState<iDragState | null>(null);
const [selectedDotId, setSelectedDotId] = useState<string | null>(null);
const [applyToAll, setApplyToAll] = useState<boolean>(false);
const [presets, setPresets] = useState<iCustomFretboardPreset[]>([]);
const [lastLoadedPresetName, setLastLoadedPresetName] = useState<string | null>(null);
const [savePresetDialog, setSavePresetDialog] = useState<{ visible: boolean; name: string }>({
  visible: false,
  name: '',
});
const [exportDialog, setExportDialog] = useState<{ visible: boolean; fileName: string }>({
  visible: false,
  fileName: 'fretboard',
});
const svgRef = useRef<SVGSVGElement>(null);
```

### Mount effects

```ts
// Sync history's fretboardConfig back to context whenever undo/redo restores it
useEffect(() => {
  setFretboardConfig(historyConfig);
}, [historyConfig]);

// Load presets from localStorage on mount
useEffect(() => {
  setPresets(customFretboardService.getAll());
}, []);

// Keyboard shortcuts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Z') { redo(); return; }
    if (e.ctrlKey && e.key === 'z') { undo(); return; }
    if (e.key === 'Delete' && selectedDotId !== null) {
      handleDeleteSelectedDot();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [undo, redo, selectedDotId, coords]);
```

### Utility: trim out-of-bounds coords

Used before any `setHistory` call that changes `numFrets` or `numStrings`. Not a handler — a pure local function:

```ts
const trimCoords = (c: iCoords[], config: iFretboardConfig): iCoords[] =>
  c.filter(dot => dot.fret <= config.numFrets && dot.string <= config.numStrings);
```

### Handlers

**`handleCellClick(string, fret)`**

If a dot exists at `(string, fret)`:
- If it is the **selected dot** → deselect (`selectedDotId = null`). No removal.
- If it is a **different dot** → select it (`selectedDotId = that dot's id`). No removal.

If no dot exists at `(string, fret)`:
- If `selectedDotId !== null` → **deselect** (`selectedDotId = null`). No move, no create.
- If `selectedDotId === null` → **create** `{ id: crypto.randomUUID(), string, fret, color: resolvedPrimaryColor }`. New dot's `id` becomes `selectedDotId`. Push to history.

**`handleDotSelect(id)`**
Toggle: if `id === selectedDotId` → deselect (`null`). Else → select.

**`handleBackgroundClick()`**
`setSelectedDotId(null)`.

**`handleDeleteSelectedDot()`**
Guard: if `selectedDotId === null` return.
Filter `coords` to remove the dot with matching `id`. `setSelectedDotId(null)`. Push to history.

**`handleDotMouseDown(id)`**
`setSelectedDotId(id)`. Find dot by `id`. Set `dragState = { dotId: id, previewString: dot.string, previewFret: dot.fret, dragDirection: 1, prevPreviewFret: dot.fret }`.

**`handleSvgMouseMove(e)`**
Guard: `dragState === null` → return.
Compute `mouseX`/`mouseY` relative to SVG bounds. Call `snapToCell` → raw `{ string, fret }`.

Determine direction:
- `fret > dragState.prevPreviewFret` → direction = `1`
- `fret < dragState.prevPreviewFret` → direction = `-1`
- `fret === dragState.prevPreviewFret` → direction = `dragState.dragDirection` (keep last known)

Check if `{ string, fret }` is occupied by a dot other than `dragState.dotId`:
- If unoccupied → use `{ string, fret }` directly.
- If occupied → call `findAvailableFret(string, fret, direction, coords, dragState.dotId, historyConfig)`.
  - If result is a fret number → use `{ string, fret: result }`.
  - If result is `null` → keep `dragState.previewString` and `dragState.previewFret` unchanged (cancel move preview).

Update `dragState`: set `previewString`, `previewFret`, `dragDirection`, `prevPreviewFret = fret` (the raw snapped fret, before collision resolution, so direction continues to be computed from raw mouse movement).

**`handleSvgMouseUp()`**
Guard: `dragState === null` → return.
Update `coords`: find dot by `dragState.dotId`, update its `string` and `fret` to `dragState.previewString` / `dragState.previewFret`. Push to history. Clear `dragState`.

**`handleColorChange(color)`**

| selectedDotId | applyToAll | Result |
|---|---|---|
| `null` | `false` | `setScaleNoteColor(color)` — no history push |
| `null` | `true` | Update all `coords[].color` + `setScaleNoteColor(color)` — push to history |
| `string` | `false` | Update matching `coords[id].color` — push to history |
| `string` | `true` | Update all `coords[].color` — push to history |

**`handleFretCountChange(numFrets)`**
Compute new config. Trim coords: `trimCoords(coords, newConfig)`. `setHistory({ coords: trimmed, fretboardConfig: newConfig })`.

**`handleStringCountChange(numStrings)`**
Same pattern as `handleFretCountChange`.

**`handleDotLabelChange(id, value)`**
Trim `value` to 2 characters. Update matching coord's `label` (empty string sets it to `undefined`). Push to history.

**`handleOpenSaveModal()`**
Open save dialog. Pre-populate `savePresetDialog.name` with `lastLoadedPresetName ?? ''`.

**`handleConfirmSave()`**
Guard: `savePresetDialog.name.trim()` must be non-empty (enforced by disabled Save button in modal).
Check for existing preset with same name: `customFretboardService.getByName(savePresetDialog.name)`.
- If exists → `customFretboardService.updateById(existing.id, { coords, fretboardConfig: historyConfig, name: savePresetDialog.name })`.
- If not → `customFretboardService.save({ name: savePresetDialog.name, coords, fretboardConfig: historyConfig })`.

Reload `presets`. Close dialog.

**`handleLoadPreset(id)`**
Fetch preset. `setHistory({ coords: preset.coords, fretboardConfig: preset.fretboardConfig })`. `setSelectedDotId(null)`. `setLastLoadedPresetName(preset.name)`.

**`handleDeletePreset(id)`**
`customFretboardService.deleteById(id)`. Reload `presets`.

**`handleExportClick()`**
`setExportDialog({ visible: true, fileName: lastLoadedPresetName ?? 'fretboard' })`.

**`exportSvg(fileName)`**
Clone `svgRef.current`. Remove hit area `<rect>` and background deselect `<rect>` elements. Inject `<defs><style>` block with resolved CSS var values for fret/string line stroke. Serialize with `XMLSerializer`. `Blob` → `URL.createObjectURL` → temporary `<a>` download click → `URL.revokeObjectURL`.

### `ControlPanel` groups

| Group | Element | Binding |
|---|---|---|
| Fret Count | `InputNumber` min=1 max=24 | `handleFretCountChange` |
| String Count | `SelectButton` [4, 5, 6] | `handleStringCountChange` |
| Dot Color | `ColorPicker` (label changes by selection state) | `handleColorChange` |
| — | `Checkbox` "Apply to all" | `applyToAll` toggle |
| Dot Label | `InputText` maxLength=2 · placeholder="Label" · hidden when no dot selected | `handleDotLabelChange(selectedDotId, value)` |
| Presets | `Button` Save Preset | `handleOpenSaveModal` |
| Presets | `Dropdown` + `Button` Load | `handleLoadPreset` |
| Presets | `Button` Delete | `handleDeletePreset` |
| Actions | `Button` Undo (disabled when `!canUndo`) | `undo()` |
| Actions | `Button` Redo (disabled when `!canRedo`) | `redo()` |
| Actions | `Button` Delete (disabled when `!selectedDotId`, severity=danger) | `handleDeleteSelectedDot()` |
| Actions | `Button` Clear All | setHistory with empty coords |
| Actions | `Button` Export SVG | `handleExportClick` |

### Save Preset Dialog

PrimeReact `Dialog` (modal):
- Header: "Save Preset"
- `InputText` bound to `savePresetDialog.name` — pre-populated with `lastLoadedPresetName ?? ''`
- Helper text: if a preset with that name already exists → "This will overwrite the existing preset."
- Footer: `Button` "Cancel" → close · `Button` "Save" (disabled when `name.trim().length === 0`) → `handleConfirmSave`

### Export SVG Dialog

PrimeReact `Dialog` (modal):
- Header: "Export SVG"
- `InputText` bound to `exportDialog.fileName`
- Helper text: will be saved as `{fileName}.svg`
- Footer: `Button` "Cancel" → close · `Button` "Export" → `exportSvg(fileName)` → close

---

## Step 8 — SCSS

**File:** `src/styles/customFretboard.scss`
**Import:** add to `src/styles/index.scss`

```
.custom-fretboard-container
.custom-fretboard-page-section

.custom-fretboard-editor
  user-select: none

.custom-fretboard-editor__hit-area
  cursor: pointer

.custom-fretboard-editor__hit-area--occupied
  cursor: grab

.custom-fretboard-editor__hit-area--occupied:active
  cursor: grabbing

.custom-fretboard-editor__dot--dragging
  opacity: 0.4

.custom-fretboard-editor__drag-preview
  opacity: 0.6
  pointer-events: none

@media (max-width: map.get($breakpoints, 'md'))
  .custom-fretboard-editor__drag-preview         display: none
  .custom-fretboard-editor__hit-area--occupied   cursor: pointer
```

Note: Selection ring `stroke` and dot `fill` are inline SVG attributes set in JSX — not class-based.

---

## Step 9 — Routing and Navigation

### `src/App.tsx`

```tsx
<Route path="/teaching-tools" element={<Outlet />}>
  <Route path="fretboard" element={<CustomFretboard />} />
</Route>
```

### `src/components/Header.tsx`

```ts
{
  label: 'Teaching Tools',
  items: [
    { label: 'Fretboard', url: '/basscore/teaching-tools/fretboard' }
  ]
}
```

---

## Step 10 — Dependencies

No new npm packages required.

- SVG export: native `XMLSerializer`
- Preset and dot IDs: native `crypto.randomUUID()`

---

## Step 11 — `_dev/COMPONENTS.md` updates

### Add `CustomFretboardEditor` under UI Components

```
### CustomFretboardEditor
File: src/components/CustomFretboardEditor.tsx
Props: iCustomFretboardEditorProps (local) — coords, dragState, selectedDotId, svgRef,
       onCellClick, onDotMouseDown, onDotSelect, onSvgMouseMove, onSvgMouseUp, onBackgroundClick
Export: export default CustomFretboardEditor
Purpose: Interactive SVG fretboard for the Custom Fretboard page. Owns the full SVG
         structure with hit areas, drag+collision snapping, position markers, per-dot labels,
         selection ring, and drag preview. Fully controlled — all state lives in CustomFretboard.
Usage notes:
- Drag is mouse-only (desktop). Mobile: tap hit areas.
- Hit areas: role=button, tabIndex=0, aria-label — keyboard + screen reader accessible
- All dot fill/stroke values are inline SVG attributes — survive SVG export without CSS resolution
- Position markers repeat every 12 frets via modulo
- Dots are identified by UUID (iCoords.id), not array index
```

### Add hook, service, and page entries

```
### useCustomFretboardHistory
File: src/hooks/useCustomFretboardHistory.ts
Export: named export
Purpose: Past/present/future undo stack for iHistorySnapshot { coords, fretboardConfig }.
         Exposes present, setHistory, undo, redo, canUndo, canRedo.
         Config changes (numFrets, numStrings) tracked alongside coord changes.

### customFretboardService
File: src/services/customFretboardService.ts
Export: named — getAll, getById, getByName, save, updateById, deleteById
Purpose: localStorage CRUD for iCustomFretboardPreset[].
         Key: basscore__custom_fretboard_presets. Structured for DB migration.
```

Add `CustomFretboard` to the Pages table:

```
| CustomFretboard.tsx | /teaching-tools/fretboard | Custom fretboard builder — per-dot color/label, collision drag, presets, undo/redo, SVG export |
```

---

## New File Checklist

```
[ ] src/types/types.ts                          update iCoords (add id?) · add iDragState · add iCustomFretboardPreset
[ ] src/helpers/fretboardHelpers.tsx            add snapToCell() · add findAvailableFret()
[ ] src/services/customFretboardService.ts      create
[ ] src/hooks/useCustomFretboardHistory.ts      create
[ ] src/components/CustomFretboardEditor.tsx    create
[ ] src/pages/CustomFretboard.tsx               create
[ ] src/styles/customFretboard.scss             create
[ ] src/styles/index.scss                       import customFretboard.scss
[ ] src/App.tsx                                 add /teaching-tools/fretboard nested route
[ ] src/components/Header.tsx                   add Teaching Tools dropdown
[ ] _dev/COMPONENTS.md                          register all new files

No new npm packages required.
```

---

## Accessibility Notes (WCAG 2.2 Level AA)

| Criterion | Requirement | Implementation |
|---|---|---|
| 1.4.3 Contrast | Text ≥ 4.5:1 | Dot label text color auto-computed from dot luminance (black or white) |
| 1.4.11 Non-text Contrast | UI components ≥ 3:1 | Selection ring uses `var(--primary-color)` against SVG background |
| 2.1.1 Keyboard | All functionality keyboard accessible | Hit areas: `role=button` · `tabIndex=0` · `Enter/Space` · `Delete` key for selected dot |
| 2.4.3 Focus Order | Logical tab order | DOM order: string 1 fret 1 → string 1 fret N → string 2 fret 1… |
| 2.4.7 Focus Visible | Visible focus indicator | Browser `:focus-visible` ring on hit area `<rect>` |
| 4.1.2 Name, Role, Value | Accessible names | `aria-label="String {s}, Fret {f} — {state}"` on each hit area |
