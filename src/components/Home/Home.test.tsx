import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Home } from './Home'
import { HomeContainer } from './HomeContainer'

vi.mock('../BCTooltip/BCTooltip', () => ({
  default: () => null,
}))

vi.mock('../Header/Header', () => ({
  Header: () => <header data-testid="header" />,
}))

vi.mock('../Footer/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderHome = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

  describe('hero section', () => {
    it('renders the main heading', () => {
      renderHome()
      expect(screen.getByRole('heading', { name: /learn bass guitar with basscore/i })).toBeInTheDocument()
    })

    it('renders the featured bassists', () => {
      renderHome()
      expect(screen.getByText('Jaco Pastorius')).toBeInTheDocument()
      expect(screen.getByText('Flea')).toBeInTheDocument()
      expect(screen.getByText('Cassen Gerber')).toBeInTheDocument()
    })
  })

  describe('feature cards', () => {
    it('renders a card for Metronome', () => {
      renderHome()
      expect(screen.getByText('Metronome')).toBeInTheDocument()
    })

    it('renders a card for Scales', () => {
      renderHome()
      expect(screen.getByText('Scales')).toBeInTheDocument()
    })

    it('renders a card for Intervals', () => {
      renderHome()
      expect(screen.getByText('Intervals')).toBeInTheDocument()
    })

    it('renders three Get Started buttons', () => {
      renderHome()
      expect(screen.getAllByRole('button', { name: /get started/i })).toHaveLength(3)
    })
  })

  describe('navigation', () => {
    it('navigates to /metronome when the Metronome Get Started button is clicked', async () => {
      const user = userEvent.setup()
      renderHome()
      await user.click(screen.getAllByRole('button', { name: /get started/i })[0])
      expect(mockNavigate).toHaveBeenCalledWith('/metronome')
    })

    it('navigates to /scales when the Scales Get Started button is clicked', async () => {
      const user = userEvent.setup()
      renderHome()
      await user.click(screen.getAllByRole('button', { name: /get started/i })[1])
      expect(mockNavigate).toHaveBeenCalledWith('/scales')
    })

    it('navigates to /intervals when the Intervals Get Started button is clicked', async () => {
      const user = userEvent.setup()
      renderHome()
      await user.click(screen.getAllByRole('button', { name: /get started/i })[2])
      expect(mockNavigate).toHaveBeenCalledWith('/intervals')
    })
  })
})

// ---------------------------------------------------------------------------
// HomeContainer
// ---------------------------------------------------------------------------

describe('HomeContainer', () => {
  describe('layout', () => {
    const renderHomeContainer = () =>
      render(
        <MemoryRouter>
          <HomeContainer />
        </MemoryRouter>
      )

    it('renders the header', () => {
      renderHomeContainer()
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('renders the footer', () => {
      renderHomeContainer()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders the main section', () => {
      renderHomeContainer()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('Outlet', () => {
    it('renders child route content inside the main section', () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="/" element={<HomeContainer />}>
              <Route path="home" element={<div>Child Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })
  })
})
