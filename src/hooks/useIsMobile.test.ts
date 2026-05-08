import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIsMobile } from './useIsMobile'

const createMockMediaQuery = (matches: boolean) => {
  const listeners: ((e: MediaQueryListEvent) => void)[] = []
  const mq = {
    matches,
    addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb)
    }),
    removeEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx !== -1) listeners.splice(idx, 1)
    }),
    dispatchChange: (newMatches: boolean) => {
      listeners.forEach(cb => cb({ matches: newMatches } as MediaQueryListEvent))
    },
  }
  return mq
}

describe('useIsMobile', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns true when media query matches', () => {
    const mq = createMockMediaQuery(true)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false when media query does not match', () => {
    const mq = createMockMediaQuery(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('updates when media query changes', () => {
    const mq = createMockMediaQuery(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    act(() => mq.dispatchChange(true))
    expect(result.current).toBe(true)
  })

  it('registers and removes the listener on mount/unmount', () => {
    const mq = createMockMediaQuery(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
    const { unmount } = renderHook(() => useIsMobile())
    expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    unmount()
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
