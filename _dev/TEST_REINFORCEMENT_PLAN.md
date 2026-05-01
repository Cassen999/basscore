# Test Reinforcement Plan

This is the implementation guide for bringing BASSCORE test coverage to the global thresholds (90% statements, 85% branches, 90% functions, 90% lines). Each item specifies exactly where to add the test, what steps to take, and which lines it covers.

**When instructed to "carry out the test reinforcement plan":**
1. Work through sections in order
2. After each item: run only the test file just edited (e.g., `npx vitest run src/components/Timer/Timer.test.tsx`) — fix failures before moving to the next item
3. Before moving to the next section: run `npm run test:run` to verify all tests pass together — fix any regressions before continuing
4. After completing all sections: run `npm run test:coverage` and confirm global thresholds are met
5. If an item cannot be implemented as written (element not found, PrimeReact behavior differs): stop, report the issue, do not deviate without instruction
6. Items marked **SKIP** are not implemented

---

## Coverage Baseline (2026-04-27)

| File | Stmts | Branch | Funcs | Lines | Status |
|---|---|---|---|---|---|
| CustomFretboard.tsx | 67.12% | 57.98% | 61.66% | 69.47% | ⬜ Pending |
| TimerControls.tsx | 59.32% | 42.85% | 52.38% | 59.25% | ⬜ Pending |
| Header.tsx | 60.00% | 20.00% | 35.71% | 62.50% | ⬜ Pending |
| SidebarControls.tsx | 64.70% | 100% | 25.00% | 64.70% | ⬜ Pending |
| MetronomePage.tsx | 76.19% | 75.00% | 50.00% | 77.77% | ⬜ Pending |
| fretpoints.tsx | 74.50% | 45.45% | 100% | 74.50% | ⬜ Pending |
| TimerContext.tsx | 84.00% | 50.00% | 83.33% | 84.78% | ⬜ Pending |
| useCustomFretboardHistory.ts | 92.85% | 50.00% | 100% | 100% | ⬜ Pending |

**Global baseline:** 81.45% stmts / 63.98% branch / 76.03% funcs / 82.66% lines

---

## Section 1 — CustomFretboard.tsx

**Test file:** `src/components/CustomFretboardEditor/CustomFretboard.test.tsx`

All items go inside the top-level `CustomFretboard` describe block unless a different block is specified.

---

### Group 1-A: Export SVG

Add to the existing **`dialogs`** describe block.

#### Item 1-A-1 — Export button triggers file download

```ts
it('calls URL.createObjectURL when Export is confirmed', async () => {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() })
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'Export SVG' }))
  await user.click(screen.getByRole('button', { name: 'Export' }))
  expect(URL.createObjectURL).toHaveBeenCalledOnce()
})
```

**Covers:** lines 280–314 (`exportSvg` body), line 530 (Export button onClick)

---

#### Item 1-A-2 — Typing in the filename field updates the hint text

```ts
it('updates the hint text when the filename is changed', async () => {
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'Export SVG' }))
  await user.clear(screen.getByPlaceholderText('File name'))
  await user.type(screen.getByPlaceholderText('File name'), 'my-diagram')
  expect(screen.getByText(/my-diagram\.svg/)).toBeInTheDocument()
})
```

**Covers:** line 536 (Export InputText `onChange`)

---

#### Item 1-A-3 — Dismissing the Export dialog without exporting

```ts
it('does not call createObjectURL when the Export dialog is dismissed via Escape', async () => {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(), revokeObjectURL: vi.fn() })
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'Export SVG' }))
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(URL.createObjectURL).not.toHaveBeenCalled()
})
```

**Covers:** lines 489, 522 (Export dialog `onHide` arrow functions)

**Note:** PrimeReact Dialog fires `onHide` on Escape. If Escape does not close the dialog in jsdom, alternative: `await user.click(screen.getByRole('button', { name: 'Close' }))` while scoped inside the dialog.

---

### Group 1-B: Save Preset — overwrite path

Add to the existing **`dialogs`** describe block.

#### Item 1-B-1 — Saving with an existing name calls `updateById` instead of `save`

```ts
it('calls updateById instead of save when the preset name already exists', async () => {
  vi.mocked(customFretboardService.getByName).mockReturnValue(stubPreset)
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'Save Preset' }))
  await user.type(screen.getByPlaceholderText('Preset name'), 'My Preset')
  await user.click(screen.getByRole('button', { name: 'Save' }))
  expect(customFretboardService.updateById).toHaveBeenCalledOnce()
  expect(customFretboardService.save).not.toHaveBeenCalled()
})
```

**Covers:** line 247 (empty-name guard false path), lines 250–254 (`updateById` branch)

---

### Group 1-C: Preset load and delete

**New describe block:** `preset management`

Both items need `getAll` mocked before render so the preset enters initial state.

#### Item 1-C-1 — Selecting a preset and clicking Load calls `getById`

```ts
it('calls getById with the selected preset id when Load is clicked', async () => {
  vi.mocked(customFretboardService.getAll).mockReturnValue([stubPreset])
  vi.mocked(customFretboardService.getById).mockReturnValue(stubPreset)
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByText('Select preset'))
  await user.click(screen.getByRole('option', { name: 'My Preset' }))
  await user.click(screen.getByRole('button', { name: 'Load' }))
  expect(customFretboardService.getById).toHaveBeenCalledWith('preset-1')
})
```

**Covers:** lines 263–267 (`handleLoadPreset`), line 333 (`presets.map`), line 407 (Dropdown `onChange`), line 416 (Load button `onClick`)

---

#### Item 1-C-2 — Selecting a preset and clicking Delete calls `deleteById`

```ts
it('calls deleteById with the selected preset id when Delete is clicked', async () => {
  vi.mocked(customFretboardService.getAll).mockReturnValue([stubPreset])
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByText('Select preset'))
  await user.click(screen.getByRole('option', { name: 'My Preset' }))
  const presetsGroup = screen.getByText('Presets').closest<HTMLElement>('.control-group')!
  await user.click(within(presetsGroup).getByRole('button', { name: 'Delete' }))
  expect(customFretboardService.deleteById).toHaveBeenCalledWith('preset-1')
})
```

**Covers:** lines 271–273 (`handleDeletePreset`), line 423 (Delete preset button `onClick`)

---

### Group 1-D: Fret count change and trimCoords

**New describe block:** `fret count`

PrimeReact InputNumber with `buttonLayout='horizontal'` renders increment/decrement buttons. Use `{ name: /increment/i }` and `{ name: /decrement/i }` (case-insensitive) to find them.

#### Item 1-D-1 — Clicking the increment button increases the fret count to 13

```ts
it('increments the fret count when the increment button is clicked', async () => {
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: /increment/i }))
  expect(screen.getByRole('spinbutton')).toHaveValue('13')
})
```

**Covers:** line 345 (InputNumber `onValueChange`), lines 225–226 (`handleFretCountChange`)

---

#### Item 1-D-2 — Decreasing the fret count removes dots beyond the new bound

```ts
it('removes a dot at fret 12 when fret count is decremented to 11', async () => {
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 12 — empty' }))
  await user.click(screen.getByRole('button', { name: /decrement/i }))
  expect(screen.queryByRole('button', { name: /Fret 12/ })).not.toBeInTheDocument()
})
```

**Covers:** line 33 (`trimCoords` body), line 226 (`trimCoords` call in `handleFretCountChange`)

---

### Group 1-E: Apply to all and colorPickerLabel

**New describe block:** `apply to all`

#### Item 1-E-1 — Toggling "Apply to all" changes the color picker section label

```ts
it('changes the color picker label to "Color (All Dots)" when Apply to all is checked', async () => {
  const user = userEvent.setup()
  renderCustomFretboard()
  await user.click(screen.getByLabelText('Apply to all'))
  expect(screen.getByText('Color (All Dots)')).toBeInTheDocument()
})
```

**Covers:** line 376 (Checkbox `onChange`), line 320 (`colorPickerLabel` useMemo `applyToAll` branch)

**Note:** If `getByLabelText` does not find the element, try `screen.getByRole('checkbox', { name: /apply to all/i })`.

---

### Group 1-F: Background click deselect

Add to the existing **`click-outside deselect`** describe block.

#### Item 1-F-1 — Clicking the SVG background rect deselects a selected dot

The SVG background is a `<rect>` with no `role` attribute (the first `rect` without `role` in the SVG).

```ts
it('deselects a dot when the SVG background is clicked', async () => {
  const user = userEvent.setup()
  const { container } = renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
  fireEvent.click(container.querySelector('.custom-fretboard-editor rect:not([role])')!)
  const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
  expect(within(actionsGroup).getByRole('button', { name: 'Delete' })).toBeDisabled()
})
```

**Covers:** line 144 (`handleBackgroundClick` body)

---

### Group 1-G: Select a different dot

Add to the existing **`dot interactions`** describe block.

#### Item 1-G-1 — Clicking an occupied dot that is not selected switches selection to it

```ts
it('switches selection when a different occupied dot is clicked', async () => {
  const user = userEvent.setup()
  renderCustomFretboard()
  // Add dot A at (1,1), deselect it
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
  // Add dot B at (2,2), now selected
  await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' }))
  // Click dot A — switches selection to it
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
  // Dot Label input appears only when a dot is selected
  expect(screen.getByPlaceholderText('Label')).toBeInTheDocument()
})
```

**Covers:** line 113 (`setSelectedDotId(dot.id ?? null)` — "select a different dot" branch)

---

### Group 1-H: Drag to occupied cell

Add to the existing **`drag and drop`** describe block.

#### Item 1-H-1 — Dragging a dot onto an occupied cell moves it to the next available fret

With config {width:700, height:200, numFrets:12, numStrings:4, fretpointRadius:12}: margin=15.5, step≈55.75. Fret 2 center X≈99, String 1 Y=184. Dragging to clientX=99, clientY=184 targets String 1 Fret 2 (occupied) → `findAvailableFret` moves to Fret 3.

```ts
it('moves a dot to the next available fret when dragged onto an occupied cell', async () => {
  const user = userEvent.setup()
  renderCustomFretboard()
  // Add dot at (1,1), deselect
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
  // Add dot at (1,2), deselect
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 2 — empty' }))
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 2 — occupied' }))
  const svgEl = screen.getByRole('application', { name: 'Custom fretboard editor' })
  // Drag dot at (1,1) toward (1,2) which is occupied
  fireEvent.mouseDown(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
  fireEvent.mouseMove(svgEl, { clientX: 99, clientY: 184 })
  fireEvent.mouseUp(svgEl)
  // Should land at fret 3 (next available)
  expect(screen.getByRole('button', { name: 'String 1, Fret 3 — occupied' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
})
```

**Covers:** lines 172 (`else` branch — occupied check), 180–182 (`findAvailableFret` call and `available !== null` branch in `handleSvgMouseMove`)

---

### Group 1-I: useCustomFretboardHistory guard conditions

Add to the existing **`keyboard shortcuts`** describe block.

The keyboard handler calls `undo()` and `redo()` unconditionally (no `canUndo`/`canRedo` guard), so firing the shortcuts on a fresh board with no history hits the early-return guards inside the hook.

#### Item 1-I-1 — Ctrl+Z with no history does not crash

```ts
it('does not crash when Ctrl+Z is pressed with no history', () => {
  renderCustomFretboard()
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
  expect(screen.getByRole('application', { name: 'Custom fretboard editor' })).toBeInTheDocument()
})
```

**Covers:** line 21 in `useCustomFretboardHistory.ts` (`if (past.length === 0) return` guard)

---

#### Item 1-I-2 — Ctrl+Shift+Z with no redo history does not crash

```ts
it('does not crash when Ctrl+Shift+Z is pressed with nothing to redo', () => {
  renderCustomFretboard()
  fireEvent.keyDown(window, { key: 'Z', ctrlKey: true, shiftKey: true })
  expect(screen.getByRole('application', { name: 'Custom fretboard editor' })).toBeInTheDocument()
})
```

**Covers:** line 29 in `useCustomFretboardHistory.ts` (`if (future.length === 0) return` guard)

---

### Group 1-J: handleColorChange — via mocked ColorPicker

**File-level setup:** Add the following `vi.mock` at the top of `CustomFretboard.test.tsx` (after existing imports, before any `describe` block). Vitest hoists `vi.mock` automatically so order relative to imports does not matter.

```ts
vi.mock('primereact/colorpicker', () => ({
  ColorPicker: ({ onChange }: { onChange?: (e: { value: string }) => void }) => (
    <button onClick={() => onChange?.({ value: 'ff0000' })}>Pick Color</button>
  ),
}))
```

This mock makes each ColorPicker render as a button that fires `onChange({ value: 'ff0000' })` when clicked. The tests below verify that each branch of `handleColorChange` correctly updates state.

**New describe block:** `color picker`

To read `scaleNoteColor` from context after a change, render a sibling consumer:
```ts
const renderCustomFretboardWithColorConsumer = () => {
  let capturedColor = ''
  const Consumer = () => {
    const { scaleNoteColor } = useControls()
    capturedColor = scaleNoteColor as string
    return <span data-testid="scale-color">{scaleNoteColor as string}</span>
  }
  render(
    <ControlsProvider>
      <CustomFretboard />
      <Consumer />
    </ControlsProvider>
  )
  return capturedColor
}
```

Add `import { useControls } from '../../contexts/ControlsContext'` to the test file imports if not already present.

---

#### Item 1-J-1 — No dot selected: clicking the picker updates `scaleNoteColor` in context

```ts
it('updates scaleNoteColor in context when the color picker fires onChange with no dot selected', async () => {
  const user = userEvent.setup()
  render(
    <ControlsProvider>
      <CustomFretboard />
      <span data-testid="scale-color">
        {/* consumer rendered via wrapper — see helper above */}
      </span>
    </ControlsProvider>
  )
```

Use `renderCustomFretboardWithColorConsumer` instead of `renderCustomFretboard` for this test:

```ts
it('updates scaleNoteColor in context when the color picker fires onChange with no dot selected', async () => {
  const user = userEvent.setup()
  render(
    <ControlsProvider>
      <CustomFretboard />
      {(() => {
        const C = () => { const { scaleNoteColor } = useControls(); return <span data-testid="scale-color">{scaleNoteColor as string}</span> }
        return <C />
      })()}
    </ControlsProvider>
  )
  await user.click(screen.getByRole('button', { name: 'Pick Color' }))
  expect(screen.getByTestId('scale-color')).toHaveTextContent('#ff0000')
})
```

**Covers:** lines 216–218 (`else` branch of `handleColorChange`: `setScaleNoteColor` call), line 370 (ColorPicker `onChange` arrow function)

---

#### Item 1-J-2 — Dot selected: clicking the picker updates that dot's fill color

```ts
it('updates the selected dot color when the color picker fires onChange', async () => {
  const user = userEvent.setup()
  const { container } = renderCustomFretboard()
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
  await user.click(screen.getByRole('button', { name: 'Pick Color' }))
  const dotCircle = container.querySelector(
    'circle:not(.custom-fretboard-editor__position-marker)',
  )
  expect(dotCircle).toHaveAttribute('fill', '#ff0000')
})
```

**Covers:** lines 211–215 (`if (selectedDotId)` branch of `handleColorChange`: single-dot update path)

---

#### Item 1-J-3 — Dot selected + Apply to all: all dots update

```ts
it('updates all dot colors when Apply to all is checked and the picker fires onChange', async () => {
  const user = userEvent.setup()
  const { container } = renderCustomFretboard()
  // Add two dots
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
  await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
  await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' }))
  // Enable Apply to all
  await user.click(screen.getByLabelText('Apply to all'))
  // Click picker with dot 2 selected
  await user.click(screen.getByRole('button', { name: 'Pick Color' }))
  const dotCircles = container.querySelectorAll(
    'circle:not(.custom-fretboard-editor__position-marker)',
  )
  dotCircles.forEach(c => expect(c).toHaveAttribute('fill', '#ff0000'))
})
```

**Covers:** lines 212–213 (`applyToAll` branch: `coords.map(d => ({ ...d, color }))`)

---

### Skipped items — CustomFretboard.tsx

| Lines | Reason |
|---|---|
| 94 (`isInOverlay` guard) | Requires clicking inside an open PrimeReact overlay panel while a dot is selected — extreme setup complexity for a single defensive guard |
| 134 (`handleDotMouseDown` guard) | Unreachable via UI — the editor only passes dot IDs from `coords`, so `!dot` can never be true |

---

## Section 2 — TimerControls.tsx

**Test file:** `src/components/Timer/Timer.test.tsx`

Add to the existing `TimerControls` describe block. Use the existing `renderWithTimer` helper (wraps in `TimerProvider`).

**New describe block:** `time input`

#### Item 2-A-1 — Typing in the minutes input calls the handler

```ts
it('updates the timer when a value is typed in the minutes input', async () => {
  const user = userEvent.setup()
  renderWithTimer()
  const minutesInput = screen.getByRole('textbox', { name: 'Minutes' })
  await user.click(minutesInput)         // triggers onFocus (handleFocus)
  await user.clear(minutesInput)
  await user.type(minutesInput, '02')    // triggers onChange (handleInputChange, minutes field)
  await user.tab()                       // triggers onBlur (handleBlur, minutes field)
  expect(minutesInput).toHaveValue('02')
})
```

**Covers:** lines 81–83 (`onFocus`, `onChange`, `onBlur` arrow functions for minutes input), lines 24–28 (`handleFocus`), lines 30–34 (`handleInputChange` minutes branch), lines 38–41 (`handleBlur` minutes branch)

---

#### Item 2-A-2 — Typing in the seconds input covers the `seconds` field path

```ts
it('updates the timer when a value is typed in the seconds input', async () => {
  const user = userEvent.setup()
  renderWithTimer()
  const secondsInput = screen.getByRole('textbox', { name: 'Seconds' })
  await user.click(secondsInput)         // triggers onFocus (seconds field)
  await user.clear(secondsInput)
  await user.type(secondsInput, '30')    // triggers onChange (handleInputChange, seconds branch)
  await user.tab()                       // triggers onBlur (handleBlur, seconds branch)
  expect(secondsInput).toHaveValue('30')
})
```

**Covers:** lines 94–96 (`onFocus`, `onChange`, `onBlur` arrow functions for seconds input), line 35 (`else handleTimeChange(minutes, val)` in `handleInputChange`), line 42 (`else handleTimeChange(minutes, val)` in `handleBlur`)

---

## Section 3 — Header.tsx

**Test file:** `src/components/Header/Header.test.tsx`

All items use the same render wrapper as existing Header tests (MemoryRouter + TimerProvider).

#### Item 3-A-1 — Clicking the Timer menu item opens the timer panel

**New describe block:** `timer panel`

```ts
it('shows the timer controls when the Timer menu item is clicked', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><TimerProvider><Header /></TimerProvider></MemoryRouter>)
  await user.click(screen.getByText('Timer'))
  expect(screen.getByRole('textbox', { name: 'Minutes' })).toBeInTheDocument()
})
```

**Covers:** lines 42–44 (Timer menu button `onClick`: `setTimerAnchorRect`, `setTimerVisible` toggle)

**Note:** PrimeReact Menubar renders the custom template inside the menu. If `getByText('Timer')` matches multiple elements (e.g., label + button text), scope with `within(screen.getByRole('navigation')).getByText('Timer')` or use a more specific selector.

---

#### Item 3-A-2 — Sidebar closes when dismissed via Escape

Add to the existing **`sidebar`** describe block.

```ts
it('hides the sidebar nav links when the sidebar is dismissed via Escape', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><TimerProvider><Header /></TimerProvider></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('button', { name: 'Home' })).not.toBeInTheDocument()
})
```

**Covers:** line 74 (Sidebar `onHide` arrow function: `() => setSidebarVisible(false)`)

**Note:** PrimeReact Sidebar fires `onHide` on Escape. If Escape doesn't dismiss it in jsdom, alternative: click the Sidebar close button `screen.getByRole('button', { name: 'Close' })` after opening.

---

### Skipped items — Header.tsx

| Lines | Reason |
|---|---|
| 33 (Tools → Fretboard submenu) | PrimeReact Menubar nested submenu requires hover to open; not reliably testable in jsdom |
| 110 (Timer `onHide`) | Timer component is a positioned overlay; its `onHide` wiring is an integration concern, not unit-testable here |

---

## Section 4 — SidebarControls.tsx

**Test file:** `src/components/SidebarControls/SidebarControls.test.tsx`

Use the same render helper as existing tests (MemoryRouter with `initialEntries` + ControlsProvider).

#### Item 4-A-1 — Selecting a different scale from the Dropdown calls `setDisplayedScales`

Add to the existing **`/scales route`** describe block.

```ts
it('updates the displayed scale when a different option is selected from the Dropdown', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/scales']}>
      <ControlsProvider>
        <SidebarControls />
      </ControlsProvider>
    </MemoryRouter>
  )
  await user.click(screen.getByRole('combobox'))
  await user.click(screen.getByRole('option', { name: 'Minor' }))
  // The combobox now reflects the new value — PrimeReact Dropdown updates its display label
  expect(screen.getByRole('combobox')).toBeInTheDocument()
})
```

**Covers:** line 50 (Scale Dropdown `onChange` arrow function)

---

#### Item 4-B-1 — Selecting a different interval from the Dropdown calls `setInterval`

Add to the existing **`/intervals route`** describe block.

```ts
it('updates the interval when a different option is selected from the Dropdown', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/intervals']}>
      <ControlsProvider>
        <SidebarControls />
      </ControlsProvider>
    </MemoryRouter>
  )
  // First combobox in the intervals route is the Interval dropdown
  await user.click(screen.getAllByRole('combobox')[0])
  await user.click(screen.getByRole('option', { name: '5th' }))
  expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
})
```

**Covers:** line 74 (Interval Dropdown `onChange` arrow function)

---

### ColorPicker onChange handlers — via mocked ColorPicker

**File-level setup:** Add the following `vi.mock` to `SidebarControls.test.tsx`. Because the `/scales` route renders 1 ColorPicker and the `/intervals` route renders 3, the mock renders a `<button>` labeled by its position in the DOM. Tests scope using `within` on the group's parent element.

```ts
vi.mock('primereact/colorpicker', () => ({
  ColorPicker: ({ onChange }: { onChange?: (e: { value: string }) => void }) => (
    <button onClick={() => onChange?.({ value: 'ff0000' })}>Pick Color</button>
  ),
}))
```

Add `import { useControls } from '../../contexts/ControlsContext'` to the test file imports.

---

#### Item 4-C-1 — `/scales` route: Note Color picker updates `scaleNoteColor` in context

Add to the existing **`/scales route`** describe block.

```ts
it('updates scaleNoteColor in context when the Note Color picker fires onChange', async () => {
  const user = userEvent.setup()
  const Consumer = () => {
    const { scaleNoteColor } = useControls()
    return <span data-testid="scale-color">{scaleNoteColor as string}</span>
  }
  render(
    <MemoryRouter initialEntries={['/scales']}>
      <ControlsProvider>
        <SidebarControls />
        <Consumer />
      </ControlsProvider>
    </MemoryRouter>
  )
  await user.click(screen.getByRole('button', { name: 'Pick Color' }))
  expect(screen.getByTestId('scale-color')).toHaveTextContent('#ff0000')
})
```

**Covers:** line 59 (Note Color ColorPicker `onChange`)

---

#### Item 4-C-2 — `/intervals` route: Root color picker updates `intervalColors.root` in context

Add to the existing **`/intervals route`** describe block.

```ts
it('updates the root interval color in context when the Root picker fires onChange', async () => {
  const user = userEvent.setup()
  const Consumer = () => {
    const { intervalColors } = useControls()
    return <span data-testid="root-color">{intervalColors.root.color as string}</span>
  }
  render(
    <MemoryRouter initialEntries={['/intervals']}>
      <ControlsProvider>
        <SidebarControls />
        <Consumer />
      </ControlsProvider>
    </MemoryRouter>
  )
  const rootGroup = screen.getByText('Root').closest<HTMLElement>('.sidebar-controls__group')!
  await user.click(within(rootGroup).getByRole('button', { name: 'Pick Color' }))
  expect(screen.getByTestId('root-color')).toHaveTextContent('#ff0000')
})
```

**Covers:** line 83 (Root ColorPicker `onChange`)

---

#### Item 4-C-3 — `/intervals` route: Interval color picker updates `intervalColors.interval` in context

```ts
it('updates the interval color in context when the Interval picker fires onChange', async () => {
  const user = userEvent.setup()
  const Consumer = () => {
    const { intervalColors } = useControls()
    return <span data-testid="interval-color">{intervalColors.interval.color as string}</span>
  }
  render(
    <MemoryRouter initialEntries={['/intervals']}>
      <ControlsProvider>
        <SidebarControls />
        <Consumer />
      </ControlsProvider>
    </MemoryRouter>
  )
  // There are two elements with the text "Interval" — the section header and the color group label
  // Scope to the color group (second one)
  const intervalGroups = screen.getAllByText('Interval')
  const intervalGroup = intervalGroups[intervalGroups.length - 1].closest<HTMLElement>('.sidebar-controls__group')!
  await user.click(within(intervalGroup).getByRole('button', { name: 'Pick Color' }))
  expect(screen.getByTestId('interval-color')).toHaveTextContent('#ff0000')
})
```

**Covers:** line 90 (Interval ColorPicker `onChange`)

---

#### Item 4-C-4 — `/intervals` route: Unison color picker updates `intervalColors.unison` in context

```ts
it('updates the unison color in context when the Unison picker fires onChange', async () => {
  const user = userEvent.setup()
  const Consumer = () => {
    const { intervalColors } = useControls()
    return <span data-testid="unison-color">{intervalColors.unison.color as string}</span>
  }
  render(
    <MemoryRouter initialEntries={['/intervals']}>
      <ControlsProvider>
        <SidebarControls />
        <Consumer />
      </ControlsProvider>
    </MemoryRouter>
  )
  const unisonGroup = screen.getByText('Unison').closest<HTMLElement>('.sidebar-controls__group')!
  await user.click(within(unisonGroup).getByRole('button', { name: 'Pick Color' }))
  expect(screen.getByTestId('unison-color')).toHaveTextContent('#ff0000')
})
```

**Covers:** line 97 (Unison ColorPicker `onChange`)

---

## Section 5 — MetronomePage.tsx

**Test file:** `src/components/Metronome/Metronome.test.tsx`

Add to the existing `MetronomePage` describe block.

**New describe block:** `control interactions`

#### Item 5-A-1 — Changing the Subdivision dropdown updates state

```ts
it('updates the subdivision when a different option is selected', async () => {
  const user = userEvent.setup()
  render(<MetronomePage />)
  // First combobox is the Subdivision dropdown
  await user.click(screen.getAllByRole('combobox')[0])
  await user.click(screen.getByRole('option', { name: /eighth/i }))
  expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
})
```

**Covers:** lines 49–51 (Subdivision Dropdown `onChange` body)

**Note:** Check the actual option label from `subdivisions` data set in `src/helpers/dataSets.ts` — the option text for eighth notes may differ. Use a regex that matches part of the label.

---

#### Item 5-A-2 — Changing the Time Signature dropdown updates state

```ts
it('updates the time signature when a different option is selected', async () => {
  const user = userEvent.setup()
  render(<MetronomePage />)
  // Second combobox is the Time Signature dropdown
  await user.click(screen.getAllByRole('combobox')[1])
  await user.click(screen.getByRole('option', { name: '3/4' }))
  expect(screen.getAllByRole('combobox')[1]).toBeInTheDocument()
})
```

**Covers:** lines 64–66 (Time Signature Dropdown `onChange` body)

**Note:** Check actual option values from `timeSignatures` in `src/helpers/dataSets.ts`. Use a label that exists in that array.

---

#### Item 5-A-3 — Interacting with the volume slider fires onChange

PrimeReact Slider exposes `role="slider"` and responds to ArrowRight/ArrowLeft key events.

```ts
it('updates the volume when the slider value changes', () => {
  render(<MetronomePage />)
  const slider = screen.getByRole('slider')
  fireEvent.keyDown(slider, { key: 'ArrowRight' })
  expect(slider).toBeInTheDocument()
})
```

**Covers:** line 78 (Slider `onChange` arrow function)

---

## Section 6 — fretpoints.tsx

**Test file:** `src/helpers/fretpoints.test.ts` — create this file if it does not exist.

These are pure functions — no DOM rendering needed.

```ts
import { describe, it, expect } from 'vitest'
import { createScale, createInterval } from './fretpoints'
```

---

#### Item 6-A-1 — createScale: phrygian returns 12 coords

```ts
it('returns 12 coords for the phrygian scale', () => {
  expect(createScale({ scaleType: 'phrygian', noteColor: '#ff0000' })).toHaveLength(12)
})
```

**Covers:** lines 33–39 (phrygian case in `determineScale`)

---

#### Item 6-A-2 — createScale: lydian returns 12 coords

```ts
it('returns 12 coords for the lydian scale', () => {
  expect(createScale({ scaleType: 'lydian', noteColor: '#ff0000' })).toHaveLength(12)
})
```

**Covers:** lines 40–46 (lydian case)

---

#### Item 6-A-3 — createScale: mixolydian returns 12 coords

```ts
it('returns 12 coords for the mixolydian scale', () => {
  expect(createScale({ scaleType: 'mixolydian', noteColor: '#ff0000' })).toHaveLength(12)
})
```

**Covers:** lines 47–53 (mixolydian case)

---

#### Item 6-B-1 — createInterval: interval 5 uses unisonString case 5/6

`unisonString(5)` returns 3. `intervalString(5)` returns 2.

```ts
it('returns 3 coords for interval 5 with correct string positions', () => {
  const result = createInterval({ interval: 5, colors: { root: 'red', interval: 'blue', unison: 'green' } })
  expect(result).toHaveLength(3)
  expect(result[2].string).toBe(3) // unisonString(5) = 3
})
```

**Covers:** lines 109–110 (interval 5 in `rootPosition`), lines 129–130 (case 5/6 in `intervalString`), lines 147–148 (case 5/6 in `unisonString`)

---

#### Item 6-B-2 — createInterval: interval 6 uses unisonString case 6

```ts
it('returns 3 coords for interval 6 with correct string positions', () => {
  const result = createInterval({ interval: 6, colors: { root: 'red', interval: 'blue', unison: 'green' } })
  expect(result).toHaveLength(3)
  expect(result[2].string).toBe(3) // unisonString(6) = 3
})
```

**Covers:** lines 111–112 (interval 6 in `rootPosition`), line 148 (case 6 fallthrough in `unisonString`)

---

#### Item 6-B-3 — createInterval: interval 7 non-flat uses the non-flat branches

`intervalString(7, false)` = 3. `unisonString(7, false)` = 4.

```ts
it('returns correct string positions for interval 7 non-flat', () => {
  const result = createInterval({ interval: 7, colors: { root: 'red', interval: 'blue', unison: 'green' } })
  expect(result[1].string).toBe(3) // intervalString(7, flat=false) = 3
  expect(result[2].string).toBe(4) // unisonString(7, flat=false) = 4
})
```

**Covers:** lines 113–114 (interval 7 in `rootPosition`), non-flat branch of line 132 (`intervalString`), non-flat branch of line 150 (`unisonString`)

---

#### Item 6-B-4 — createInterval: interval 7 flat uses the flat branches

`intervalString(7, true)` = 2. `unisonString(7, true)` = 3.

```ts
it('returns correct string positions for interval 7 flat', () => {
  const result = createInterval({ interval: 7, flat: true, colors: { root: 'red', interval: 'blue', unison: 'green' } })
  expect(result[1].string).toBe(2) // intervalString(7, flat=true) = 2
  expect(result[2].string).toBe(3) // unisonString(7, flat=true) = 3
})
```

**Covers:** flat branch of line 132 (`intervalString`), flat branch of line 150 (`unisonString`)

---

#### Item 6-B-5 — createInterval: unison=false returns only 2 coords

```ts
it('returns 2 coords when unison is false', () => {
  const result = createInterval({
    interval: 2,
    unison: false,
    colors: { root: 'red', interval: 'blue', unison: 'green' },
  })
  expect(result).toHaveLength(2)
})
```

**Covers:** line 164–165 (`unison ? [unisonNote] : []` false branch)

---

### Skipped items — fretpoints.tsx

| Lines | Reason |
|---|---|
| 118, 136, 154 (`default` cases in switch statements) | Unreachable with valid interval inputs (2–8) — TypeScript type system prevents invalid values at call sites |

---

## Section 7 — TimerContext.tsx

**Test file:** `src/components/Timer/Timer.test.tsx`

Add a new top-level **`TimerContext`** describe block (not inside `TimerControls`).

Both items use a small inline consumer component to access context functions.

#### Item 7-A-1 — `restart` sets status back to running after a pause

```ts
describe('TimerContext', () => {
  it('restart sets status to running after pausing', async () => {
    const user = userEvent.setup()
    const TestConsumer = () => {
      const { start, pause, restart, status } = useTimer()
      return (
        <>
          <button onClick={start}>Start</button>
          <button onClick={pause}>Pause</button>
          <button onClick={restart}>Restart</button>
          <span data-testid='status'>{status}</span>
        </>
      )
    }
    render(<TimerProvider><TestConsumer /></TimerProvider>)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: 'Restart' }))
    expect(screen.getByTestId('status')).toHaveTextContent('running')
  })
```

**Covers:** lines 57–61 (`restart` function body)

**Note:** `useTimer` and `TimerProvider` must be imported at the top of the test file. They are likely already imported.

---

#### Item 7-A-2 — Running timer decrements display over time

```ts
  it('decrements the displayed time while running', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const TestConsumer = () => {
      const { start, setDuration, formattedTime } = useTimer()
      return (
        <>
          <button onClick={() => { setDuration(60); start() }}>Go</button>
          <span data-testid='time'>{formattedTime}</span>
        </>
      )
    }
    render(<TimerProvider><TestConsumer /></TimerProvider>)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    act(() => { vi.advanceTimersByTime(1100) })
    expect(screen.getByTestId('time').textContent).not.toBe('01:00')
    vi.useRealTimers()
  })
})
```

**Covers:** lines 34–38 (setInterval callback body: elapsed calculation and `setDisplayMs` call)

**Note:** Import `act` from `@testing-library/react` if not already imported.

---

## Step 3 — Proposed New Rules for TESTING_STRATEGY.md

The following rules address patterns that allowed coverage gaps to accumulate. Add these to `_dev/TESTING_STRATEGY.md` after review and approval.

---

### Proposed Rule A — Input interaction coverage

> **Time and text inputs must be tested with focus, type, and blur.**
> Any component that renders `<input>` elements with `onFocus`, `onChange`, and `onBlur` handlers must have at least one test that triggers all three events in sequence using `userEvent` (click to focus → type → tab/click away to blur). Testing only the rendered value is insufficient.

**Motivation:** `TimerControls.tsx` had three input event handlers at 0% coverage because tests only read initial values and never interacted with the inputs.

---

### Proposed Rule B — PrimeReact Dropdown interactions are testable; ColorPicker is not

> **Dropdown `onChange` handlers must be tested by clicking the combobox and selecting an option.** PrimeReact Dropdown renders overlay options with `role="option"` — these are accessible and testable.
>
> **ColorPicker `onChange` handlers are exempt** from the coverage requirement. PrimeReact ColorPicker exposes no accessible interface for its color-picking surface. Document any untested ColorPicker handlers in the file's SKIP table (see Section 8 of this plan for the format).

**Motivation:** `SidebarControls.tsx` had Dropdown `onChange` at 0% coverage alongside ColorPicker `onChange` at 0% coverage — the former is testable, the latter is not, and this distinction needs to be explicit.

---

### Proposed Rule C — Pure functions in helpers must be tested for all code paths

> Every exported function in `src/helpers/` must have tests that exercise **every reachable branch**. For switch statements, test each `case` that is reachable with valid inputs. `default` branches that are unreachable via TypeScript-constrained inputs are explicitly exempt — document them in the SKIP table.

**Motivation:** `fretpoints.tsx` had functions called (100% function coverage) but 45% branch coverage because component tests only used a subset of input values. A dedicated helper test file with explicit input/output tests for each branch eliminates this gap.

---

### Proposed Rule D — Context functions must be tested directly

> Every function exposed from a React context must have at least one test that calls it directly through a consumer component. Testing that a UI button calls `start()` is not sufficient if `restart()`, `stop()`, or other context functions are never exercised.
>
> Use an inline `TestConsumer` component inside the test body to access and call context functions:
> ```tsx
> const TestConsumer = () => {
>   const { restart } = useTimer()
>   return <button onClick={restart}>Restart</button>
> }
> render(<TimerProvider><TestConsumer /></TimerProvider>)
> ```

**Motivation:** `TimerContext.tsx` had `restart` at 0% coverage because no component under test ever called it, even though it was exposed in the context value.

---

*End of TEST_REINFORCEMENT_PLAN.md*
