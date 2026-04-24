import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import ControlPanel from './ControlPanel'
import { ControlsProvider, useControls } from '../../contexts/ControlsContext'

const ContextReader = ({ selector }: { selector: (ctx: ReturnType<typeof useControls>) => string | number | boolean }) => {
  const ctx = useControls()
  return <output>{String(selector(ctx))}</output>
}

describe('ControlPanel', () => {
  describe('element groups', () => {
    it('renders a group title', () => {
      render(
        <ControlPanel
          elements={[{ title: 'Scale', elements: [<div key="1">content</div>] }]}
        />
      )
      expect(screen.getByText('Scale')).toBeInTheDocument()
    })

    it('renders elements within a group', () => {
      render(
        <ControlPanel
          elements={[{ title: 'Scale', elements: [<button key="1">Major</button>] }]}
        />
      )
      expect(screen.getByRole('button', { name: 'Major' })).toBeInTheDocument()
    })

    it('renders multiple groups', () => {
      render(
        <ControlPanel
          elements={[
            { title: 'Scale', elements: [<div key="1">a</div>] },
            { title: 'Note Color', elements: [<div key="2">b</div>] },
          ]}
        />
      )
      expect(screen.getByText('Scale')).toBeInTheDocument()
      expect(screen.getByText('Note Color')).toBeInTheDocument()
    })

    it('renders all elements within a group', () => {
      render(
        <ControlPanel
          elements={[{
            title: 'Options',
            elements: [
              <button key="1">One</button>,
              <button key="2">Two</button>,
            ],
          }]}
        />
      )
      expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument()
    })
  })

  describe('plain ReactNode elements', () => {
    it('renders plain ReactNode elements directly', () => {
      render(
        <ControlPanel elements={[<button key="1">Click me</button>]} />
      )
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })
  })

  describe('card header', () => {
    it('renders the card header when provided', () => {
      render(
        <ControlPanel
          cardProps={{ header: 'Fretboard Controls' }}
          elements={[]}
        />
      )
      expect(screen.getByText('Fretboard Controls')).toBeInTheDocument()
    })
  })

  describe('interactive controls', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('calls onClick when a button control is clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <ControlPanel
          elements={[{
            title: 'Actions',
            elements: [<button key="1" onClick={handleClick}>Submit</button>],
          }]}
        />
      )
      await user.click(screen.getByRole('button', { name: 'Submit' }))
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('calls onChange when a checkbox control is toggled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(
        <ControlPanel
          elements={[{
            title: 'Options',
            elements: [<input key="1" type="checkbox" aria-label="Enable" onChange={handleChange} />],
          }]}
        />
      )
      await user.click(screen.getByRole('checkbox', { name: 'Enable' }))
      expect(handleChange).toHaveBeenCalledOnce()
    })
  })

  describe('context state updates', () => {
    it('updates displayedScales when a control calls setDisplayedScales', async () => {
      const user = userEvent.setup()
      const ScaleButton = () => {
        const { setDisplayedScales } = useControls()
        return <button onClick={() => setDisplayedScales('minor')}>Set Minor</button>
      }
      render(
        <ControlsProvider>
          <ControlPanel
            elements={[{ title: 'Scale', elements: [<ScaleButton key="1" />] }]}
          />
          <ContextReader selector={ctx => ctx.displayedScales} />
        </ControlsProvider>
      )
      expect(screen.getByRole('status')).toHaveTextContent('major')
      await user.click(screen.getByRole('button', { name: 'Set Minor' }))
      expect(screen.getByRole('status')).toHaveTextContent('minor')
    })

    it('updates showUnison when a control calls setShowUnison', async () => {
      const user = userEvent.setup()
      const UnisonToggle = () => {
        const { setShowUnison, showUnison } = useControls()
        return <button onClick={() => setShowUnison(!showUnison)}>Toggle Unison</button>
      }
      render(
        <ControlsProvider>
          <ControlPanel
            elements={[{ title: 'Unison', elements: [<UnisonToggle key="1" />] }]}
          />
          <ContextReader selector={ctx => ctx.showUnison} />
        </ControlsProvider>
      )
      expect(screen.getByRole('status')).toHaveTextContent('true')
      await user.click(screen.getByRole('button', { name: 'Toggle Unison' }))
      expect(screen.getByRole('status')).toHaveTextContent('false')
    })

    it('updates interval when a control calls setInterval', async () => {
      const user = userEvent.setup()
      const IntervalButton = () => {
        const { setInterval } = useControls()
        return <button onClick={() => setInterval(5)}>Set 5th</button>
      }
      render(
        <ControlsProvider>
          <ControlPanel
            elements={[{ title: 'Interval', elements: [<IntervalButton key="1" />] }]}
          />
          <ContextReader selector={ctx => ctx.interval} />
        </ControlsProvider>
      )
      expect(screen.getByRole('status')).toHaveTextContent('2')
      await user.click(screen.getByRole('button', { name: 'Set 5th' }))
      expect(screen.getByRole('status')).toHaveTextContent('5')
    })
  })
})
