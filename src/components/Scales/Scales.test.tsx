import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Scales } from './Scales'
import { ControlsProvider } from '../../contexts/ControlsContext'

const renderScales = () =>
  render(
    <ControlsProvider>
      <Scales />
    </ControlsProvider>
  )

describe('Scales', () => {
  describe('render', () => {
    it('renders the page title', () => {
      renderScales()
      expect(screen.getByText('Scales and Positions')).toBeInTheDocument()
    })

    it('renders all 7 scale option buttons', () => {
      renderScales()
      const scaleNames = ['Major', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Minor', 'Locrian']
      scaleNames.forEach(name => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument()
      })
    })

    it('renders the subtitle for the default Major scale', () => {
      renderScales()
      expect(screen.getByText('Major (Position 1)')).toBeInTheDocument()
    })

    it('renders the fretboard SVG', () => {
      const { container } = renderScales()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('scale selection', () => {
    it('updates the subtitle when Minor is selected', async () => {
      const user = userEvent.setup()
      renderScales()
      await user.click(screen.getByRole('button', { name: 'Minor' }))
      expect(screen.getByText('Minor (Position 6)')).toBeInTheDocument()
    })

    it('updates the subtitle when Dorian is selected', async () => {
      const user = userEvent.setup()
      renderScales()
      await user.click(screen.getByRole('button', { name: 'Dorian' }))
      expect(screen.getByText('Dorian (Position 2)')).toBeInTheDocument()
    })

    it('updates the subtitle when Locrian is selected', async () => {
      const user = userEvent.setup()
      renderScales()
      await user.click(screen.getByRole('button', { name: 'Locrian' }))
      expect(screen.getByText('Locrian (Position 7)')).toBeInTheDocument()
    })
  })
})
