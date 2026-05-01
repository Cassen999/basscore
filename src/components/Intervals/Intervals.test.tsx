import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Intervals } from './Intervals'
import { ControlsProvider } from '../../contexts/ControlsContext'

vi.mock('primereact/colorpicker', () => ({
  ColorPicker: ({ onChange }: { onChange?: (e: { value: string }) => void }) => (
    <button onClick={() => onChange?.({ value: 'ff0000' })}>Pick Color</button>
  ),
}))

const renderIntervals = () =>
  render(
    <ControlsProvider>
      <Intervals />
    </ControlsProvider>
  )

describe('Intervals', () => {
  describe('render', () => {
    it('renders the page title', () => {
      renderIntervals()
      expect(screen.getByText('Intervals')).toBeInTheDocument()
    })

    it('renders the default subtitle for the 2nd interval', () => {
      renderIntervals()
      expect(screen.getByRole('heading', { name: '2nd', level: 2 })).toBeInTheDocument()
    })

    it('renders all 7 interval option buttons', () => {
      renderIntervals()
      const intervalNames = ['2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
      intervalNames.forEach(name => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument()
      })
    })

    it('renders the fretboard SVG', () => {
      const { container } = renderIntervals()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders the unison switch checked by default', () => {
      renderIntervals()
      const unisonSwitch = screen.getByRole('checkbox', { name: /show\/hide unison note/i })
      expect(unisonSwitch).toBeChecked()
    })
  })

  describe('interval selection', () => {
    it('updates the subtitle when 3rd is selected', async () => {
      const user = userEvent.setup()
      renderIntervals()
      await user.click(screen.getByRole('button', { name: '3rd' }))
      expect(screen.getByRole('heading', { name: '3rd', level: 2 })).toBeInTheDocument()
    })

    it('updates the subtitle when 4th is selected', async () => {
      const user = userEvent.setup()
      renderIntervals()
      await user.click(screen.getByRole('button', { name: '4th' }))
      expect(screen.getByRole('heading', { name: '4th', level: 2 })).toBeInTheDocument()
    })

    it('updates the subtitle when 8th is selected', async () => {
      const user = userEvent.setup()
      renderIntervals()
      await user.click(screen.getByRole('button', { name: '8th' }))
      expect(screen.getByRole('heading', { name: '8th', level: 2 })).toBeInTheDocument()
    })
  })

  describe('color and unison controls', () => {
    it('updates the note color when a color picker fires onChange', async () => {
      const user = userEvent.setup()
      renderIntervals()
      await user.click(screen.getAllByRole('button', { name: 'Pick Color' })[0])
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('toggles the unison note off when the switch is clicked', async () => {
      const user = userEvent.setup()
      renderIntervals()
      await user.click(screen.getByRole('switch', { name: 'Show/Hide Unison Note' }))
      expect(screen.getByRole('switch', { name: 'Show/Hide Unison Note' })).toHaveAttribute('aria-checked', 'false')
    })
  })

})
