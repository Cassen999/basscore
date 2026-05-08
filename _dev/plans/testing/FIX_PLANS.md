# Fix Plans

Fix plans for all recorded test failures. Organized by component and linked back to reports in [TESTING_REPORTS.md](./TESTING_REPORTS.md).

See [`_dev/TESTING_STRATEGY.md`](../_dev/TESTING_STRATEGY.md) for the full fix plan spec.

---

## PrimeReact Dropdown mock pattern

**Reports:** [SidebarControls 4-A-1/4-B-1](./TESTING_REPORTS.md#skip--sidebarcontrolstsx-dropdown-onchange-handlers-4-a-1-4-b-1), [CustomFretboard 1-C-1/1-C-2](./TESTING_REPORTS.md#skip--customfretboardtsx-preset-management-1-c-1-1-c-2)

### Problem

PrimeReact Dropdown (v10) cannot be interacted with in jsdom: the hidden native `<select role="combobox">` has `pointer-events: none`, and the overlay panel options never render accessibly. This affects `SidebarControls` (Scale/Interval dropdowns) and `CustomFretboard` (Presets dropdown).

### Fix

Add the following mock to each affected test file. It replaces Dropdown with a native `<select>` that fires `onChange` directly:

```ts
vi.mock('primereact/dropdown', () => ({
  Dropdown: ({
    value,
    options,
    onChange,
    optionLabel = 'label',
  }: {
    value: unknown
    options: Record<string, unknown>[]
    onChange: (e: { value: unknown }) => void
    optionLabel?: string
  }) => (
    <select
      value={String(value ?? '')}
      onChange={e => {
        const opt = options.find(o => String(o.value) === e.target.value)
        if (opt) onChange({ value: opt.value })
      }}
    >
      {(options ?? []).map(o => (
        <option key={String(o.value)} value={String(o.value)}>
          {String(o[optionLabel])}
        </option>
      ))}
    </select>
  ),
}))
```

Then tests can `fireEvent.change` on `screen.getByRole('combobox')` with `{ target: { value: 'minor' } }`.

---

## Header timer panel

**Report:** [TESTING_REPORTS.md — SKIP Header timer panel](./TESTING_REPORTS.md#skip--headertsx-timer-panel-3-a-1)

### Problem

`Timer` and `TimerControls` are mocked to `null` in `Header.test.tsx` to keep the test scope narrow. This prevents verifying that the Timer menu button's `onClick` actually shows the timer controls.

### Options

1. **Create a separate `Header.timer.test.tsx`** without the `Timer`/`TimerControls` mocks, test only the timer panel visibility toggle there. Risk: real `Timer`/`TimerControls` components introduce additional render complexity.
2. **Spy on `setTimerVisible`** — not straightforward with functional components and `useState`.
3. **Test via the Sidebar's Panel** — `TimerControls` is also rendered in the Sidebar panel. Removing the `TimerControls` mock and opening the sidebar's Timer panel would cover the same state path.

### Recommendation

Option 3: remove the `TimerControls` mock, open the sidebar's Timer panel, and check that `screen.getByRole('textbox', { name: 'Minutes' })` is present. This is a lower-risk path since it doesn't require real `Timer` overlay logic.

---

## CustomFretboard preset management

**Report:** [TESTING_REPORTS.md — SKIP CustomFretboard preset management](./TESTING_REPORTS.md#skip--customfretboardtsx-preset-management-1-c-1-1-c-2)

### Problem

PrimeReact Dropdown's `onChange` cannot be triggered programmatically in jsdom. The Presets Dropdown's `onChange` is the only way to set `selectedPresetId`, which gates the Load and Delete buttons.

### Options

1. **Extract `selectedPresetId` to a prop or ref and call the handler directly** — pass a `testId` prop or expose the setter via `useImperativeHandle` so tests can set it without going through the Dropdown UI.
2. **Refactor the preset Dropdown to a plain HTML `<select>`** — a native `<select>` controlled by React state is fully testable with `fireEvent.change`. Trade-off: lose PrimeReact styling.
3. **Integration test via Playwright/Cypress** — browser-based tests can click PrimeReact Dropdown options natively. This is the cleanest long-term solution if PrimeReact components are not going to be swapped.
4. **Mock the Dropdown the same way ColorPicker is mocked** — add a `vi.mock('primereact/dropdown', ...)` at the top of `CustomFretboard.test.tsx` that renders a `<select>` firing `onChange({ value })`. This would make the tests work in jsdom without changing production code.

### Recommendation

Option 4 (mock the Dropdown in the test file) is the lowest-effort fix: it doesn't touch production code and makes the tests deterministic. The same mock pattern is already used for `primereact/colorpicker` in this file.

### Implementation (when approved)

```ts
vi.mock('primereact/dropdown', () => ({
  Dropdown: ({
    value,
    options,
    onChange,
    placeholder,
  }: {
    value: string
    options: { label: string; value: string }[]
    onChange: (e: { value: string }) => void
    placeholder?: string
  }) => (
    <select
      value={value ?? ''}
      aria-label={placeholder}
      onChange={e => onChange({ value: e.target.value })}
    >
      {(options ?? []).map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}))
```

Then tests can use `fireEvent.change(presetsGroup.querySelector('select')!, { target: { value: 'preset-1' } })` reliably.

**Note:** Adding this mock will affect any other Dropdown rendered by `CustomFretboard`. Verify that existing tests still pass after adding it.
