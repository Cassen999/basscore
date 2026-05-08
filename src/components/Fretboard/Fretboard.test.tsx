import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Fretboard from './Fretboard'
import { ControlsProvider } from '../../contexts/ControlsContext'
import type { iCoords } from '../../types/types'

const renderFretboard = (props?: { coords?: iCoords[] }) =>
  render(
    <ControlsProvider>
      <Fretboard {...props} />
    </ControlsProvider>
  )

describe('Fretboard', () => {
  describe('labels', () => {
    it('renders the Nut label', () => {
      renderFretboard()
      expect(screen.getByText('Nut')).toBeInTheDocument()
    })

    it('renders the Bridge label', () => {
      renderFretboard()
      expect(screen.getByText('Bridge')).toBeInTheDocument()
    })
  })

  describe('SVG structure', () => {
    it('renders an SVG with dimensions from fretboardConfig', () => {
      const { container } = renderFretboard()
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '700')
      expect(svg).toHaveAttribute('height', '200')
    })

    it('renders numFrets + 1 fret lines', () => {
      const { container } = renderFretboard()
      // default numFrets is 5
      expect(container.querySelectorAll('.fret-lines')).toHaveLength(6)
    })

    it('renders numStrings string lines', () => {
      const { container } = renderFretboard()
      // default numStrings is 4
      expect(container.querySelectorAll('.string-lines')).toHaveLength(4)
    })
  })

  describe('fret points', () => {
    it('renders no circles when coords is not provided', () => {
      const { container } = renderFretboard()
      expect(container.querySelectorAll('circle')).toHaveLength(0)
    })

    it('renders no circles when coords is an empty array', () => {
      const { container } = renderFretboard({ coords: [] })
      expect(container.querySelectorAll('circle')).toHaveLength(0)
    })

    it('renders one circle per coord', () => {
      const coords: iCoords[] = [
        { string: 1, fret: 1, color: 'red' },
        { string: 2, fret: 3, color: 'blue' },
        { string: 3, fret: 5, color: 'green' },
      ]
      const { container } = renderFretboard({ coords })
      expect(container.querySelectorAll('circle')).toHaveLength(3)
    })

    it('renders circles with the correct fill color from coords', () => {
      const coords: iCoords[] = [
        { string: 1, fret: 1, color: 'red' },
        { string: 2, fret: 2, color: 'blue' },
      ]
      const { container } = renderFretboard({ coords })
      const circles = container.querySelectorAll('circle')
      expect(circles[0]).toHaveAttribute('fill', 'red')
      expect(circles[1]).toHaveAttribute('fill', 'blue')
    })
  })
})
