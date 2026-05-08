# Custom Fretboard Mobile View
Do not write any code! I want you to read this and propose a full implementation plan for this request along with a separate file with diagrams to illustrate your plan. In the implementation plan please also include any tests that need to be updated or added.

## Diagrams
Diagrams should include:
- component tree diagram
- interaction flow diagram (touch events → state changes)
- layout diagram (rotated fretboard + menu overlay zones)
Diagrams should reflect proposed changes only and not re-document existing unchanged desktop architecture unless required for clarity.

Summary: The custom fretboard should follow the currently applied mobile patterns and have a clean and usable view on mobile and tablet devices. The control panel will follow a new pattern to accomodate a larger amount of controls

## Fretboard
1. Fretboard must rotate 90 degrees so that fret 1 is on the top and 12 is on the bottom
2. Top must be labeled nut and bottom bridge as the current pattern is
3. To accommodate touch controls, when a fretpoint is placed immediately unselect it as the active fretpoint

## Fretpoints
Fretpoints will have new behavior on mobile.

1. Fretpoints are immediately unselected as active after placement.
	- New fretpoints are always the default primary purple color
	- Placement does not create an active selection state unless place with a long press. Refer to #8 below for clarification.
2. When a user clicks and holds a fretpoint for 1000ms, fretpoint should be considered active. Ignore multi touches
3. When a fretpoint is active, open a context menu. This context menu should use the primereact overlay component (or best suggestion) and contain these options:
	- dot color that will change the color of the currently selected dot along with the Apply to all checkbox
	- A button to delete the current active fretpoint
	- An input to label the current active fretpoint
4. Fretpoint is deactivated when the user closes the context menu or clicks outside of the context menu (which should also close the context menu)
5. Closing the context menu:
	- There should be a close button (x) at the top right of context menu to close menu and deactivate fretpoint
	- Clicking outside the context menu should close the context menu and deactivate the fretpoint
	- If the user clicks another place on the fretboard while the context menu is open it should ONLY close the menu and deactivate the fretpoint. It should NOT add a new fretpoint
6. Undo should not be represented or included in the mobile view. Instead, add a reset button that will remove the fretpoint label and revert the fretpoint color back to the primary purple. Confirmation of reset is not necessary. Reset only applies to currently active fretpoint
	- Reset should not change active/focused state or open/close any menus
7. Long press threshold should be added to controls context with a default of 1000ms. Right now there should not be an exposed way for the user to set this but it should be a state variable so that configuration can be exposed in the future. For now it should function only off of the default 1000ms.
8. Long press on an empty space should add the new fretpoint, activate it, and open its context menu.
	- If the user presses and holds longer than a touch but less than the defined long press activation threshold, treat the interaction as a touch
	- Existing fretpoints always take precedence over empty space detection for long press interactions.
	- A touch must be stationary on empty space for the full long-press threshold to trigger creation. Movement cancels long-press detection.
	- Interaction priority order:
		i. Existing fretpoint interaction
		ii. Empty space long press
		iii. Empty space tap
	- Long-press activation is triggered only once at the threshold moment; any movement before activation cancels it, and any movement after activation does not invalidate the created/activated fretpoint.

## All other controls - general requirements
All other controls that are currently contained in the fretboard controls should be migrated to a slide out menu on the right side of the screen.
1. To save vertical space, presets category should follow a similar pattern to a dropdown or accordion. Each should have the category label with a down arrow icon to the right
2. When category is clicked, down carat should change to an up carat and reveal the category's controls options

## Slide out menu
This slide out menu should slide from the right of the screen and maintain the same visual patterns as the left slide out menu (i.e background color, bass guitar image, outline, etc.)
1. Icon the user will click to expand this menu must be the cog icon from primereact and the cog icon must be the primary purple color
2. To close the menu the user may click outside the slide out menu or click the cog icon

## Fret Count
Use same component but on mobile screens the default fret count is 7

## String Count
Use the same component

## Presets
This must function as described in the All other controls section.
1. When slide out menu opens, all that will be immediately shown is Presets with a down carat
2. When the Presets label or carat (or div) is clicked, the carat must transition to point up (letting the user know that clicking it again will hide these settings) and slide down (reveal) the preset settings
	- Save preset should be the first option shown
		i. Clicking save preset will slide down (reveal) the preset name input along with the cancel and save buttons underneath the input
		ii. Cancel and save buttons should function identically to their current implementation
		iii. Clicking save preset while the preset settings are visible should slide the preset settings up (hiding them) to hide them
	- Below save preset there should be the select preset dropdown menu. No load or delete buttons should be visible
		i. While the select preset dropdown is within the mobile slide out menu, clicking a preset should automatically select that preset and load it. There should never be a load button in the mobile slide out menu
		ii. Each preset dropdown menu item should have a delete pill button aligned to the right of the menu item div. This pill button should be the delete red color and have only a trash can icon to let the user know that clicking that pill button will delete the preset it is associated with.
			- Clicking this delete pill button should delete that preset item and remove it from the dropdown menu and local storage dynamically
			- When delete is clicked the dropdown should remain open but the deleted option removed
			- If the currently active preset is deleted, the system should fall back to the default state defined by existing preset logic (no additional mobile-specific behavior should be introduced).
3. Do not add any logic to allow only one of the accordioned settings to be revealed. Only close the accordioned menu options if the user clicks the category div again to hide the options. This allows more control categories to be added in the future and allows the user to have as many settings visible as possible
4. Accordion open/close state must persist while the slide-out menu remains mounted, but should reset only when the menu is fully unmounted or explicitly closed by existing behavior.
	- “Explicit close” refers only to the existing slide-out menu close action (cog toggle or outside click), not internal accordion interactions.

## Actions
This category should not exist in the mobile slide out menu. Instead, have only the export svg button. This button should function exactly the same as it does in the desktop version

## Clear All
This should be the last option of the mobile menu and should function exactly the same as the desktop version.

DO NOT rewrite any existing components, contexts, or functionality unless explicitely necessary. If you deem it necessary you must let me know the new suggested pattern. This should be an update to the UI only

Please ask any clarifying questions. If you have suggestions to make this more efficient or to improve the user experience, please suggest them
