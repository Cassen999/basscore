import { createRef } from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { CustomFretboard } from './CustomFretboard'
import CustomFretboardEditor from './CustomFretboardEditor'
import { ControlsProvider } from '../../contexts/ControlsContext'
import { useControls } from '../../contexts/ControlsContext'
import * as customFretboardService from '../../services/customFretboardService'
import type { iCoords, iCustomFretboardPreset, iDragState, iFretboardConfig } from '../../types/types'

const stubPreset: iCustomFretboardPreset = {
  id: 'preset-1',
  name: 'My Preset',
  coords: [],
  fretboardConfig: { width: 700, height: 200, numFrets: 12, numStrings: 4, fretpointRadius: 12 },
  createdAt: '',
  updatedAt: '',
}

vi.mock('../../services/customFretboardService', () => ({
  getAll: vi.fn(() => []),
  getById: vi.fn(),
  getByName: vi.fn(() => undefined),
  save: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
}))

vi.mock('primereact/colorpicker', () => ({
  ColorPicker: ({ onChange }: { onChange?: (e: { value: string }) => void }) => (
    <button onClick={() => onChange?.({ value: 'ff0000' })}>Pick Color</button>
  ),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const defaultConfig: iFretboardConfig = {
  width: 700,
  height: 200,
  numFrets: 12,
  numStrings: 4,
  fretpointRadius: 12,
}

const renderEditor = (overrides: Partial<{
  coords: iCoords[]
  fretboardConfig: iFretboardConfig
  dragState: iDragState | null
  selectedDotId: string | null
  resolvedPrimaryColor: string
  onCellClick: (string: number, fret: number) => void
  onDotMouseDown: (id: string) => void
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onSvgMouseUp: () => void
  onBackgroundClick: () => void
}> = {}) => {
  const svgRef = createRef<SVGSVGElement>()
  return render(
    <CustomFretboardEditor
      coords={[]}
      fretboardConfig={defaultConfig}
      dragState={null}
      selectedDotId={null}
      resolvedPrimaryColor='#ff0000'
      svgRef={svgRef}
      onCellClick={vi.fn()}
      onDotMouseDown={vi.fn()}
      onSvgMouseMove={vi.fn()}
      onSvgMouseUp={vi.fn()}
      onBackgroundClick={vi.fn()}
      {...overrides}
    />
  )
}

const renderCustomFretboard = () =>
  render(
    <ControlsProvider>
      <CustomFretboard />
    </ControlsProvider>
  )

// ─────────────────────────────────────────────────────────────────────────────
// CustomFretboardEditor
// ─────────────────────────────────────────────────────────────────────────────

describe('CustomFretboardEditor', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('SVG structure', () => {
    it('renders the SVG with the correct aria-label', () => {
      renderEditor()
      expect(screen.getByRole('application', { name: 'Custom fretboard editor' })).toBeInTheDocument()
    })
  })

  describe('hit areas', () => {
    it('renders numStrings × numFrets hit area buttons', () => {
      renderEditor()
      expect(screen.getAllByRole('button')).toHaveLength(48)
    })

    it('labels empty hit areas correctly', () => {
      renderEditor()
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })

    it('labels occupied hit areas with "occupied" when dot has no label', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
      renderEditor({ coords })
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' })).toBeInTheDocument()
    })

    it('labels occupied hit areas with the dot label when one is set', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 2, fret: 3, color: 'red', label: 'R' }]
      renderEditor({ coords })
      expect(screen.getByRole('button', { name: 'String 2, Fret 3 — R' })).toBeInTheDocument()
    })

    it('calls onCellClick with the correct string and fret when a hit area is clicked', async () => {
      const user = userEvent.setup()
      const onCellClick = vi.fn()
      renderEditor({ onCellClick })
      await user.click(screen.getByRole('button', { name: 'String 2, Fret 5 — empty' }))
      expect(onCellClick).toHaveBeenCalledWith(2, 5)
    })
  })

  describe('dots', () => {
    it('renders a circle for each coord', () => {
      const coords: iCoords[] = [
        { id: '1', string: 1, fret: 1, color: 'red' },
        { id: '2', string: 2, fret: 3, color: 'blue' },
      ]
      const { container } = renderEditor({ coords })
      const userDots = container.querySelectorAll('circle:not(.custom-fretboard-editor__position-marker)')
      expect(userDots).toHaveLength(2)
    })

    it('renders a selection ring when a dot is selected', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
      const { container } = renderEditor({ coords, selectedDotId: 'dot-1' })
      // selected dot renders a ring circle + the dot itself
      const userDots = container.querySelectorAll('circle:not(.custom-fretboard-editor__position-marker)')
      expect(userDots).toHaveLength(2)
    })

    it('renders no selection ring when no dot is selected', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
      const { container } = renderEditor({ coords, selectedDotId: null })
      const userDots = container.querySelectorAll('circle:not(.custom-fretboard-editor__position-marker)')
      expect(userDots).toHaveLength(1)
    })

    it('renders a text label when a dot has a label', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 2, color: 'red', label: 'R' }]
      const { container } = renderEditor({ coords })
      expect(container.querySelector('text')).toHaveTextContent('R')
    })

    it('renders no text label when a dot has no label', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 2, color: 'red' }]
      const { container } = renderEditor({ coords })
      expect(container.querySelector('text')).not.toBeInTheDocument()
    })

    it('uses a dark text color for a light dot color', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 2, color: '#ffffff', label: 'R' }]
      const { container } = renderEditor({ coords })
      expect(container.querySelector('text')).toHaveAttribute('fill', '#000000')
    })

    it('uses a light text color for a dark dot color', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 2, color: '#000000', label: 'R' }]
      const { container } = renderEditor({ coords })
      expect(container.querySelector('text')).toHaveAttribute('fill', '#ffffff')
    })

    it('renders a drag preview circle when dragState is provided', () => {
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
      const dragState: iDragState = {
        dotId: 'dot-1',
        previewString: 1,
        previewFret: 3,
        dragDirection: 1,
        prevPreviewFret: 1,
      }
      const { container } = renderEditor({ coords, dragState })
      expect(container.querySelector('.custom-fretboard-editor__drag-preview')).toBeInTheDocument()
    })

    it('renders no drag preview when dragState is null', () => {
      const { container } = renderEditor({ dragState: null })
      expect(container.querySelector('.custom-fretboard-editor__drag-preview')).not.toBeInTheDocument()
    })
  })

  describe('position markers', () => {
    it('renders 6 position markers for a 12-fret board (4 single + 2 double at fret 12)', () => {
      const { container } = renderEditor()
      expect(container.querySelectorAll('.custom-fretboard-editor__position-marker')).toHaveLength(6)
    })
  })

  describe('hit area keyboard and mouse events', () => {
    it('calls onCellClick when Enter is pressed on a hit area', () => {
      const onCellClick = vi.fn()
      renderEditor({ onCellClick })
      fireEvent.keyDown(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }), { key: 'Enter' })
      expect(onCellClick).toHaveBeenCalledWith(1, 1)
    })

    it('calls onCellClick when Space is pressed on a hit area', () => {
      const onCellClick = vi.fn()
      renderEditor({ onCellClick })
      fireEvent.keyDown(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }), { key: ' ' })
      expect(onCellClick).toHaveBeenCalledWith(1, 1)
    })

    it('calls onDotMouseDown when mouseDown occurs on an occupied hit area', () => {
      const onDotMouseDown = vi.fn()
      const coords: iCoords[] = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
      renderEditor({ coords, onDotMouseDown })
      fireEvent.mouseDown(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      expect(onDotMouseDown).toHaveBeenCalledWith('dot-1')
    })
  })

  describe('SVG events', () => {
    it('calls onSvgMouseMove when the mouse moves over the SVG', () => {
      const onSvgMouseMove = vi.fn()
      renderEditor({ onSvgMouseMove })
      fireEvent.mouseMove(screen.getByRole('application'))
      expect(onSvgMouseMove).toHaveBeenCalledOnce()
    })

    it('calls onSvgMouseUp when the mouse button is released over the SVG', () => {
      const onSvgMouseUp = vi.fn()
      renderEditor({ onSvgMouseUp })
      fireEvent.mouseUp(screen.getByRole('application'))
      expect(onSvgMouseUp).toHaveBeenCalledOnce()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CustomFretboard
// ─────────────────────────────────────────────────────────────────────────────

describe('CustomFretboard', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('render', () => {
    it('renders the page title', () => {
      renderCustomFretboard()
      expect(screen.getByText('Custom Fretboard')).toBeInTheDocument()
    })

    it('renders the fretboard SVG', () => {
      renderCustomFretboard()
      expect(screen.getByRole('application', { name: 'Custom fretboard editor' })).toBeInTheDocument()
    })

    it('renders the Fretboard Controls card header', () => {
      renderCustomFretboard()
      expect(screen.getByText('Fretboard Controls')).toBeInTheDocument()
    })
  })

  describe('initial control states', () => {
    it('renders the fret count spinbutton with initial value 12', () => {
      renderCustomFretboard()
      expect(screen.getByRole('spinbutton')).toHaveValue('12')
    })

    it('renders string count options 4, 5, and 6', () => {
      renderCustomFretboard()
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument()
    })

    it('renders Undo and Redo buttons disabled', () => {
      renderCustomFretboard()
      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled()
    })

    it('renders the Delete dot button disabled when no dot is selected', () => {
      renderCustomFretboard()
      const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
      expect(within(actionsGroup).getByRole('button', { name: 'Delete' })).toBeDisabled()
    })

    it('renders the Save Preset and Export SVG buttons', () => {
      renderCustomFretboard()
      expect(screen.getByRole('button', { name: 'Save Preset' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Export SVG' })).toBeInTheDocument()
    })
  })

  describe('dot interactions', () => {
    it('adds a dot when an empty cell is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' })).toBeInTheDocument()
    })

    it('enables Undo after a dot is added', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled()
    })

    it('enables the Delete dot button when a dot is selected', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
      expect(within(actionsGroup).getByRole('button', { name: 'Delete' })).toBeEnabled()
    })

    it('removes the dot when Undo is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'Undo' }))
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })

    it('enables Redo after an Undo', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'Undo' }))
      expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled()
    })

    it('re-adds the dot when Redo is clicked after an Undo', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'Undo' }))
      await user.click(screen.getByRole('button', { name: 'Redo' }))
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' })).toBeInTheDocument()
    })

    it('removes the selected dot when Delete is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
      await user.click(within(actionsGroup).getByRole('button', { name: 'Delete' }))
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })

    it('removes all dots when Clear All is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' }))
      await user.click(screen.getByRole('button', { name: 'Clear All' }))
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' })).toBeInTheDocument()
    })

    it('switches selection when a different occupied dot is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      expect(screen.getByPlaceholderText('Label')).toBeInTheDocument()
    })
  })

  describe('string count', () => {
    it('changes the number of string lines when a different string count is selected', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: '5' }))
      expect(container.querySelectorAll('.string-lines')).toHaveLength(5)
    })
  })

  describe('cell click deselect', () => {
    it('deselects a dot when its occupied cell is clicked again', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
      expect(within(actionsGroup).getByRole('button', { name: 'Delete' })).toBeDisabled()
    })

    it('deselects without adding a new dot when an empty cell is clicked while a dot is selected', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' }))
      expect(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' })).toBeInTheDocument()
    })
  })

  describe('keyboard shortcuts', () => {
    it('undoes the last action when Ctrl+Z is pressed', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })

    it('redoes an undone action when Ctrl+Shift+Z is pressed', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
      fireEvent.keyDown(window, { key: 'Z', ctrlKey: true, shiftKey: true })
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' })).toBeInTheDocument()
    })

    it('deletes the selected dot when Delete is pressed', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      fireEvent.keyDown(window, { key: 'Delete' })
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })

    it('does not crash when Ctrl+Z is pressed with no history', () => {
      renderCustomFretboard()
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
      expect(screen.getByRole('application', { name: 'Custom fretboard editor' })).toBeInTheDocument()
    })

    it('does not crash when Ctrl+Shift+Z is pressed with nothing to redo', () => {
      renderCustomFretboard()
      fireEvent.keyDown(window, { key: 'Z', ctrlKey: true, shiftKey: true })
      expect(screen.getByRole('application', { name: 'Custom fretboard editor' })).toBeInTheDocument()
    })
  })

  describe('click-outside deselect', () => {
    it('deselects a dot when clicking outside the SVG and controls', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      fireEvent.mouseDown(document.body)
      const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
      expect(within(actionsGroup).getByRole('button', { name: 'Delete' })).toBeDisabled()
    })

    it('deselects a dot when the SVG background is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      fireEvent.click(container.querySelector('.custom-fretboard-editor rect:not([role])')!)
      const actionsGroup = screen.getByText('Actions').closest<HTMLElement>('.control-group')!
      expect(within(actionsGroup).getByRole('button', { name: 'Delete' })).toBeDisabled()
    })
  })

  describe('drag and drop', () => {
    it('moves a dot when dragged from one cell to another', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      const svgEl = screen.getByRole('application', { name: 'Custom fretboard editor' })
      fireEvent.mouseDown(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      // clientX≈99 snaps to fret 2, clientY≈128 snaps to string 2 (getBoundingClientRect returns zeros in jsdom)
      fireEvent.mouseMove(svgEl, { clientX: 99, clientY: 128 })
      fireEvent.mouseUp(svgEl)
      expect(screen.getByRole('button', { name: 'String 2, Fret 2 — occupied' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })

    it('moves a dot to the next available fret when dragged onto an occupied cell', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 2 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 2 — occupied' }))
      const svgEl = screen.getByRole('application', { name: 'Custom fretboard editor' })
      fireEvent.mouseDown(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      fireEvent.mouseMove(svgEl, { clientX: 99, clientY: 184 })
      fireEvent.mouseUp(svgEl)
      expect(screen.getByRole('button', { name: 'String 1, Fret 3 — occupied' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })).toBeInTheDocument()
    })
  })

  describe('dot label', () => {
    it('shows the Dot Label input when a dot is selected', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      expect(screen.getByPlaceholderText('Label')).toBeInTheDocument()
    })

    it('updates the hit area label when text is typed in the Dot Label input', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.type(screen.getByPlaceholderText('Label'), 'R')
      expect(screen.getByRole('button', { name: 'String 1, Fret 1 — R' })).toBeInTheDocument()
    })
  })

  describe('dialogs', () => {
    it('opens the Save Preset dialog when Save Preset is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Save Preset' }))
      expect(screen.getByRole('dialog', { name: 'Save Preset' })).toBeInTheDocument()
    })

    it('saves a new preset when a name is typed and Save is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Save Preset' }))
      await user.type(screen.getByPlaceholderText('Preset name'), 'My Preset')
      await user.click(screen.getByRole('button', { name: 'Save' }))
      expect(customFretboardService.save).toHaveBeenCalledOnce()
    })

    it('does not save when Cancel is clicked in the Save Preset dialog', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Save Preset' }))
      await user.type(screen.getByPlaceholderText('Preset name'), 'Test')
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(customFretboardService.save).not.toHaveBeenCalled()
    })

    it('shows an overwrite warning when the preset name already exists', async () => {
      const user = userEvent.setup()
      vi.mocked(customFretboardService.getByName).mockReturnValue(stubPreset)
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Save Preset' }))
      await user.type(screen.getByPlaceholderText('Preset name'), 'My Preset')
      expect(screen.getByText('This will overwrite the existing preset.')).toBeInTheDocument()
    })

    it('opens the Export SVG dialog when Export SVG is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Export SVG' }))
      expect(screen.getByRole('dialog', { name: 'Export SVG' })).toBeInTheDocument()
    })

    it('does not export when Cancel is clicked in the Export SVG dialog', async () => {
      const createObjectURL = vi.fn()
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Export SVG' }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(createObjectURL).not.toHaveBeenCalled()
    })

    it('calls URL.createObjectURL when Export is confirmed', async () => {
      vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() })
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Export SVG' }))
      await user.click(screen.getByRole('button', { name: 'Export' }))
      expect(URL.createObjectURL).toHaveBeenCalledOnce()
    })

    it('updates the hint text when the filename is changed', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Export SVG' }))
      await user.clear(screen.getByPlaceholderText('File name'))
      await user.type(screen.getByPlaceholderText('File name'), 'my-diagram')
      expect(screen.getByText(/my-diagram\.svg/)).toBeInTheDocument()
    })

    it('does not call createObjectURL when the Export dialog is dismissed via Escape', async () => {
      vi.stubGlobal('URL', { createObjectURL: vi.fn(), revokeObjectURL: vi.fn() })
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Export SVG' }))
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(URL.createObjectURL).not.toHaveBeenCalled()
    })

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
  })

  // 1-C-1 and 1-C-2 SKIPPED — PrimeReact Dropdown does not expose option selection
  // accessibly in jsdom. Neither getByRole('option'), ArrowDown keyDown, nor fireEvent.change
  // on the hidden native <select> triggers Dropdown's onChange. See testing/TESTING_REPORTS.md.

  describe('fret count', () => {
    it('increments the fret count when the increment button is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      // PrimeReact InputNumber buttons have no accessible aria-label; select by CSS class
      await user.click(container.querySelector('.p-inputnumber-button-up')!)
      expect(screen.getByRole('spinbutton')).toHaveValue('13')
    })

    it('removes a dot at fret 12 when fret count is decremented to 11', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 12 — empty' }))
      await user.click(container.querySelector('.p-inputnumber-button-down')!)
      expect(screen.queryByRole('button', { name: /Fret 12/ })).not.toBeInTheDocument()
    })
  })

  describe('apply to all', () => {
    it('changes the color picker label to "Color (All Dots)" when Apply to all is checked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByLabelText('Apply to all'))
      expect(screen.getByText('Color (All Dots)')).toBeInTheDocument()
    })
  })

  describe('color picker', () => {
    it('updates scaleNoteColor in context when the color picker fires onChange with no dot selected', async () => {
      const user = userEvent.setup()
      const Consumer = () => {
        const { scaleNoteColor } = useControls()
        return <span data-testid='scale-color'>{scaleNoteColor as string}</span>
      }
      render(
        <ControlsProvider>
          <CustomFretboard />
          <Consumer />
        </ControlsProvider>
      )
      await user.click(screen.getByRole('button', { name: 'Pick Color' }))
      expect(screen.getByTestId('scale-color')).toHaveTextContent('#ff0000')
    })

    it('updates the selected dot color when the color picker fires onChange', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'Pick Color' }))
      // Deselect to remove the ring circle, leaving only the dot circle to query
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      const dotCircle = container.querySelector(
        'circle:not(.custom-fretboard-editor__position-marker)',
      )
      expect(dotCircle).toHaveAttribute('fill', '#ff0000')
    })

    it('updates all dot colors when Apply to all is checked and the picker fires onChange', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — empty' }))
      await user.click(screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' }))
      await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — empty' }))
      await user.click(screen.getByLabelText('Apply to all'))
      await user.click(screen.getByRole('button', { name: 'Pick Color' }))
      // Deselect to remove the ring circle so only dot circles remain
      await user.click(screen.getByRole('button', { name: 'String 2, Fret 2 — occupied' }))
      const dotCircles = container.querySelectorAll(
        'circle:not(.custom-fretboard-editor__position-marker)',
      )
      dotCircles.forEach(c => expect(c).toHaveAttribute('fill', '#ff0000'))
    })
  })
})
