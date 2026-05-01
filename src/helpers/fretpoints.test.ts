import { describe, it, expect } from 'vitest'
import { createScale, createInterval } from './fretpoints'

const colors = { root: 'red', interval: 'blue', unison: 'green' }

// ─────────────────────────────────────────────────────────────────────────────
// createScale
// ─────────────────────────────────────────────────────────────────────────────

describe('createScale', () => {
  it('returns 12 coords for the major scale', () => {
    expect(createScale({ scaleType: 'major', noteColor: '#ff0000' })).toHaveLength(12)
  })

  it('returns 12 coords for the dorian scale', () => {
    expect(createScale({ scaleType: 'dorian', noteColor: '#ff0000' })).toHaveLength(12)
  })

  it('returns 12 coords for the phrygian scale', () => {
    expect(createScale({ scaleType: 'phrygian', noteColor: '#ff0000' })).toHaveLength(12)
  })

  it('returns 12 coords for the lydian scale', () => {
    expect(createScale({ scaleType: 'lydian', noteColor: '#ff0000' })).toHaveLength(12)
  })

  it('returns 12 coords for the mixolydian scale', () => {
    expect(createScale({ scaleType: 'mixolydian', noteColor: '#ff0000' })).toHaveLength(12)
  })

  it('returns 12 coords for the minor scale', () => {
    expect(createScale({ scaleType: 'minor', noteColor: '#ff0000' })).toHaveLength(12)
  })

  it('returns 12 coords for the locrian scale', () => {
    expect(createScale({ scaleType: 'locrian', noteColor: '#ff0000' })).toHaveLength(12)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// createInterval
// ─────────────────────────────────────────────────────────────────────────────

describe('createInterval', () => {
  it('returns 3 coords for interval 5 with correct string positions', () => {
    const result = createInterval({ interval: 5, colors })
    expect(result).toHaveLength(3)
    expect(result[2].string).toBe(3) // unisonString(5) = 3
  })

  it('returns 3 coords for interval 6 with correct string positions', () => {
    const result = createInterval({ interval: 6, colors })
    expect(result).toHaveLength(3)
    expect(result[2].string).toBe(3) // unisonString(6) = 3
  })

  it('returns correct string positions for interval 7 non-flat', () => {
    const result = createInterval({ interval: 7, colors })
    expect(result[1].string).toBe(3) // intervalString(7, flat=false) = 3
    expect(result[2].string).toBe(4) // unisonString(7, flat=false) = 4
  })

  it('returns correct string positions for interval 7 flat', () => {
    const result = createInterval({ interval: 7, flat: true, colors })
    expect(result[1].string).toBe(2) // intervalString(7, flat=true) = 2
    expect(result[2].string).toBe(3) // unisonString(7, flat=true) = 3
  })

  it('returns 2 coords when unison is false', () => {
    const result = createInterval({ interval: 2, unison: false, colors })
    expect(result).toHaveLength(2)
  })
})
