# Testing Reports

Failure reports generated after test runs that produce failures. Organized by component and linked to fix plans in [FIX_PLANS.md](./FIX_PLANS.md).

See [`_dev/TESTING_STRATEGY.md`](../_dev/TESTING_STRATEGY.md) for the full reporting spec.

> A report is not required if no tests fail.

---

## SKIP — MetronomePage.tsx: Dropdown onChange handlers (5-A-1, 5-A-2)

**Date:** 2026-04-30
**File:** `src/components/Metronome/Metronome.test.tsx`

### Tests skipped

- `5-A-1` — "updates the subdivision when a different option is selected"
- `5-A-2` — "updates the time signature when a different option is selected"

### Root cause

Same as SidebarControls 4-A-1/4-B-1: PrimeReact Dropdown `pointer-events: none` on the combobox in jsdom.

### Lines not covered

- `MetronomePage.tsx` lines 49–51 (Subdivision Dropdown `onChange` body), lines 64–66 (Time Signature Dropdown `onChange` body)

### Fix plan

Same mock pattern as [FIX_PLANS.md — PrimeReact Dropdown mock pattern](./FIX_PLANS.md#primereact-dropdown-mock-pattern).

---

## SKIP — SidebarControls.tsx: Dropdown onChange handlers (4-A-1, 4-B-1)

**Date:** 2026-04-30
**File:** `src/components/SidebarControls/SidebarControls.test.tsx`

### Tests skipped

- `4-A-1` — "updates the displayed scale when a different option is selected from the Dropdown"
- `4-B-1` — "updates the interval when a different option is selected from the Dropdown"

### Root cause

PrimeReact Dropdown (v10) renders a hidden native `<select role="combobox">` with `pointer-events: none`. `userEvent.click` throws `Unable to perform pointer interaction as the element has pointer-events: none`. Switching to `fireEvent.click` avoids the throw but the overlay options never appear (same root issue as CustomFretboard 1-C-1/1-C-2).

### Lines not covered

- `SidebarControls.tsx` line 50 (Scale Dropdown `onChange`), line 74 (Interval Dropdown `onChange`)

### Fix plan

Same as CustomFretboard: mock `primereact/dropdown` with a native `<select>` in the test file. See [FIX_PLANS.md — PrimeReact Dropdown mock pattern](./FIX_PLANS.md#primereact-dropdown-mock-pattern).

---

## SKIP — Header.tsx: Timer panel (3-A-1)

**Date:** 2026-04-30
**File:** `src/components/Header/Header.test.tsx`

### Test skipped

- `3-A-1` — "shows the timer controls when the Timer menu item is clicked"

### Root cause

`Timer` and `TimerControls` are both mocked to `() => null` in `Header.test.tsx`. Clicking the Timer menu button toggles `timerVisible` state, but since `Timer` renders null, `screen.getByRole('textbox', { name: 'Minutes' })` is never present. The test cannot pass without either removing the mocks (which would introduce real Timer/TimerControls rendering and risk regressions) or restructuring the test file.

### Lines not covered

- `Header.tsx` lines 42–44 (Timer menu button `onClick`: `setTimerAnchorRect`, `setTimerVisible` toggle)

### Fix plan

See [FIX_PLANS.md — Header timer panel](./FIX_PLANS.md#header-timer-panel)

---

## SKIP — CustomFretboard.tsx: Preset Management (1-C-1, 1-C-2)

**Date:** 2026-04-30
**File:** `src/components/CustomFretboardEditor/CustomFretboard.test.tsx`

### Tests skipped

- `1-C-1` — "calls getById with the selected preset id when Load is clicked"
- `1-C-2` — "calls deleteById with the selected preset id when Delete is clicked"

### Root cause

PrimeReact `Dropdown` (v10) does not render option items with `role="option"` in jsdom, and its `onChange` handler is not triggered by any of the following:

1. `fireEvent.click` on the `.p-dropdown` container + `screen.getByRole('option', { name: ... })` — options never appear
2. `fireEvent.click` + `fireEvent.keyDown(dropdownEl, { key: 'ArrowDown' })` — same result
3. `fireEvent.change` on the hidden native `<select>` inside `.p-dropdown` — event fires but does not call the Dropdown's React `onChange` prop (PrimeReact Dropdown controls its own internal select; the hidden `<select>` is not a controlled input)

The `selectedPresetId` state never updates, so the Load/Delete buttons remain disabled and the service calls are never made.

### Lines not covered

- `CustomFretboard.tsx` lines 263–267 (`handleLoadPreset`), 271–273 (`handleDeletePreset`), 333 (`presets.map`), 407 (Dropdown `onChange`), 416 (Load button `onClick`), 423 (Delete preset button `onClick`)

### Fix plan

See [FIX_PLANS.md — CustomFretboard preset management](./FIX_PLANS.md#customfretboard-preset-management)

---

## SKIP — Intervals.tsx: intervalSuffix case 1 branch (2-H)

**Date:** 2026-05-01
**File:** `src/components/Intervals/Intervals.test.tsx`

### Test skipped

- `2-H` — `intervalSuffix(1)` returning `"st"` is unreachable via the UI

### Root cause

`intervalSuffix` is a local (non-exported) function inside `Intervals.tsx`. Its `case 1` (`"st"`) branch is unreachable because the `SelectButton` options only offer values 2–8. The `interval` context state is initialized to `2` and can only be set to `2 | 3 | 4 | 5 | 6 | 7 | 8` via the UI. There is no way to pass `1` without exporting the function or manipulating context internals.

### Lines not covered

- `Intervals.tsx` line 31 (`case 1: return "st"`)

### Fix plan

No fix required — this is an unreachable branch within the TypeScript-enforced interval range. Document as permanently skipped.
