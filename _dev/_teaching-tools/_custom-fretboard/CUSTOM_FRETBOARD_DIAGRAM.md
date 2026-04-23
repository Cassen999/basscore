# Custom Fretboard — Technical Diagram

Lives under **Teaching Tools** in the nav at `/teaching-tools/fretboard`.

---

## New File Map

```mermaid
flowchart TD
    subgraph NEW["New Files"]
        CF["pages/CustomFretboard.tsx"]
        CFE["components/CustomFretboardEditor.tsx"]
        SCSS["styles/customFretboard.scss"]
        SVC["services/customFretboardService.ts"]
        HOOK["hooks/useCustomFretboardHistory.ts"]
    end

    subgraph MODIFIED["Modified Files"]
        TYPES["types/types.ts\nupdated iCoords (id?, label, @default color)\n+ iDragState (dotId, dragDirection, prevPreviewFret)\n+ iCustomFretboardPreset"]
        HELPERS["helpers/fretboardHelpers.tsx\n+ snapToCell()\n+ findAvailableFret()"]
        INDEX["styles/index.scss\n+ import customFretboard.scss"]
        APP["App.tsx\n+ /teaching-tools/fretboard nested route"]
        HEADER["components/Header.tsx\n+ Teaching Tools dropdown"]
        COMPDOC["_dev/COMPONENTS.md\n+ register new files"]
    end
```

---

## Teaching Tools Nav Structure

```mermaid
flowchart TD
    NAV["Header Menubar"]
    TT["Teaching Tools\n(dropdown trigger — no route)"]
    FB["Fretboard\n/teaching-tools/fretboard"]

    NAV --> Home
    NAV --> Scales
    NAV --> Intervals
    NAV --> Metronome
    NAV --> TT
    TT --> FB
```

---

## Component Hierarchy

```mermaid
flowchart TD
    CF["CustomFretboard\n(page)"]

    CP["ControlPanel"]
    FC["Fret Count\nInputNumber 1–24"]
    SC["String Count\nSelectButton 4 | 5 | 6"]
    DC["Dot Color\nColorPicker\nlabel: New Dot Color | Selected Dot Color | Color (All Dots)"]
    ATA["Apply to All\nCheckbox under ColorPicker"]
    LBL["Dot Label\nInputText maxLength=2\nvisible only when a dot is selected\npre-filled with current label or empty\nclearing removes the label"]
    UNDO["Undo\nButton + Ctrl+Z"]
    REDO["Redo\nButton + Ctrl+Shift+Z"]
    CA["Clear All\nButton"]
    ES["Export SVG\nButton → Export Dialog"]
    PRESETS["Presets\nSave (→ Save Dialog) · Load Dropdown · Delete"]

    CFE["CustomFretboardEditor\n(component)"]
    SVG["&lt;svg&gt;\nrole=application"]
    L1["① Fret lines\nequal width · fret 1 leftmost"]
    L2["② String lines"]
    L3["③ Position markers\nrepeating every 12 frets via modulo"]
    L4["④ Background rect\ntransparent · onClick → deselect"]
    L5["⑤ Hit areas\n&lt;rect&gt; × (numStrings × numFrets)\nrole=button · tabIndex=0 · aria-label"]
    L6["⑥ User dots\n&lt;circle&gt; · inline fill · pointerEvents=none\nselected: stroke=var(--primary-color)"]
    L7["⑦ Dot labels\n&lt;text&gt; · max 2 chars · auto-contrast fill\npointerEvents=none"]
    L8["⑧ Drag preview\nghost dot · pointerEvents=none"]

    CF --> CP
    CF --> CFE
    CP --> FC
    CP --> SC
    CP --> DC
    DC --> ATA
    CP --> LBL
    CP --> UNDO
    CP --> REDO
    CP --> CA
    CP --> ES
    CP --> PRESETS
    CFE --> SVG
    SVG --> L1
    SVG --> L2
    SVG --> L3
    SVG --> L4
    SVG --> L5
    SVG --> L6
    SVG --> L7
    SVG --> L8
```

---

## Data Flow

```mermaid
flowchart TD
    CC["ControlsContext"]
    FB_CTX["fretboardConfig\n(single source of truth for SVG render)"]
    SNC["scaleNoteColor\n(new-dot color default)"]

    SVC["customFretboardService\n(localStorage CRUD)"]
    HIST["useCustomFretboardHistory\ntracks iHistorySnapshot\n{ coords, fretboardConfig }"]

    CF["CustomFretboard\n(page)"]
    LS1["coords via history present.coords\n(iCoords[] — each dot has UUID id)"]
    LS2["dragState: iDragState | null\n{ dotId, previewString, previewFret,\ndragDirection, prevPreviewFret }"]
    LS3["selectedDotId: string | null"]
    LS4["applyToAll: boolean"]
    LS5["presets: iCustomFretboardPreset[]"]
    LS6["lastLoadedPresetName: string | null"]
    LS7["savePresetDialog + exportDialog"]

    CFE["CustomFretboardEditor"]

    CC --> FB_CTX
    CC --> SNC
    SVC -->|load on mount| LS5
    HIST -->|present.fretboardConfig → useEffect| FB_CTX

    FB_CTX -->|useControls| CF
    SNC -->|useControls| CF
    HIST -->|present, undo, redo| CF

    CF --> LS1
    CF --> LS2
    CF --> LS3
    CF --> LS4

    LS1 -->|coords prop| CFE
    LS2 -->|dragState prop| CFE
    LS3 -->|selectedDotId prop| CFE
    CFE -->|callbacks| CF
```

---

## Dot Color Picker Behavior

```mermaid
flowchart TD
    CHG["User changes color picker value"]
    CHG --> SEL{selectedDotId\n!= null?}

    SEL -->|yes| ATA1{Apply to all?}
    SEL -->|no| ATA2{Apply to all?}

    ATA1 -->|yes| ALL1["Update ALL coords[].color\npush to history"]
    ATA1 -->|no| ONE["Update coords[selectedDotId].color\npush to history"]
    ATA2 -->|yes| ALL2["Update ALL coords[].color\n+ setScaleNoteColor\npush to history"]
    ATA2 -->|no| NEW["setScaleNoteColor only\nno history push"]
```

ColorPicker label text:
- No dot selected + Apply to all off → **"New Dot Color"**
- No dot selected + Apply to all on → **"Color (All Dots)"**
- Dot selected + Apply to all off → **"Selected Dot Color"**
- Dot selected + Apply to all on → **"Color (All Dots)"**

---

## Dot Selection and Deselection

```mermaid
flowchart TD
    E([Event])
    E --> T{Target}

    T -->|"Click empty hit area\n(no dot selected)"| ADD["Create new dot with UUID\nnewDot.id → selectedDotId"]
    T -->|"Click empty hit area\n(dot is selected)"| DESEL3["selectedDotId = null\n(no move, no create)"]
    T -->|"Click occupied hit area\n(different dot)"| SEL["selectedDotId = that dot's id"]
    T -->|"Click occupied hit area\n(already selected)"| DESEL["selectedDotId = null"]
    T -->|"MouseDown on dot hit area"| DRAGSEL["selectedDotId = id + begin drag"]
    T -->|"Click background rect"| DESEL2["selectedDotId = null"]
    T -->|"Color picker interaction"| NOOP["No change to selection"]
    T -->|"Delete key\n(selectedDotId != null)"| DEL["Remove selected dot\npush to history\nselectedDotId = null"]
    T -->|"Delete key\n(selectedDotId == null)"| NOOP2["No-op"]
    T -->|"Click outside SVG\n(not in controls or overlay)"| DESEL4["selectedDotId = null\n(global mousedown handler)"]
```

---

## Interaction Model

```mermaid
flowchart TD
    A([User Action])
    A --> B{Action type}

    B -->|"Click empty hit area\n(no dot selected)"| ADD["Create dot { id: UUID, str, fret, color }\nselectedDotId = new id · push to history"]
    B -->|"Click empty hit area\n(dot selected)"| DESEL_EMPTY["selectedDotId = null\n(no move, no create)"]
    B -->|Click unselected dot| SEL["selectedDotId = dot.id"]
    B -->|Click selected dot| DESEL["selectedDotId = null"]
    B -->|Click background| DESEL2["selectedDotId = null"]
    B -->|"Delete key or Delete button\n(dot selected)"| DEL["Remove dot · selectedDotId = null · push to history"]
    B -->|Change color picker| CC["handleColorChange() — see Color Picker Behavior"]
    B -->|Toggle Apply to All| ATA["applyToAll = !applyToAll"]
    B -->|"Type in Label InputText\n(dot selected)"| LBL["handleDotLabelChange(selectedDotId, value)\ntrim to 2 chars · empty = undefined\npush to history"]
    B -->|MouseDown on dot hit area| MDD["selectedDotId = id\ndragState = { dotId, previewStr, previewFret,\ndragDirection: 1, prevPreviewFret: dot.fret }"]
    B -->|MouseMove on SVG| MM{"dragState\n!= null?"}
    B -->|MouseUp on SVG| MU{"dragState\n!= null?"}
    B -->|Ctrl+Z| UND["history.undo() · setFretboardConfig(restored)"]
    B -->|Ctrl+Shift+Z| RED["history.redo() · setFretboardConfig(restored)"]
    B -->|Change Fret/String Count| CFG["trimCoords() · setHistory(trimmed, newConfig)"]
    B -->|Click Clear All| CLR["setHistory({ coords: [], fretboardConfig })\nselectedDotId = null"]
    B -->|Click Save Preset| SAVEBTN["Open Save Preset Dialog\npre-fill name = lastLoadedPresetName ?? ''"]
    B -->|Confirm Save Preset| SAVE["getByName(name)?\nupdateById OR save()\nreload presets · close dialog"]
    B -->|Load Preset| LP["setHistory(preset)\nsetFretboardConfig(preset.config)\nselectedDotId = null\nlastLoadedPresetName = preset.name"]
    B -->|Delete Preset| DP["deleteById · reload presets"]
    B -->|Click Export SVG| EXBTN["Open Export Dialog\nfileName = lastLoadedPresetName ?? 'fretboard'"]
    B -->|Confirm Export| EX["exportSvg(fileName)"]

    MM -->|yes| DRAG["See Drag with Collision diagram"]
    MM -->|no| NOP([noop])
    MU -->|yes| COMMIT["coords[dotId] updated to previewStr/previewFret\ndragState = null · push to history"]
    MU -->|no| NOP2([noop])
```

---

## Drag with Collision Detection

`prevPreviewFret` is stored in `dragState` and updated on every `onMouseMove` after computing the new preview position.

```mermaid
flowchart TD
    MOVE["onMouseMove fires\ndragState != null"]
    SNAP["snapToCell(mouseX, mouseY)\n→ raw { string, fret }"]
    DIR["Compute direction\nfret > prevPreviewFret → +1\nfret < prevPreviewFret → -1\nfret == prevPreviewFret → keep dragDirection"]
    OCC{"Is { string, fret }\noccupied by another dot?"}
    FREE["Use { string, fret } directly"]
    FIND["findAvailableFret(\n  string, fret, direction,\n  coords, dotId, config\n)"]
    AVAIL{"result != null?"}
    USE["previewString = string\npreviewFret = result"]
    CANCEL["Keep current previewString/previewFret\n(no visual change — cancel move preview)"]
    UPDATE["Update dragState:\n  previewString, previewFret\n  dragDirection = computed direction\n  prevPreviewFret = raw fret\n  (raw fret, not resolved — direction\n  tracks true mouse movement)"]

    MOVE --> SNAP --> DIR --> OCC
    OCC -->|no| FREE --> UPDATE
    OCC -->|yes| FIND --> AVAIL
    AVAIL -->|yes| USE --> UPDATE
    AVAIL -->|no| CANCEL
```

---

## `findAvailableFret` Logic

```mermaid
flowchart TD
    IN["Input: string, targetFret, direction,\ncoords, excludeId, config"]
    OCCUPIED["Build occupied Set\nfrets on string (excluding excludeId)"]
    CHECK{"targetFret unoccupied?"}
    RETURN_TARGET["return targetFret immediately"]
    SEARCH["Walk from targetFret in direction\nstep by ±1"]
    INBOUNDS{"fret in [1, numFrets]?"}
    EMPTY{"fret not in occupied?"}
    FOUND["return fret"]
    REVERSE["No result in primary direction\nreverse: walk from targetFret in -direction"]
    INBOUNDS2{"fret in [1, numFrets]?"}
    EMPTY2{"fret not in occupied?"}
    FOUND2["return fret"]
    NONE["return null\n(caller cancels the move)"]

    IN --> OCCUPIED --> CHECK
    CHECK -->|yes| RETURN_TARGET
    CHECK -->|no| SEARCH
    SEARCH --> INBOUNDS
    INBOUNDS -->|yes| EMPTY
    INBOUNDS -->|no| REVERSE
    EMPTY -->|yes| FOUND
    EMPTY -->|no| SEARCH
    REVERSE --> INBOUNDS2
    INBOUNDS2 -->|yes| EMPTY2
    INBOUNDS2 -->|no| NONE
    EMPTY2 -->|yes| FOUND2
    EMPTY2 -->|no| REVERSE
```

---

## Resize Trim (Coord Pruning on Config Change)

```mermaid
flowchart LR
    CFG["User changes numFrets or numStrings"]
    TRIM["trimCoords(coords, newConfig)\nfilter out dots where\nfret > numFrets OR string > numStrings"]
    HIST["setHistory({ coords: trimmed, fretboardConfig: newConfig })"]
    NOTE["Trimming happens BEFORE setHistory\nSnapshot only contains valid coords"]

    CFG --> TRIM --> HIST --> NOTE
```

---

## Save Preset Dialog

```mermaid
flowchart TD
    BTN["Save Preset Button"]
    OPEN["Open Save Preset Dialog\npre-fill name = lastLoadedPresetName ?? ''"]
    INPUT["InputText bound to dialog.name\nSave button disabled when name.trim().length === 0"]
    WARN{"Preset with that name\nalready exists?"}
    SHOW["Show: 'This will overwrite the existing preset.'"]
    CANCEL["Cancel → close dialog"]
    CONFIRM["Save Button clicked"]
    EXISTS{"getByName(name)\nreturns a preset?"}
    UPDATE["updateById(existing.id, { coords, fretboardConfig, name })\n→ overwrites in localStorage"]
    CREATE["save({ name, coords, fretboardConfig })\n→ new entry in localStorage"]
    DONE["reload presets · close dialog"]

    BTN --> OPEN --> INPUT
    INPUT --> WARN
    WARN -->|yes| SHOW
    WARN -->|no| INPUT
    INPUT --> CANCEL
    INPUT --> CONFIRM
    CONFIRM --> EXISTS
    EXISTS -->|yes| UPDATE --> DONE
    EXISTS -->|no| CREATE --> DONE
```

---

## Export Dialog

```mermaid
flowchart LR
    BTN["Export SVG Button"]
    DLG["Dialog opens\nfileName = lastLoadedPresetName ?? 'fretboard'"]
    CANCEL["Cancel → close"]
    CONFIRM["Export → exportSvg(fileName)\nappends .svg → download · close"]

    BTN --> DLG
    DLG --> CANCEL
    DLG --> CONFIRM
```

---

## SVG Export

No external dependencies — uses native `XMLSerializer`.

```mermaid
flowchart TD
    DLG["Export confirmed\nfileName provided"]
    CLONE["svgRef.current — clone node deep"]
    STRIP["Remove hit area &lt;rect&gt; and background &lt;rect&gt;\n(not needed in exported image)"]
    STYLE["Inject &lt;defs&gt;&lt;style&gt;\nresolve CSS vars via getComputedStyle\nembed resolved stroke for .fret-lines and .string-lines"]
    SERIAL["XMLSerializer.serializeToString(clone)"]
    BLOB["Blob([svgString], { type: 'image/svg+xml' })"]
    URL["URL.createObjectURL(blob)"]
    DL["&lt;a&gt; download='{fileName}.svg' · click()"]
    REVOKE["URL.revokeObjectURL(blob)"]

    DLG --> CLONE --> STRIP --> STYLE --> SERIAL --> BLOB --> URL --> DL --> REVOKE
```

Dot `fill`, label text, and selection ring `stroke` are **inline SVG attributes** — they survive export without CSS resolution.

---

## SVG Layer Order

```mermaid
flowchart TD
    L1["① Fret lines\nstroke from CSS var (resolved at export)\npointer-events: none\nEqual width — getX uses linear spacing"]
    L2["② String lines\nstroke-width varies by string\npointer-events: none"]
    L3["③ Position markers\nfill: gray200 · r = fretpointRadius × 0.6\nrepeating modulo 12 — frets 5,7,9=single · 12=double"]
    L4["④ Background rect\nfull SVG size · fill transparent\nonClick → deselect · stripped on SVG export"]
    L5["⑤ Hit areas  ← ALL pointer events\ntransparent &lt;rect&gt; · role=button · tabIndex=0\nstripped on SVG export"]
    L6["⑤ User dots\nfill: coord.color (inline)\nselected: stroke=primaryColor (inline) · strokeWidth=2\npointer-events: none"]
    L7["⑦ Dot labels\n&lt;text&gt; · max 2 chars\nfill: auto-contrast black/white\npointer-events: none"]
    L8["⑧ Drag preview\nfill: resolvedPrimaryColor · opacity 0.6\npointer-events: none · hidden when dragState=null"]

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
```

---

## Position Marker Geometry

Markers repeat every 12 frets. Only rendered when `fret ≤ numFrets`.

```
markerPosition(fret) = fret % 12 === 0 ? 12 : fret % 12

Single dot:  markerPosition in { 3, 5, 7, 9 }
Double dot:  markerPosition === 12

Examples for a 24-fret neck:
  fret 5  → 5 % 12 = 5   → single
  fret 7  → 7 % 12 = 7   → single
  fret 9  → 9 % 12 = 9   → single
  fret 12 → 12 % 12 = 0  → mapped to 12 → double
  fret 17 → 17 % 12 = 5  → single
  fret 19 → 19 % 12 = 7  → single
  fret 21 → 21 % 12 = 9  → single
  fret 24 → 24 % 12 = 0  → mapped to 12 → double
```

Geometry (applied per marker fret):

```
Single dot
  cx  =  (getX(fret - 1, config) + getX(fret, config)) / 2
  cy  =  (getY(numStrings, config) + getY(1, config)) / 2    ← vertical center
  r   =  fretpointRadius × 0.6

Double dot (markerPosition = 12)
  cx  =  same
  cy1 =  center − (fretpointRadius × 1.5)
  cy2 =  center + (fretpointRadius × 1.5)
  r   =  fretpointRadius × 0.6
```

Fretboard visual (12 frets, 4 strings):

```
  NUT                                                                     BRIDGE
   |    |    |    |    |    |    |    |    |    |    |    |    |
───┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼───  string 4
   |    |    |    |    |    |    |    |    |    |    |    |    |
───┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼───  string 3
   |    |    |    |    | ·  |    | ·  |    | ·  |    | ·  |    |
   |    |    |    |    |    |    |    |    |    |    | ·  |    |     ← fret 12 = double
───┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼───  string 2
   |    |    |    |    |    |    |    |    |    |    |    |    |
───┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼───  string 1
   1    2    3    4    5    6    7    8    9   10   11   12
                       ^         ^         ^         ^^
                                           equal-width cells
```

---

## Hit Area Geometry

```
         getX(fret-1)        getX(fret)
              │                  │
              ├──────────────────┤  ← y = getY(string) − hitHeight / 2
              │                  │
getY(string) ─┤        ●         │  ← string line / dot center
              │                  │
              ├──────────────────┤  ← y = getY(string) + hitHeight / 2

  x       =  getX(fret - 1, config)
  y       =  getY(string, config) − hitHeight / 2
  width   =  getX(fret, config) − getX(fret - 1, config)   ← equal for all cells
  height  =  fretpointRadius × 3
  fill    =  "transparent"
  role    =  "button"
  tabIndex = 0
  aria-label = "String {s}, Fret {f} — {empty | occupied}"
  cursor  =  "pointer" (empty) | "grab" (occupied)
```

Total hit areas = `numStrings × numFrets`

---

## Snap Logic (`snapToCell`)

```mermaid
flowchart TD
    IN["Input: mouseX, mouseY, fretboardConfig"]
    F["For each fret f in 1..numFrets\ncellCenterX = midpoint of getX(f-1) and getX(f)\nfind f with smallest │mouseX − cellCenterX│"]
    S["For each string s in 1..numStrings\nstringY = getY(s, config)\nfind s with smallest │mouseY − stringY│"]
    C["Clamp fret to [1, numFrets]\nClamp string to [1, numStrings]"]
    OUT["Output: { string, fret }"]

    IN --> F --> S --> C --> OUT
```

---

## Preset Data Model

```mermaid
flowchart LR
    LS["localStorage\nKey: 'basscore__custom_fretboard_presets'\nValue: JSON array of iCustomFretboardPreset"]
    SVC["customFretboardService\ngetAll · getById · getByName\nsave · updateById · deleteById"]
    CF["CustomFretboard\npresets state synced on mount\n+ after every mutation"]

    LS <-->|read/write| SVC
    SVC <-->|callbacks| CF
```

```
iCustomFretboardPreset {
  id             UUID → future DB primary key
  name           user display name
  createdAt      ISO 8601 → future DB created_at
  updatedAt      ISO 8601 → future DB updated_at
  coords         iCoords[] — id, color, label per dot
  fretboardConfig iFretboardConfig snapshot
}
```

---

## Undo / Redo Stack

```mermaid
flowchart TD
    HOOK["useCustomFretboardHistory\ntracks iHistorySnapshot (local type)\n{ coords: iCoords[], fretboardConfig: iFretboardConfig }"]
    PAST["past: iHistorySnapshot[]"]
    PRESENT["present: iHistorySnapshot"]
    FUTURE["future: iHistorySnapshot[]"]

    HOOK --> PAST
    HOOK --> PRESENT
    HOOK --> FUTURE

    SET["setHistory(snapshot)\npast ← present\npresent ← snapshot\nfuture cleared"]
    UNDO["undo()\nfuture ← present\npresent ← pop(past)"]
    REDO["redo()\npast ← present\npresent ← pop(future)"]

    HOOK -->|exposes| SET
    HOOK -->|exposes| UNDO
    HOOK -->|exposes| REDO
    HOOK -->|exposes| PRESENT
```

`iHistorySnapshot` is a local type in `useCustomFretboardHistory.ts` — not added to `types.ts`.

When `undo`/`redo` fires, `CustomFretboard` reads `present.fretboardConfig` and calls `setFretboardConfig` via `useEffect` to keep `ControlsContext` in sync.

---

## Mobile Behavior

```mermaid
flowchart LR
    D["Desktop ≥ md"]
    M["Mobile < md"]

    D -->|"Mouse events"| DR["Drag-to-move + collision snapping"]
    D -->|"Click hit area"| P["Place / remove / select"]
    M -->|"No touch handlers"| ND["Drag disabled"]
    M -->|"Tap empty cell (no dot selected)"| P2["Place new dot"]
    M -->|"Tap occupied cell"| SEL2["Select / deselect dot"]
    M -->|"Tap empty cell (dot selected)"| MV["selectedDotId = null\n(deselect — no move)"]
    M -->|"CSS rotate 90°"| ROT["SVG rotated\nfret 1 = topmost"]
```

`customFretboard.scss` hides drag preview and resets cursor at `@media (max-width: md)`.
