import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { getX, getY, getColor, snapToCell, findAvailableFret, mapFretPoints } from './fretboardHelpers'
import type { iCoords, iFretboardConfig } from '../types/types'

const config: iFretboardConfig = {
  width: 700,
  height: 200,
  numFrets: 12,
  numStrings: 4,
  fretpointRadius: 12,
}

// ─────────────────────────────────────────────────────────────────────────────
// getX
// ─────────────────────────────────────────────────────────────────────────────

describe('getX', () => {
  it('returns the left margin for fret index 0', () => {
    // margin = fretpointRadius + maxStroke/2 + 2 = 12 + 1.5 + 2 = 15.5
    expect(getX(0, config)).toBeCloseTo(15.5)
  })

  it('returns the right margin position for the last fret index', () => {
    expect(getX(config.numFrets, config)).toBeCloseTo(700 - 15.5)
  })

  it('returns a value greater than the left margin for fret index > 0', () => {
    expect(getX(6, config)).toBeGreaterThan(getX(0, config))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getY
// ─────────────────────────────────────────────────────────────────────────────

describe('getY', () => {
  it('returns the bottom margin position for string 1', () => {
    expect(getY(1, config)).toBeCloseTo(200 - 15.5)
  })

  it('returns the top margin position for the highest string', () => {
    expect(getY(config.numStrings, config)).toBeCloseTo(15.5)
  })

  it('returns a lower y value (closer to top) as string index increases', () => {
    expect(getY(2, config)).toBeLessThan(getY(1, config))
    expect(getY(3, config)).toBeLessThan(getY(2, config))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getColor
// ─────────────────────────────────────────────────────────────────────────────

describe('getColor', () => {
  it('returns undefined (empty stub)', () => {
    expect(getColor()).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// snapToCell
// ─────────────────────────────────────────────────────────────────────────────

describe('snapToCell', () => {
  it('snaps to string 1, fret 1 when clicking the center of that cell', () => {
    const x = (getX(0, config) + getX(1, config)) / 2
    const y = getY(1, config)
    expect(snapToCell(x, y, config)).toEqual({ string: 1, fret: 1 })
  })

  it('snaps to string 2, fret 2 when clicking the center of that cell', () => {
    const x = (getX(1, config) + getX(2, config)) / 2
    const y = getY(2, config)
    expect(snapToCell(x, y, config)).toEqual({ string: 2, fret: 2 })
  })

  it('snaps to the last fret and top string when clicking that cell center', () => {
    const x = (getX(config.numFrets - 1, config) + getX(config.numFrets, config)) / 2
    const y = getY(config.numStrings, config)
    expect(snapToCell(x, y, config)).toEqual({ string: config.numStrings, fret: config.numFrets })
  })

  it('snaps to the nearest string when clicking between two strings', () => {
    const x = (getX(0, config) + getX(1, config)) / 2
    const midY = (getY(1, config) + getY(2, config)) / 2
    const result = snapToCell(x, midY - 1, config)
    expect(result.string).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// findAvailableFret
// ─────────────────────────────────────────────────────────────────────────────

describe('findAvailableFret', () => {
  it('returns the target fret when it is not occupied', () => {
    expect(findAvailableFret(1, 3, 1, [], 'my-id', config)).toBe(3)
  })

  it('returns the next fret in the given direction when the target is occupied', () => {
    const coords: iCoords[] = [{ id: 'other', string: 1, fret: 3, color: 'red' }]
    expect(findAvailableFret(1, 3, 1, coords, 'my-id', config)).toBe(4)
  })

  it('does not count the dragged dot itself as an occupant (excludeId)', () => {
    const coords: iCoords[] = [{ id: 'my-id', string: 1, fret: 3, color: 'red' }]
    expect(findAvailableFret(1, 3, 1, coords, 'my-id', config)).toBe(3)
  })

  it('reverses direction when no fret is available forward', () => {
    const coords: iCoords[] = Array.from({ length: 10 }, (_, i) => ({
      id: `dot-${i}`,
      string: 1,
      fret: i + 3,
      color: 'red',
    }))
    // frets 3-12 occupied, direction=1, so reverses to find fret 2
    expect(findAvailableFret(1, 3, 1, coords, 'my-id', config)).toBe(2)
  })

  it('returns null when all frets on the string are occupied', () => {
    const coords: iCoords[] = Array.from({ length: 12 }, (_, i) => ({
      id: `dot-${i}`,
      string: 1,
      fret: i + 1,
      color: 'red',
    }))
    expect(findAvailableFret(1, 6, 1, coords, 'my-id', config)).toBeNull()
  })

  it('only checks the specified string', () => {
    const coords: iCoords[] = [{ id: 'other', string: 2, fret: 3, color: 'red' }]
    expect(findAvailableFret(1, 3, 1, coords, 'my-id', config)).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// mapFretPoints
// ─────────────────────────────────────────────────────────────────────────────

describe('mapFretPoints', () => {
  it('returns an empty array for empty coords', () => {
    expect(mapFretPoints([], config)).toHaveLength(0)
  })

  it('renders one SVG circle per coord', () => {
    const coords: iCoords[] = [
      { id: '1', string: 1, fret: 1, color: '#ff0000' },
      { id: '2', string: 2, fret: 3, color: '#0000ff' },
    ]
    const { container } = render(<svg>{mapFretPoints(coords, config)}</svg>)
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })

  it('sets the fill color from the coord', () => {
    const coords: iCoords[] = [{ id: '1', string: 1, fret: 1, color: '#ff0000' }]
    const { container } = render(<svg>{mapFretPoints(coords, config)}</svg>)
    expect(container.querySelector('circle')).toHaveAttribute('fill', '#ff0000')
  })
})
