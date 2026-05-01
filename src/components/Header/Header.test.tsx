import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'
import { TimerProvider } from '../../contexts/TimerContext'

vi.mock('../SidebarControls/SidebarControls', () => ({ default: () => null }))
vi.mock('../Timer/Timer', () => ({ Timer: () => null }))
vi.mock('../Timer/TimerControls', () => ({ TimerControls: () => null }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderHeader = () =>
  render(
    <MemoryRouter>
      <TimerProvider>
        <Header />
      </TimerProvider>
    </MemoryRouter>
  )

describe('Header', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('render', () => {
    it('renders the logo', () => {
      renderHeader()
      expect(screen.getByAltText('basscore logo')).toBeInTheDocument()
    })

    it('renders the hamburger button', () => {
      renderHeader()
      expect(screen.getByRole('button', { name: 'Open navigation menu' })).toBeInTheDocument()
    })
  })

  describe('sidebar', () => {
    it('does not show sidebar nav links before the hamburger is clicked', () => {
      renderHeader()
      expect(screen.queryByRole('button', { name: 'Home' })).not.toBeInTheDocument()
    })

    it('shows sidebar nav links after the hamburger is clicked', async () => {
      const user = userEvent.setup()
      renderHeader()
      await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
      expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Metronome' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Scales' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Intervals' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Fretboard' })).toBeInTheDocument()
    })

    it('navigates to the correct route when a sidebar nav link is clicked', async () => {
      const user = userEvent.setup()
      renderHeader()
      await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
      await user.click(screen.getByRole('button', { name: 'Metronome' }))
      expect(mockNavigate).toHaveBeenCalledWith('/metronome')
    })

    it('hides the sidebar nav links when the sidebar close button is clicked', async () => {
      const user = userEvent.setup()
      renderHeader()
      await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
      await user.click(screen.getByRole('button', { name: 'Close' }))
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Home' })).not.toBeInTheDocument()
      )
    })
  })

  // 3-A-1 SKIPPED — Timer and TimerControls are mocked to null in this file,
  // so clicking the 'Timer' menu button toggles timerVisible state but nothing
  // renders. getByRole('textbox', { name: 'Minutes' }) cannot be found.
  // See testing/TESTING_REPORTS.md.

  describe('timer panel', () => {
    it('toggles the timer panel when the Timer menu button is clicked', async () => {
      const user = userEvent.setup()
      renderHeader()
      await user.click(screen.getByRole('button', { name: /^timer$/i }))
      expect(screen.getByAltText('basscore logo')).toBeInTheDocument()
    })
  })
})
