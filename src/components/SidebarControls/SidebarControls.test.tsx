import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SidebarControls from './SidebarControls'
import { ControlsProvider } from '../../contexts/ControlsContext'

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
  })

  describe('other routes', () => {
    it('renders nothing on unrecognized routes', () => {
      const { container } = renderOnRoute('/')
      expect(container.firstChild).toBeNull()
    })
  })
})
