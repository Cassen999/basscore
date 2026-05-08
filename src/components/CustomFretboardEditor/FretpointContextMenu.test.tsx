import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import FretpointContextMenu from './FretpointContextMenu'
import type { iCoords } from '../../types/types'

vi.mock('primereact/colorpicker', () => ({
  ColorPicker: ({ onChange }: { onChange?: (e: { value: string }) => void }) => (
    <button data-testid='color-picker' onClick={() => onChange?.({ value: 'ff0000' })}>
      Pick Color
    </button>
  ),
}))

vi.mock('primereact/overlaypanel', async () => {
  const { forwardRef, useImperativeHandle } = await import('react')
  const OverlayPanel = forwardRef(
    (
      {
        children,
        onHide,
        className,
      }: { children: React.ReactNode; onHide?: () => void; className?: string },
      ref: React.Ref<{ show: () => void; hide: () => void }>,
    ) => {
      useImperativeHandle(ref, () => ({ show: vi.fn(), hide: vi.fn() }))
      return (
        <div data-testid='overlay-panel' className={className}>
          {children}
          <button data-testid='outside-click' onClick={onHide}>
            outside
          </button>
        </div>
      )
    },
  )
  OverlayPanel.displayName = 'OverlayPanel'
  return { OverlayPanel }
})

const stubDot: iCoords = { id: 'dot-1', string: 1, fret: 1, color: '#a78bfa', label: '' }

const defaultProps = {
  dot: stubDot,
  visible: true,
  anchorEl: document.createElement('div'),
  applyToAll: false,
  onClose: vi.fn(),
  onColorChange: vi.fn(),
  onApplyToAllChange: vi.fn(),
  onLabelChange: vi.fn(),
  onReset: vi.fn(),
  onDelete: vi.fn(),
}

describe('FretpointContextMenu', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders when visible=true', () => {
    render(<FretpointContextMenu {...defaultProps} />)
    expect(screen.getByTestId('overlay-panel')).toBeInTheDocument()
  })

  it('renders when visible=false', () => {
    render(<FretpointContextMenu {...defaultProps} visible={false} />)
    expect(screen.getByTestId('overlay-panel')).toBeInTheDocument()
  })

  it('calls onClose when X button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when outside click fires onHide', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByTestId('outside-click'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onColorChange with "#ff0000" when color picker fires', async () => {
    const user = userEvent.setup()
    const onColorChange = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onColorChange={onColorChange} />)
    await user.click(screen.getByTestId('color-picker'))
    expect(onColorChange).toHaveBeenCalledWith('#ff0000')
  })

  it('calls onApplyToAllChange when Apply to all checkbox changes', async () => {
    const user = userEvent.setup()
    const onApplyToAllChange = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onApplyToAllChange={onApplyToAllChange} />)
    await user.click(screen.getByLabelText('Apply to all'))
    expect(onApplyToAllChange).toHaveBeenCalledWith(true)
  })

  it('calls onLabelChange when label input changes', async () => {
    const user = userEvent.setup()
    const onLabelChange = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onLabelChange={onLabelChange} />)
    await user.type(screen.getByPlaceholderText('Label'), 'R')
    expect(onLabelChange).toHaveBeenCalledWith('R')
  })

  it('enforces maxLength=2 on label input', () => {
    render(<FretpointContextMenu {...defaultProps} />)
    expect(screen.getByPlaceholderText('Label')).toHaveAttribute('maxLength', '2')
  })

  it('does not render label input when dot is null', () => {
    render(<FretpointContextMenu {...defaultProps} dot={null} />)
    expect(screen.queryByPlaceholderText('Label')).not.toBeInTheDocument()
  })

  it('calls onReset on Reset — not onClose', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    const onClose = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onReset={onReset} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onReset).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('renders the label input when dot has a label', () => {
    const dot: iCoords = { id: 'dot-1', string: 1, fret: 1, color: '#ff0000', label: 'Ab' }
    render(<FretpointContextMenu {...defaultProps} dot={dot} />)
    expect(screen.getByPlaceholderText('Label')).toHaveValue('Ab')
  })

  it('calls onLabelChange with empty string — not truncated by maxLength for 1-char input', async () => {
    const onLabelChange = vi.fn()
    render(<FretpointContextMenu {...defaultProps} onLabelChange={onLabelChange} />)
    fireEvent.change(screen.getByPlaceholderText('Label'), { target: { value: 'X' } })
    expect(onLabelChange).toHaveBeenCalledWith('X')
  })
})
