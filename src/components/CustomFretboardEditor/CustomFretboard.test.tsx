import { createRef } from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { CustomFretboard } from './CustomFretboard'
import CustomFretboardEditor from './CustomFretboardEditor'
import { ControlsProvider } from '../../contexts/ControlsContext'
import type { iCoords, iDragState, iFretboardConfig } from '../../types/types'

vi.mock('../../services/customFretboardService', () => ({
  getAll: vi.fn(() => []),
  getById: vi.fn(),
  getByName: vi.fn(() => undefined),
  save: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
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
  })

  describe('string count', () => {
    it('changes the number of string lines when a different string count is selected', async () => {
      const user = userEvent.setup()
      const { container } = renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: '5' }))
      expect(container.querySelectorAll('.string-lines')).toHaveLength(5)
    })
  })

  describe('dialogs', () => {
    it('opens the Save Preset dialog when Save Preset is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Save Preset' }))
      expect(screen.getByRole('dialog', { name: 'Save Preset' })).toBeInTheDocument()
    })

    it('opens the Export SVG dialog when Export SVG is clicked', async () => {
      const user = userEvent.setup()
      renderCustomFretboard()
      await user.click(screen.getByRole('button', { name: 'Export SVG' }))
      expect(screen.getByRole('dialog', { name: 'Export SVG' })).toBeInTheDocument()
    })
  })
})
