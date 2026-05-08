import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ControlsProvider, useControls } from './ControlsContext'

const Consumer = ({ field }: { field: string }) => {
  const ctx = useControls()
  return <span data-testid='value'>{String((ctx as unknown as Record<string, unknown>)[field])}</span>
}

const renderWithProvider = (field: string) =>
  render(
    <ControlsProvider>
      <Consumer field={field} />
    </ControlsProvider>,
  )

describe('ControlsContext', () => {
  it('provides longPressThreshold with default value 1000', () => {
    renderWithProvider('longPressThreshold')
    expect(screen.getByTestId('value')).toHaveTextContent('1000')
  })

  it('updates longPressThreshold via setLongPressThreshold', () => {
    const Setter = () => {
      const { setLongPressThreshold, longPressThreshold } = useControls()
      return (
        <>
          <span data-testid='value'>{longPressThreshold}</span>
          <button onClick={() => setLongPressThreshold(500)}>set</button>
        </>
      )
    }
    render(
      <ControlsProvider>
        <Setter />
      </ControlsProvider>,
    )
    expect(screen.getByTestId('value')).toHaveTextContent('1000')
    act(() => screen.getByRole('button').click())
    expect(screen.getByTestId('value')).toHaveTextContent('500')
  })
})
