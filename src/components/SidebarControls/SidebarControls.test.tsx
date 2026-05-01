import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SidebarControls from './SidebarControls'
import { ControlsProvider, useControls } from '../../contexts/ControlsContext'

vi.mock('primereact/colorpicker', () => ({
  ColorPicker: ({ onChange }: { onChange?: (e: { value: string }) => void }) => (
    <button onClick={() => onChange?.({ value: 'ff0000' })}>Pick Color</button>
  ),
}))

const renderOnRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ControlsProvider>
        <SidebarControls />
      </ControlsProvider>
    </MemoryRouter>
  )

// ─────────────────────────────────────────────────────────────────────────────
// SidebarControls
// ─────────────────────────────────────────────────────────────────────────────

describe('SidebarControls', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('/scales route', () => {
    it('renders the Scale label', () => {
      renderOnRoute('/scales')
      expect(screen.getByText('Scale')).toBeInTheDocument()
    })

    it('renders the Note Color label', () => {
      renderOnRoute('/scales')
      expect(screen.getByText('Note Color')).toBeInTheDocument()
    })

    it('does not render interval controls', () => {
      renderOnRoute('/scales')
      expect(screen.queryByText('Root')).not.toBeInTheDocument()
      expect(screen.queryByText('Unison')).not.toBeInTheDocument()
    })

    // 4-A-1 SKIPPED — PrimeReact Dropdown combobox has pointer-events:none in jsdom;
    // clicking it throws. See testing/TESTING_REPORTS.md.

    it('updates scaleNoteColor in context when the Note Color picker fires onChange', async () => {
      const user = userEvent.setup()
      const Consumer = () => {
        const { scaleNoteColor } = useControls()
        return <span data-testid='scale-color'>{scaleNoteColor as string}</span>
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
  })

  describe('/intervals route', () => {
    it('renders two Interval labels (section header and color picker)', () => {
      renderOnRoute('/intervals')
      expect(screen.getAllByText('Interval')).toHaveLength(2)
    })

    it('renders the Root label', () => {
      renderOnRoute('/intervals')
      expect(screen.getByText('Root')).toBeInTheDocument()
    })

    it('renders the Unison label', () => {
      renderOnRoute('/intervals')
      expect(screen.getByText('Unison')).toBeInTheDocument()
    })

    it('renders the Show/Hide Unison switch', () => {
      renderOnRoute('/intervals')
      expect(screen.getByRole('switch', { name: 'Show/Hide Unison Note' })).toBeInTheDocument()
    })

    it('shows "Hide Unison" label by default', () => {
      renderOnRoute('/intervals')
      expect(screen.getByText('Hide Unison')).toBeInTheDocument()
    })

    it('toggles the unison label to "Show Unison" when the switch is clicked', async () => {
      const user = userEvent.setup()
      renderOnRoute('/intervals')
      await user.click(screen.getByRole('switch', { name: 'Show/Hide Unison Note' }))
      expect(screen.getByText('Show Unison')).toBeInTheDocument()
    })

    it('does not render scale controls', () => {
      renderOnRoute('/intervals')
      expect(screen.queryByText('Note Color')).not.toBeInTheDocument()
    })

    // 4-B-1 SKIPPED — same PrimeReact Dropdown pointer-events:none issue as 4-A-1.
    // See testing/TESTING_REPORTS.md.

    it('updates the root interval color in context when the Root picker fires onChange', async () => {
      const user = userEvent.setup()
      const Consumer = () => {
        const { intervalColors } = useControls()
        return <span data-testid='root-color'>{intervalColors.root.color as string}</span>
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

    it('updates the interval color in context when the Interval picker fires onChange', async () => {
      const user = userEvent.setup()
      const Consumer = () => {
        const { intervalColors } = useControls()
        return <span data-testid='interval-color'>{intervalColors.interval.color as string}</span>
      }
      render(
        <MemoryRouter initialEntries={['/intervals']}>
          <ControlsProvider>
            <SidebarControls />
            <Consumer />
          </ControlsProvider>
        </MemoryRouter>
      )
      const intervalGroups = screen.getAllByText('Interval')
      const intervalGroup = intervalGroups[intervalGroups.length - 1].closest<HTMLElement>('.sidebar-controls__group')!
      await user.click(within(intervalGroup).getByRole('button', { name: 'Pick Color' }))
      expect(screen.getByTestId('interval-color')).toHaveTextContent('#ff0000')
    })

    it('updates the unison color in context when the Unison picker fires onChange', async () => {
      const user = userEvent.setup()
      const Consumer = () => {
        const { intervalColors } = useControls()
        return <span data-testid='unison-color'>{intervalColors.unison.color as string}</span>
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
  })

  describe('other routes', () => {
    it('renders nothing on unrecognized routes', () => {
      const { container } = renderOnRoute('/')
      expect(container.firstChild).toBeNull()
    })
  })
})

describe('ControlsContext', () => {
  it('throws when useControls is called outside ControlsProvider', () => {
    const Consumer = () => { useControls(); return null }
    expect(() => render(<Consumer />)).toThrow('useControls must be used within a ControlsContext Provider')
  })
})
