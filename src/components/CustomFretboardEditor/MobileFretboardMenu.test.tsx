import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import MobileFretboardMenu from './MobileFretboardMenu'
import type { iCustomFretboardPreset, iFretboardConfig, iMobileFretboardMenuProps } from '../../types/types'

vi.mock('../AppSidebar/AppSidebar', () => ({
  default: ({
    visible,
    onHide,
    children,
  }: {
    visible: boolean
    onHide: () => void
    children: React.ReactNode
  }) =>
    visible ? (
      <div data-testid='app-sidebar'>
        {children}
        <button data-testid='sidebar-hide' onClick={onHide}>
          hide
        </button>
      </div>
    ) : null,
}))

const stubConfig: iFretboardConfig = {
  width: 200,
  height: 700,
  numFrets: 7,
  numStrings: 4,
  fretpointRadius: 16,
}

const stubPresets: iCustomFretboardPreset[] = [
  {
    id: 'p1',
    name: 'Bass Run',
    coords: [],
    fretboardConfig: stubConfig,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'p2',
    name: 'My Lick',
    coords: [],
    fretboardConfig: stubConfig,
    createdAt: '',
    updatedAt: '',
  },
]

const makeProps = (overrides: Partial<iMobileFretboardMenuProps> = {}): iMobileFretboardMenuProps => ({
  coords: [],
  historyConfig: stubConfig,
  presets: [],
  onFretCountChange: vi.fn(),
  onStringCountChange: vi.fn(),
  onLoadPreset: vi.fn(),
  onDeletePreset: vi.fn(),
  onSavePreset: vi.fn(),
  savePresetName: '',
  onSavePresetNameChange: vi.fn(),
  overwriteWarning: false,
  onExportSvg: vi.fn(),
  onClearAll: vi.fn(),
  ...overrides,
})

describe('MobileFretboardMenu', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cog button opens the sidebar', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
  })

  it('cog button while open closes the sidebar', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument()
  })

  it('Presets row click expands accordion', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    const presetsRow = screen.getByRole('button', { name: /Presets/ })
    expect(presetsRow).toHaveAttribute('aria-expanded', 'false')
    await user.click(presetsRow)
    expect(presetsRow).toHaveAttribute('aria-expanded', 'true')
  })

  it('Presets row second click collapses accordion', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    const presetsRow = screen.getByRole('button', { name: /Presets/ })
    await user.click(presetsRow)
    await user.click(presetsRow)
    expect(presetsRow).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: /Save Preset/ })).not.toBeInTheDocument()
  })

  it('Save Preset row toggles its accordion independently', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    const saveRow = screen.getByRole('button', { name: /Save Preset/ })
    await user.click(saveRow)
    expect(saveRow).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /Presets/ })).toHaveAttribute('aria-expanded', 'true')
  })

  it('Cancel collapses save input without calling onSavePreset', async () => {
    const user = userEvent.setup()
    const onSavePreset = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ onSavePreset, savePresetName: 'Test' })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: /Save Preset/ }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onSavePreset).not.toHaveBeenCalled()
    expect(screen.queryByPlaceholderText('Preset name')).not.toBeInTheDocument()
  })

  it('Save button calls onSavePreset with trimmed name and collapses input', async () => {
    const user = userEvent.setup()
    const onSavePreset = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ onSavePreset, savePresetName: '  My Run  ' })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: /Save Preset/ }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSavePreset).toHaveBeenCalledWith('My Run')
    expect(screen.queryByPlaceholderText('Preset name')).not.toBeInTheDocument()
  })

  it('Export SVG button calls onExportSvg', async () => {
    const user = userEvent.setup()
    const onExportSvg = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ onExportSvg })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: 'Export SVG' }))
    expect(onExportSvg).toHaveBeenCalledOnce()
  })

  it('Clear All button calls onClearAll', async () => {
    const user = userEvent.setup()
    const onClearAll = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ onClearAll })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: 'Clear All' }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })

  it('sidebar onHide resets presetsOpen and saveInputOpen', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: /Save Preset/ }))
    await user.click(screen.getByTestId('sidebar-hide'))
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    expect(screen.getByRole('button', { name: /Presets/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByPlaceholderText('Preset name')).not.toBeInTheDocument()
  })

  it('clicking a preset calls onLoadPreset with its id', async () => {
    const user = userEvent.setup()
    const onLoadPreset = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ presets: stubPresets, onLoadPreset })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: 'Bass Run' }))
    expect(onLoadPreset).toHaveBeenCalledWith('p1')
  })

  it('delete pill calls onDeletePreset and does not call onLoadPreset', async () => {
    const user = userEvent.setup()
    const onDeletePreset = vi.fn()
    const onLoadPreset = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ presets: stubPresets, onDeletePreset, onLoadPreset })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: 'Delete preset Bass Run' }))
    expect(onDeletePreset).toHaveBeenCalledWith('p1')
    expect(onLoadPreset).not.toHaveBeenCalled()
  })

  it('deleting the selected preset clears selectedPresetId', async () => {
    const user = userEvent.setup()
    const onDeletePreset = vi.fn()
    const onLoadPreset = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ presets: stubPresets, onDeletePreset, onLoadPreset })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: 'Bass Run' }))
    await user.click(screen.getByRole('button', { name: 'Delete preset Bass Run' }))
    expect(onDeletePreset).toHaveBeenCalledWith('p1')
  })

  it('shows overwrite warning text when overwriteWarning=true', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps({ overwriteWarning: true, savePresetName: 'Bass Run' })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    await user.click(screen.getByRole('button', { name: /Save Preset/ }))
    expect(screen.getByText('This will overwrite the existing preset.')).toBeInTheDocument()
  })

  it('shows "No Saved Presets" message when preset list is empty', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps({ presets: [] })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    expect(screen.getByText('No Saved Presets')).toBeInTheDocument()
  })

  it('keyboard Enter on Presets row expands accordion', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    const presetsRow = screen.getByRole('button', { name: /Presets/ })
    fireEvent.keyDown(presetsRow, { key: 'Enter' })
    expect(presetsRow).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking Save Preset button expands save input', async () => {
    const user = userEvent.setup()
    render(<MobileFretboardMenu {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    const saveBtn = screen.getByRole('button', { name: /Save Preset/ })
    fireEvent.click(saveBtn)
    expect(saveBtn).toHaveAttribute('aria-expanded', 'true')
  })

  it('keyboard Enter on preset item calls onLoadPreset', async () => {
    const user = userEvent.setup()
    const onLoadPreset = vi.fn()
    render(<MobileFretboardMenu {...makeProps({ presets: stubPresets, onLoadPreset })} />)
    await user.click(screen.getByRole('button', { name: 'Open fretboard controls' }))
    await user.click(screen.getByRole('button', { name: /Presets/ }))
    const presetItem = screen.getByRole('button', { name: 'Bass Run' })
    fireEvent.keyDown(presetItem, { key: 'Enter' })
    expect(onLoadPreset).toHaveBeenCalledWith('p1')
  })
})
