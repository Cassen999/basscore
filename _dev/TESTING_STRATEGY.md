# Testing Strategy

This is the authoritative reference for all testing in BASSCORE. Read this before writing, running, or reviewing tests.

---

## Overview

BASSCORE uses **Vitest** and **React Testing Library** for unit and component-level tests. Integration tests are permitted when multiple components interact to deliver a feature. End-to-end testing is out of scope.

Tests must focus on **user-observable behavior**, not internal implementation details.

---

## Minimum Coverage Thresholds

Coverage is enforced globally and must not be inflated with trivial or redundant tests.

| Metric | Threshold |
|---|---|
| Lines | 90% |
| Branches | 85% |
| Functions | 90% |
| Statements | 90% |

---

## Tools

| Tool | Purpose |
|---|---|
| [Vitest](https://vitest.dev) | Test runner and coverage |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | Component rendering and querying |
| [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) | User interaction simulation |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | DOM assertion matchers |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | V8-based coverage reporting |

Setup file: `src/test/setup.ts`

---

## Running Tests

```bash
npm test              # Watch mode (development)
npm run test:run      # Single run (CI / before commit)
npm run test:coverage # Single run with coverage report
```

Always run `npm run test:run` before committing. If tests fail, do not commit.

---

## File Organization

- Test files are **colocated with the component** they test
- Naming convention: `<ComponentName>.test.tsx`

**Example:**
```
src/components/Fretboard/
├── Fretboard.tsx
└── Fretboard.test.tsx
```

---

## Test Structure

Follow the **Arrange / Act / Assert** pattern. Group tests with `describe` blocks by feature or behavior. Use clear, human-readable test names.

```tsx
describe('ComponentName', () => {
  describe('feature or behavior', () => {
    it('does something observable', async () => {
      // Arrange
      render(<ComponentName />)

      // Act
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Assert
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })
})
```

---

## Query Priority

Use queries in this order — stop at the first one that applies:

1. `getByRole` (preferred)
2. `getByLabelText`
3. `getByText`
4. `getByPlaceholderText`
5. `getByTestId` (last resort — requires adding `data-testid` to the component)

---

## What to Test

### User Interactions
All meaningful interactions that affect state or navigation:
- Clicks that trigger state changes or navigation
- Form inputs that update application state
- Keyboard interactions where applicable

Do not test interactions that have no observable effect on the UI or state.

### Keyboard Shortcuts and Window-Level Event Handlers
When a component registers a `window.addEventListener` (keyboard shortcuts, click-outside deselect, global hotkeys), at least one test must fire that event using `fireEvent` on `window` or `document`. Do not skip these on the grounds that they are "hard to trigger" — they represent real user behavior and are straightforward to test with `fireEvent.keyDown(window, { key: 'z', ctrlKey: true })`.

### Dialog Flows
When a component contains a dialog, tests must cover the full flow — not just opening it. This includes: submitting the form inside the dialog, cancelling, and any conditional state visible inside the dialog (e.g. overwrite warnings). Opening the dialog is not sufficient coverage on its own.

### Helper and Service Files
Every file in `src/helpers/` and `src/services/` must have a colocated `.test.ts` file. Each exported function must be tested directly with explicit inputs and expected outputs. These are typically pure functions — do not rely on component tests to exercise them indirectly.

### Render Tests
Every page must include render tests verifying:
- Interactive elements (buttons, inputs, links)
- Key content (labels, headings, dynamic text)
- Conditional rendering states (loading, empty, error)

Do not test structural or stylistic elements (div wrappers, CSS classes).

### Routing Tests
- Navigation to the correct route
- Correct component renders after navigation
- Behavior of conditional routes (if applicable)

### Edge Cases
Where applicable:
- Empty data states
- Invalid inputs
- Error handling paths

---

## What NOT to Test

- **PrimeReact component internals** — do not test that a PrimeReact `InputText` accepts keystrokes or updates its own internal state. Only test that the correct local state updates when the component captures input.
- **React internals** — do not mock `useState`, `useEffect`, or other React hooks. Mock only external dependencies and services.
- Structural or stylistic elements with no user-observable behavior.
- Trivial pass-through renders with no logic.

---

## Mocking Strategy

- Mock at the **network/service boundary** (API calls, localStorage services)
- Do not mock the component under test
- Do not over-mock internal logic
- Use `vi.mock()` for module mocks, `vi.fn()` for function mocks
- Call `vi.clearAllMocks()` in `beforeEach` when mocks are present

---

## User Interaction Simulation

Use `userEvent` for all interactions. Avoid `fireEvent` unless `userEvent` is not viable.

```tsx
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /start/i }))
```

---

## Async Testing

All external data fetching (APIs, services) must be mocked. Tests must cover:
- Successful responses
- Loading states
- Error states

Use `waitFor` or `findBy*` queries for async assertions.

---

## Test Isolation

- Each test must be independent — no shared mutable state between tests
- Use `beforeEach` / `afterEach` for setup and teardown
- Call `vi.clearAllMocks()` in `beforeEach` when mocks are used

---

## Flaky Tests

If a failure is inconsistent or non-deterministic:
1. Attempt to reproduce it
2. Do not log a report until the failure is confirmed
3. Investigate potential causes: async timing, improper mocks, shared state

---

## Reporting

Run tests with `npm run test:run`. Generate reports immediately after any run that produces failures.

> **A report is not required if no tests fail.**

Reports live in `testing/TESTING_REPORTS.md`. Fix plans live in `testing/FIX_PLANS.md`.

### Failure IDs

Each failure gets a unique ID: `TEST-YYYYMMDD-XXX`
- `YYYYMMDD` = date of the failing run
- `XXX` = sequential number starting at `001`; increment for multiple failures on the same day

### TESTING_REPORTS.md Entry

Organized by component. Each entry must include:

```markdown
#### TEST-YYYYMMDD-XXX
- Component: ComponentName.tsx
- File: src/components/ComponentName/ComponentName.test.tsx
- Description: What the test does and why it failed
- Date: YYYY-MM-DD
- Severity: [0–5]
- Fix Plan: [FIX_PLANS.md#test-yyyymmdd-xxx](./FIX_PLANS.md#test-yyyymmdd-xxx)
```

**Severity scale:**
| Score | Meaning |
|---|---|
| 5 | App crash, blocked navigation, broken core feature |
| 4 | Major feature malfunction with workaround |
| 3 | Incorrect UI behavior affecting UX |
| 2 | Minor UI inconsistency |
| 1 | Edge case bug |
| 0 | Test-only issue, no user impact |

### FIX_PLANS.md Entry

Organized by component. Each entry must include:
- Link back to the report in `TESTING_REPORTS.md`
- Whether the fix targets the **component/page** or the **test** (prefer fixing the component first)
- Step-by-step explanation of the fix
- Reasoning if the test itself must change instead of the component
- Confirmation that functionality and styles are preserved; document any required change to functionality

Plans must be detailed enough to implement with no additional input.

---

## Implementing Fix Plans

1. Only implement a fix plan when explicitly instructed
2. Carry out only what the plan specifies
3. If anything discovered during implementation requires deviating from the plan: **stop, notify the user, update the plan**
4. After implementing:
   - Run `npm run test:run`
   - Run `npm run build`
   - Both must pass with no errors
   - If the test still fails after implementation, write a new description and plan

---

## After a Successful Fix

1. Update both the report entry and the fix plan entry to designate them as **FIXED**
2. Include the branch name where the fix was applied

---

## Definition of Done

A testing task is complete when:
1. All tests pass
2. Coverage thresholds are met — run `npm run test:coverage` (not just `test:run`) before closing any testing task. If the file under test has statement or branch coverage below the global threshold, add tests before moving on.
3. No new test failures are introduced
4. `testing/TESTING_REPORTS.md` and `testing/FIX_PLANS.md` are up to date

---

## PrimeReact Testing Patterns

### Rule A — Input interaction coverage

Time and text inputs must be tested with focus, type, and blur.

Any component that renders `<input>` elements with `onFocus`, `onChange`, and `onBlur` handlers must have at least one test that triggers all three events in sequence using `userEvent` (click to focus → type → tab/click away to blur). Testing only the rendered value is insufficient.

**Motivation:** `TimerControls.tsx` had three input event handlers at 0% coverage because tests only read initial values and never interacted with the inputs.

---

### Rule B — PrimeReact Dropdown interactions are testable; ColorPicker is not

**Dropdown `onChange` handlers must be tested by clicking the combobox and selecting an option.** PrimeReact Dropdown renders overlay options with `role="option"` — these are accessible and testable.

However, PrimeReact Dropdown `pointer-events: none` in jsdom blocks `userEvent.click`. Use a file-level `vi.mock('primereact/dropdown', ...)` that renders a native `<select>` element, then interact with it via `fireEvent.change`. See `Metronome.test.tsx` for the canonical mock pattern.

**ColorPicker `onChange` handlers are exempt** from the coverage requirement. PrimeReact ColorPicker exposes no accessible interface for its color-picking surface. Mock it with a plain `<button>` and add a test that clicks it if function coverage for the handler is required. Document any permanently untestable handlers in the SKIP table in `testing/TESTING_REPORTS.md`.

---

### Rule C — Pure functions in helpers must be tested for all code paths

Every exported function in `src/helpers/` must have tests that exercise **every reachable branch**. For switch statements, test each `case` that is reachable with valid inputs. `default` branches that are unreachable via TypeScript-constrained inputs are explicitly exempt — document them in the SKIP table in `testing/TESTING_REPORTS.md`.

**Motivation:** `fretpoints.tsx` had functions called (100% function coverage) but 45% branch coverage because component tests only used a subset of input values. A dedicated helper test file with explicit input/output tests for each branch eliminates this gap.

---

### Rule D — Context functions must be tested directly

Every function exposed from a React context must have at least one test that calls it directly through a consumer component. Testing that a UI button calls `start()` is not sufficient if `restart()`, `stop()`, or other context functions are never exercised.

Use an inline `TestConsumer` component inside the test body to access and call context functions:

```tsx
const TestConsumer = () => {
  const { restart } = useTimer()
  return <button onClick={restart}>Restart</button>
}
render(<TimerProvider><TestConsumer /></TimerProvider>)
```

Also test each context hook's error-guard throw (the `if (!context) throw` branch) by rendering the consumer outside its provider:

```ts
it('throws when useTimer is called outside TimerProvider', () => {
  const Consumer = () => { useTimer(); return null }
  expect(() => render(<Consumer />)).toThrow('useTimer must be used within a TimerProvider')
})
```

**Motivation:** `TimerContext.tsx` had `restart` at 0% coverage because no component under test ever called it, even though it was exposed in the context value.
