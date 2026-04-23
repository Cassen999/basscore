import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import BCTooltip from './BCTooltip'

vi.mock('primereact/tooltip', () => ({
  Tooltip: () => <div data-testid="bc-tooltip" />,
}))

function makeMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = []
  return {
    matches,
    addEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
      listeners.push(handler)
    }),
    removeEventListener: vi.fn(),
    trigger: (newMatches: boolean) => {
      listeners.forEach(fn => fn({ matches: newMatches } as MediaQueryListEvent))
    },
  }
}

describe('BCTooltip', () => {
  let mq: ReturnType<typeof makeMatchMedia>

  beforeEach(() => {
    mq = makeMatchMedia(false)
    Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockReturnValue(mq) })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('desktop viewport (> 768px)', () => {
    it('renders the tooltip', () => {
      render(<BCTooltip target=".some-target" />)
      expect(screen.getByTestId('bc-tooltip')).toBeInTheDocument()
    })
  })

  describe('mobile viewport (≤ 768px)', () => {
    beforeEach(() => {
      mq = makeMatchMedia(true)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockReturnValue(mq) })
    })

    it('renders nothing', () => {
      render(<BCTooltip target=".some-target" />)
      expect(screen.queryByTestId('bc-tooltip')).not.toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('hides the tooltip when viewport shrinks to mobile', () => {
      render(<BCTooltip target=".some-target" />)
      expect(screen.getByTestId('bc-tooltip')).toBeInTheDocument()

      act(() => { mq.trigger(true) })

      expect(screen.queryByTestId('bc-tooltip')).not.toBeInTheDocument()
    })

    it('shows the tooltip when viewport grows to desktop', () => {
      mq = makeMatchMedia(true)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockReturnValue(mq) })

      render(<BCTooltip target=".some-target" />)
      expect(screen.queryByTestId('bc-tooltip')).not.toBeInTheDocument()

      act(() => { mq.trigger(false) })

      expect(screen.getByTestId('bc-tooltip')).toBeInTheDocument()
    })
  })

  describe('cleanup', () => {
    it('removes the media query listener on unmount', () => {
      const { unmount } = render(<BCTooltip target=".some-target" />)
      unmount()
      expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
