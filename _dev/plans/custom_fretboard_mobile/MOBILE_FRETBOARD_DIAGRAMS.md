# Mobile Custom Fretboard — Diagrams

> Reflects proposed additions and changes only (breakpoint: `lg` / 1024px and below).
> Unchanged desktop architecture is omitted unless required for context.

---

## 1. Component Tree (Mobile View)

`[NEW]` = new file. `[MOD]` = existing file with additions.

```
import { useIsMobile } from 'src/hooks/useIsMobile'  ← shared hook, own file,
                                                         import wherever needed

CustomFretboard [MOD]
│
│   ── mobile layout (lg and below) ──────────────────────────────────
│
├── <div.custom-fretboard-editor-wrapper>
│     ├── <span.custom-fretboard-label>  "NUT"
│     │
│     ├── CustomFretboardEditor [MOD]
│     │     New props: rotated, isMobile,
│     │                onLongPressDot, onLongPressCell,
│     │                onTouchTapCell, longPressThreshold
│     │
│     │     SVG  (class: custom-fretboard-editor--rotated)
│     │       width = fretboardConfig.height   (strings span x-axis)
│     │       height = fretboardConfig.width   (frets span y-axis)
│     │       │
│     │       ├── fret lines   (now HORIZONTAL — fixed y per fret)
│     │       ├── string lines (now VERTICAL   — fixed x per string)
│     │       ├── position markers (recomputed with swapped axes)
│     │       ├── background rect (tap → close menu, no new dot)
│     │       ├── hit areas [MOD]
│     │       │     onTouchStart  — start long-press timer
│     │       │     onTouchMove   — cancel timer if empty-cell move > 8 px
│     │       │     onTouchEnd    — fire tap callback if timer not yet fired
│     │       └── fretpoint circles (unchanged render, swapped cx/cy)
│     │
│     └── <span.custom-fretboard-label>  "BRIDGE"
│
├── <div ref=anchorRef>  (zero-size fixed div — OverlayPanel anchor)
│
├── FretpointContextMenu [NEW]
│     └── OverlayPanel (PrimeReact — no mask; dismissable=false)
│           ├── <div.fretpoint-context-menu__header>
│           │     ├── <h3> "Dot Settings"  (left)
│           │     └── Button  ✕ close      (right, calls onClose)
│           ├── ColorPicker (key=dot.id)  +  Checkbox "Apply to all"
│           ├── InputText  (dot label, max 2 chars)
│           └── <div.fretpoint-context-menu__actions>
│                 ├── Button "Reset"   (secondary/text)
│                 └── Button "Delete"  (danger)
│
└── MobileFretboardMenu [NEW]
      │
      ├── Button pi-cog  (class: mobile-fretboard-cog-fab — fixed FAB, top-right)
      │     toggles menuVisible
      │
      └── AppSidebar [NEW]  visible={menuVisible}  position="right"
            │  (wraps PrimeReact Sidebar, class: nav-sidebar)
            │  (automatically appends bass guitar image — same as nav sidebar)
            │
            ├── InputNumber  (fret count)
            ├── SelectButton  (string count: 4 | 5 | 6)
            ├── ──────────────────────────────
            ├── <div.mobile-fretboard-menu__accordion-row>  "Presets" + caret
            │
            └── <div.mobile-fretboard-menu__accordion-body [--open]>
                  │   (padding-left + padding-bottom: 0.5rem when open)
                  │
                  ├── <div.mobile-fretboard-menu__preset-list>
                  │     [preset name text ────── Button pi-trash (danger, small, text)]
                  │     click item → onLoadPreset (auto-load, no separate button)
                  │     delete button → e.stopPropagation() + onDeletePreset
                  │     empty state → "No Saved Presets" text
                  │
                  ├── Button "Save Preset"  (primary, aria-expanded={saveInputOpen})
                  │
                  └── <div.mobile-fretboard-menu__save-input-area>  (conditional)
                        ├── InputText  (preset name, background: gray650)
                        ├── <p> overwrite warning  (conditional)
                        └── Button "Cancel"  +  Button "Save"

              ── (after accordion body) ──
              Button "Export SVG"
              Button "Clear All"
              ── (AppSidebar always appends) ──
              <img> bass-guitar.png
```

---

## 2. Touch Interaction Flow

### 2a — Touch on empty cell

```
touchstart on empty hit area (string s, fret f)
    │
    ▼
Is context menu currently open?
    │                       │
   YES                      NO
    │                       │
    ▼                       ▼
Close context menu     Start long-press timer
Deactivate dot         Record touchStartX/Y
Do NOT add new dot     (threshold = longPressThreshold ms)
    │
    ├── touchmove > 8 px displacement?
    │         │
    │        YES ──→ Clear timer  (scroll gesture, no dot added)
    │
    ├── touchend before timer fires?
    │         │
    │        YES ──→ onTouchTapCell(s, f)
    │                → Add dot (primary purple, no activation, no menu)
    │
    └── Timer fires
              │
              ▼
         navigator.vibrate?.(50)  ← haptic feedback (no-op if unsupported)
         onLongPressCell(s, f, clientX, clientY)
         → Add dot (primary purple)
         → setSelectedDotId(newDot.id)
         → Position anchor div at (clientX, clientY)
         → setContextMenuVisible(true)
         → OverlayPanel opens
```

### 2b — Touch on existing fretpoint

```
touchstart on occupied hit area (dot.id = X)
    │
    ▼
Start long-press timer for dot X
Record touchStartX/Y

    │
    ├── touchmove  (movement does NOT cancel long-press on occupied cells)
    │
    ├── touchend before timer fires?
    │         │
    │        YES ──→ No-op  (short tap on existing dot)
    │
    └── Timer fires
              │
              ▼
         navigator.vibrate?.(50)  ← haptic feedback (no-op if unsupported)
         onLongPressDot(X, clientX, clientY)
         → setSelectedDotId(X)
         → Position anchor div at (clientX, clientY)
         → setContextMenuVisible(true)
         → OverlayPanel opens

Note: OverlayPanel has no mask — the fretboard remains interactive while
the menu is open. This is handled explicitly: onTouchStart checks
isContextMenuOpen first and calls onContextMenuDismiss if true, closing
the menu without starting a timer or placing a dot.
```

### 2c — Context menu interactions

```
Context menu is open, dot is active
    │
    ├── ✕ button clicked
    │         → setContextMenuVisible(false)
    │         → setSelectedDotId(null)
    │
    ├── Outside click (mousedown on any element outside .p-overlaypanel)
    │   (CustomFretboard mousedown handler — OverlayPanel is dismissable=false)
    │         → setContextMenuVisible(false)
    │         → setSelectedDotId(null)
    │
    ├── Tap anywhere on fretboard
    │   (routed through onTouchTapCell → context-menu-open branch)
    │         → Close menu + deactivate
    │         → Do NOT add new dot
    │
    ├── "Apply to all" checkbox toggled ON
    │         → handleApplyToAllChange(true)
    │         → setApplyToAll(true)
    │         → Immediately maps all coords to active dot's current color
    │         → Menu stays open
    │
    ├── ColorPicker change (while applyToAll=true)
    │         → handleColorChange(color)
    │         → applyToAll=true: update all dots to new color
    │         → applyToAll=false: update active dot only
    │         → Menu stays open
    │
    ├── Label input change
    │         → handleDotLabelChange(activeId, value)  [max 2 chars]
    │         → Menu stays open
    │
    ├── "Reset" button
    │         → Revert active dot color → resolvedPrimaryColor
    │         → Clear active dot label → undefined
    │         → setHistory with updated coords
    │         → Menu stays open, dot remains active
    │
    └── "Delete" button
              → Remove active dot from coords
              → setContextMenuVisible(false)
              → setSelectedDotId(null)
```

---

## 3. Layout Diagrams

### 3a — Mobile/tablet portrait (menu closed)

```
┌──────────────────────────────┐
│  [☰]                   [⚙]  │  ← hamburger (top-left) / cog FAB (top-right)
├──────────────────────────────┤
│    Custom Fretboard          │
│                              │
│            NUT               │
│  ┌────────────────────────┐  │
│  │                        │  │  ← fret 0 line (nut)
│  │  │    │    │    │      │  │  ← string lines (vertical, left→right)
│  │  │    │    │    │      │  │    string 1 (low E) = leftmost
│  │                        │  │  ← fret 1 line
│  │  │  ● │    │  ● │      │  │
│  │                        │  │  ← fret 2 line
│  │  │    │  ● │    │      │  │
│  │                        │  │  ← fret 3 line
│  │  │  ● │    │    │  ●   │  │
│  │                        │  │
│  │    ·        ·          │  │  ← position markers (between strings)
│  │                        │  │
│  │  │    │    │  ● │      │  │
│  │                        │  │  ← fret 7 line
│  └────────────────────────┘  │
│           BRIDGE             │
└──────────────────────────────┘

Axis reference:
  x →  string 1 (low E)  ──────────────→  string N (high G)
  y ↓  fret 1 (nut) ─────────────────→  fret 7 (bridge end)
```

### 3b — Slide-out menu open (right side)

```
┌───────────┬──────────────────────────┐
│           │  [─ 7 ─]             │    │  ← fret count (InputNumber)
│           │  [4][5][6]           │    │  ← string count (SelectButton)
│           │  ────────────────────│    │
│           │  ┌──────────────────┐│    │
│           │  │  Presets     ▲   ││    │  ← accordion header (open)
│  Fretboard│  ├──────────────────┤    │
│  area     │  │  My preset  [🗑] │    │  ← preset list (above save button)
│  (visible │  │  Bass run   [🗑] │    │
│  behind   │  ├──────────────────┤    │
│  overlay) │  │ [Save Preset]    │    │  ← primary Button (toggles save input)
│           │  │ ┌──────────────┐ │    │
│           │  │ │ preset name  │ │    │  ← inline input (gray650 bg, visible)
│           │  │ └──────────────┘ │    │
│           │  │ ⚠ Overwrites...  │    │  ← overwrite warning (conditional)
│           │  │ [Cancel] [Save]  │    │
│           │  └──────────────────┘    │
│           │                          │
│           │  [Export SVG]            │
│           │  [Clear All]             │
│           │                          │
│           │  [bass guitar image]     │  ← always present (from AppSidebar)
└───────────┴──────────────────────────┘
                 ↑ AppSidebar (PrimeReact Sidebar, position=right)
                   class: nav-sidebar — inherits $overlay-1 background,
                   same outline and visual style as left nav sidebar
```

### 3c — Fretpoint context menu (OverlayPanel)

```
Anchored to zero-size div positioned at long-press clientX/Y

        ┌─ Dot Settings ───────────[✕]─┐
        │                              │
        │  ● [color swatch]            │
        │    ☐ Apply to all            │
        │                              │
        │  ┌──────────────────────┐    │
        │  │  Ab  (max 2 chars)   │    │
        │  └──────────────────────┘    │
        │                              │
        │  [Reset]        [Delete]     │
        │                              │
        └──────────────────────────────┘
           ↑ OverlayPanel (no mask — dismissable=false)
             Outside click → mousedown handler in CustomFretboard
               → setContextMenuVisible(false) + setSelectedDotId(null)
             Fretboard touch while open → onTouchStart isContextMenuOpen
               guard → onContextMenuDismiss (no dot placed, no timer)
```

### 3d — AppSidebar component boundary

```
AppSidebar  (src/components/AppSidebar/AppSidebar.tsx)
─────────────────────────────────────────────────────
  Props:  visible, onHide, position, children

  Renders:
  ┌─ PrimeReact Sidebar (class: nav-sidebar) ─────────────┐
  │  {children}               ← caller controls this area  │
  │  ─────────────────────────────────────────────────────  │
  │  <div.nav-sidebar__img-container>                       │
  │    <img.nav-sidebar__img                                │
  │         src={`${import.meta.env.BASE_URL}images/...`}  │
  │  </div>                   ← always present              │
  └────────────────────────────────────────────────────────┘

  Used by:   MobileFretboardMenu (this feature)
  Reuse by:  Future control panel sidebars on other pages

  Not used by: Header.tsx nav sidebar (left sidebar — out of scope
               for this feature; candidate for future refactor)
```

---

## 4. Interaction Priority on Fretboard

```
Touch lands on a hit area
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  Priority 1 — Context menu is open                  │
│    onTouchStart checks isContextMenuOpen first.      │
│    Calls onContextMenuDismiss and returns — menu     │
│    closes, dot deactivates, no timer, no new dot.    │
│    (OverlayPanel has no mask; this is explicit)      │
└────────────────────┬────────────────────────────────┘
                     │ (menu is closed)
                     ▼
┌─────────────────────────────────────────────────────┐
│  Priority 2 — Existing fretpoint                    │
│    Short tap  → no-op                               │
│    Long press → activate + open context menu        │
│    (movement does not cancel)                        │
└────────────────────┬────────────────────────────────┘
                     │ (empty cell)
                     ▼
┌─────────────────────────────────────────────────────┐
│  Priority 3 — Empty space long press                │
│    Stationary hold ≥ threshold → add + activate     │
│    Movement > 8 px → cancel (scroll gesture)        │
└────────────────────┬────────────────────────────────┘
                     │ (timer did not fire)
                     ▼
┌─────────────────────────────────────────────────────┐
│  Priority 4 — Empty space tap                       │
│    touchend before threshold → add dot (purple)     │
│    No activation, no context menu                   │
└─────────────────────────────────────────────────────┘
```

---

## 5. State Additions Summary

```
ControlsContext [MOD]
  + longPressThreshold: number   (default 1000 ms)
  + setLongPressThreshold

CustomFretboard local state [MOD — additions for mobile]
  + contextMenuVisible: boolean
  + contextMenuAnchorEl: HTMLElement | null

MobileFretboardMenu local state [NEW]
  + menuVisible: boolean
  + presetsOpen: boolean         (resets on AppSidebar onHide)
  + saveInputOpen: boolean       (resets on AppSidebar onHide)
```
