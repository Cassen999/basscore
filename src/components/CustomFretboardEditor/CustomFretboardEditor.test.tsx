import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CustomFretboardEditor from './CustomFretboardEditor'
import type { iFretboardConfig } from '../../types/types'

const defaultConfig: iFretboardConfig = {
  width: 700,
  height: 200,
  numFrets: 12,
  numStrings: 4,
  fretpointRadius: 12,
}

const renderEditor = (overrides: Record<string, unknown> = {}) => {
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
      isMobile
      {...overrides}
    />,
  )
}

const fireTouchStart = (el: Element, x = 100, y = 100) =>
  fireEvent.touchStart(el, { targetTouches: [{ clientX: x, clientY: y }] })

const fireTouchMove = (el: Element, x = 100, y = 100) =>
  fireEvent.touchMove(el, { targetTouches: [{ clientX: x, clientY: y }] })

const fireTouchEnd = (el: Element) => fireEvent.touchEnd(el)

describe('CustomFretboardEditor — touch interactions', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls onContextMenuDismiss and does nothing else when context menu is open on touchstart', () => {
    const onContextMenuDismiss = vi.fn()
    const onTouchTapCell = vi.fn()
    const onLongPressCell = vi.fn()
    renderEditor({ isContextMenuOpen: true, onContextMenuDismiss, onTouchTapCell, onLongPressCell })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })
    fireTouchStart(cell)
    vi.advanceTimersByTime(1500)
    fireTouchEnd(cell)
    expect(onContextMenuDismiss).toHaveBeenCalledOnce()
    expect(onTouchTapCell).not.toHaveBeenCalled()
    expect(onLongPressCell).not.toHaveBeenCalled()
  })

  it('fires onTouchTapCell on short tap on empty cell', () => {
    const onTouchTapCell = vi.fn()
    renderEditor({ onTouchTapCell, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })
    fireTouchStart(cell)
    vi.advanceTimersByTime(200)
    fireTouchEnd(cell)
    expect(onTouchTapCell).toHaveBeenCalledWith(1, 1)
  })

  it('does not fire the long-press timer on short tap', () => {
    const onLongPressCell = vi.fn()
    renderEditor({ onLongPressCell, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })
    fireTouchStart(cell)
    vi.advanceTimersByTime(200)
    fireTouchEnd(cell)
    expect(onLongPressCell).not.toHaveBeenCalled()
  })

  it('calls onLongPressCell and navigator.vibrate on long press of empty cell', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    const onLongPressCell = vi.fn()
    renderEditor({ onLongPressCell, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })
    fireTouchStart(cell, 100, 100)
    vi.advanceTimersByTime(1001)
    expect(vibrate).toHaveBeenCalledWith(50)
    expect(onLongPressCell).toHaveBeenCalledWith(1, 1, 100, 100)
  })

  it('cancels long-press timer when movement > 8px on empty cell', () => {
    const onLongPressCell = vi.fn()
    const onTouchTapCell = vi.fn()
    renderEditor({ onLongPressCell, onTouchTapCell, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — empty' })
    fireTouchStart(cell, 100, 100)
    fireTouchMove(cell, 115, 100)
    vi.advanceTimersByTime(1500)
    fireTouchEnd(cell)
    expect(onLongPressCell).not.toHaveBeenCalled()
    expect(onTouchTapCell).not.toHaveBeenCalled()
  })

  it('does not cancel long-press timer on movement for occupied cell', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    const onLongPressDot = vi.fn()
    const coords = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
    renderEditor({ coords, onLongPressDot, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' })
    fireTouchStart(cell, 100, 100)
    fireTouchMove(cell, 115, 100)
    vi.advanceTimersByTime(1001)
    expect(onLongPressDot).toHaveBeenCalledWith('dot-1', 100, 100)
  })

  it('calls onLongPressDot and navigator.vibrate on long press of occupied cell', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    const onLongPressDot = vi.fn()
    const coords = [{ id: 'dot-1', string: 2, fret: 3, color: 'red' }]
    renderEditor({ coords, onLongPressDot, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 2, Fret 3 — occupied' })
    fireTouchStart(cell, 50, 60)
    vi.advanceTimersByTime(1001)
    expect(vibrate).toHaveBeenCalledWith(50)
    expect(onLongPressDot).toHaveBeenCalledWith('dot-1', 50, 60)
  })

  it('does not fire onTouchTapCell on occupied cell short tap', () => {
    const onTouchTapCell = vi.fn()
    const coords = [{ id: 'dot-1', string: 1, fret: 1, color: 'red' }]
    renderEditor({ coords, onTouchTapCell, longPressThreshold: 1000 })
    const cell = screen.getByRole('button', { name: 'String 1, Fret 1 — occupied' })
    fireTouchStart(cell)
    vi.advanceTimersByTime(200)
    fireTouchEnd(cell)
    expect(onTouchTapCell).not.toHaveBeenCalled()
  })
})

describe('CustomFretboardEditor — rotated layout', () => {
  it('SVG width equals fretboardConfig.height when rotated=true', () => {
    const { container } = renderEditor({ rotated: true })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe(String(defaultConfig.height))
  })

  it('SVG height equals fretboardConfig.width when rotated=true', () => {
    const { container } = renderEditor({ rotated: true })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('height')).toBe(String(defaultConfig.width))
  })

  it('fret lines have equal y1 and y2 (horizontal) when rotated=true', () => {
    const { container } = renderEditor({ rotated: true })
    const fretLines = container.querySelectorAll('.fret-lines')
    fretLines.forEach(line => {
      expect(line.getAttribute('y1')).toBe(line.getAttribute('y2'))
    })
  })

  it('string lines have equal x1 and x2 (vertical) when rotated=true', () => {
    const { container } = renderEditor({ rotated: true })
    const stringLines = container.querySelectorAll('.string-lines')
    stringLines.forEach(line => {
      expect(line.getAttribute('x1')).toBe(line.getAttribute('x2'))
    })
  })

  it('SVG width equals fretboardConfig.width when rotated=false', () => {
    const { container } = renderEditor({ rotated: false })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe(String(defaultConfig.width))
  })
})
