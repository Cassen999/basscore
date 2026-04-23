Please read this prompt and create a testing strategy along with TESTING_REPORTS.md and FIX_PLANS.md

# Testing strategy
Summary: I want to implement a unit testing strategy that will be implemented anytime a new feature, functionality, or page is added. This testing strategy will achieve over 90% code coverage. Failed tests must be reported in TESTING_REPORTS.md and a fix plan generated in FIX_PLANS.md. You must link the report to the fix plan.

## Unit Tests
Unit tests should primarily be unit and component-level tests.
Integration tests may be written when multiple components interact to deliver a feature.
Avoid end-to-end testing in this strategy.

## Testing Philosophy
Tests must focus on user-observable behavior, not internal implementation details.
Avoid testing internal state directly when it is not exposed to the user.

## Code Coverage
Code coverage must meet the following minimum thresholds:
1. Lines: 90%
2. Branches: 85%
3. Functions: 90%
4. Statements: 90%

Coverage must be enforced globally and should not rely on trivial or redundant tests to inflate coverage.

## Tools
The tools used will be jest and reacttestinglibrary

## Test Files
1. Test files must be colocated with the component
2. Use the naming convention: <ComponentName>.test.tsx
3. Group tests using describe blocks by feature or behavior
4. Use clear, human-readable test names describing expected behavior

## What should be tested
1. All meaningful user interactions must be tested, including:
	- Clicks that trigger state changes or navigation
	- Form inputs that affect application state
	- Keyboard interactions where applicable

Avoid testing trivial interactions that do not affect behavior or state.

2. Renders. All pages must include render tests that verify meaningful UI output and behavior.

3. Routing tests must verify:
	- Navigation to the correct route
	- Correct component rendering after navigation
	- Behavior of protected or conditional routes (if applicable)

## What should NOT be tested
1. DO NOT test any of the PrimeReact component functionality. For example, if there is an input element imported from PrimeReact, do not write a test to test that it accepts input or updates internal component states. Test only that the correct local state updates accurately when the input captures entered data.

2. Do not mock React internals (e.g., useState, useEffect).
Mock only external dependencies and services.

## Test Structure
Tests should follow the Arrange / Act / Assert pattern:
1. Arrange: Set up the component and required state
2. Act: Perform the user interaction
3. Assert: Verify the expected outcome

## Query Strategy (React Testing Library)
Tests must prioritize queries in the following order:
1. getByRole (preferred)
2. getByLabelText
3. getByText
4. getByPlaceholderText
5. getByTestId (last resort only)

Avoid relying on test IDs unless no other selector is viable.

## Mocking Strategy
1. Mock API/service calls using jest mocks
2. Do not mock the component under test
3. Avoid over-mocking internal logic
4. Prefer mocking at the network/service boundary

## User Interaction Simulation
Use userEvent for simulating user interactions.
Avoid fireEvent unless absolutely necessary.

## Test Isolation
1. Each test must be independent and not rely on shared state
2. Use beforeEach/afterEach where appropriate
3. Clean up mocks between tests

## Render Tests
Render tests must verify the presence of meaningful UI elements, including:
1. Interactive elements (buttons, inputs, links)
2. Key content (labels, headings, dynamic text)
3. Conditional rendering states (loading, empty, error states)
4. User-visible content

Avoid testing purely structural or stylistic elements (e.g., div wrappers).

## API and async Testing
All external data fetching (APIs, services) must be mocked.
Tests must cover:
1. Successful responses
2. Loading states
3. Error states

## Reporting
1. IDs:
	- Each failure must be assigned a unique ID in the format:
	TEST-YYYYMMDD-XXX
	- This ID must be used to link between TESTING_REPORTS.md and FIX_PLANS.md
	- IDs must be unique. If multiple failures occur on the same day, increment XXX sequentially.

2. Structure:
	- Reports and fix plans must follow consistent markdown formatting with headings.

3. When tests are finished running reports must be generated immediately after any test run that results in failures. A report is not necessary if no tests failed.

4. Report must be generated PER FAILURE in TESTING_REPORTS.md and a fix plan generated in FIX_PLANS.md.

5. The report in TESTING_REPORTS.md must include:
	- Organization of report data by component.
	- Description of the test that failed and the file location
	- Date of test failure in the format: YYYY-MM-DD
	- Link to the generated plan in FIX_PLANS.md
	- A score of 0-5 of fix importance. Examples:
		- 5: App crash, blocked navigation, broken core feature
		- 4: Major feature malfunction with workaround
		- 3: Incorrect UI behavior affecting UX
		- 2: Minor UI inconsistency
		- 1: Edge case bug
		- 0: Test-only issue, no user impact
	- Example report structure:
		#### TEST-20260423-001
		- Component: UserProfile.tsx
		- File: src/components/UserProfile.test.tsx
		- Description: Fails to render user name on successful API call
		- Date: YYYY-MM-DD
		- Severity: 3
		- Fix Plan: [Link to FIX_PLANS.md#TEST-20260423-001]

6. The fix plan in FIX_PLANS.md must include:
	- Organization of plan data by component
	- Link back to the report in TESTING_REPORTS.md
	- Explanation of how to fix the broken test
	- Explanation must include whether the suggested fix is to the test or to the component
	- Fix plan must prioritize fixing the component/page/etc. before suggesting a fix for the test itself
	- If a fix is suggested for the test itself you must explain why
	- Failed test fixes must always retain the component/page/etc's functionality and styles. If there is a reason why any of that must change then that reasoning must be part of the fix plan
	- Fix plans must be detailed enough for you to carry out the plan with little to no involvement from myself


## Flaky Tests
If a test failure is inconsistent or non-deterministic:
1. Attempt to reproduce the failure
2. Do not immediately log a report unless the failure is confirmed
3. Identify potential causes of flakiness (async timing, improper mocks, shared state)

## Edge Cases
Tests should include edge cases where applicable, including:
1. Empty data states
2. Invalid inputs
3. Error handling paths

Tests must not be modified solely to force a passing result if the underlying behavior is incorrect.

## Implementations of fixes
1. You will only implement the fix plan when instructed.
2. You will carry out only what is contained within the plan.
3. If you discover anything while implementing the fix that will cause you to deviate from the plan, you must stop immediately, notify me, and update the plan and description with the new findings.
4. Once a plan has been implemented you must:
   - Run all tests
   - Run the application build process (e.g., npm run build)
   - Verify both complete successfully with no errors. If the test fails after plan implementation, a new description and plan must be made

## After plan implementation is successful
1. After implementing the fix plan and successfully running the tests and build, you must update the documentation (both description and plan) to designate them as FIXED
2. When updating the documentation for a fixed test, you must include the name of the branch it was fixed on

## Definition of Done
A task is considered complete when:
1. All tests pass
2. Code coverage thresholds are met
3. No new test failures are introduced
4. Documentation (reports and fix plans) is up to date
