import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Timer } from './Timer'
import { TimerControls } from './TimerControls'
import { TimerProvider, useTimer } from '../../contexts/TimerContext'
import type { ReactElement } from 'react'

const renderWithTimer = (ui: ReactElement) =>
  render(<TimerProvider>{ui}</TimerProvider>)

// ─────────────────────────────────────────────────────────────────────────────
// Timer
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders timer content when visible', () => {
    renderWithTimer(<Timer visible={true} onHide={vi.fn()} anchorRect={null} />)
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument()
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument()
  })

  it('does not render timer content when not visible', () => {
    renderWithTimer(<Timer visible={false} onHide={vi.fn()} anchorRect={null} />)
    expect(screen.queryByLabelText('Minutes')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Seconds')).not.toBeInTheDocument()
  })

  it('renders with a positioned style when anchorRect is provided', () => {
    const mockRect = { bottom: 100, left: 200, width: 150 } as DOMRect
    renderWithTimer(<Timer visible={true} onHide={vi.fn()} anchorRect={mockRect} />)
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TimerControls
// ─────────────────────────────────────────────────────────────────────────────

describe('TimerControls', () => {
  beforeEach(() => vi.clearAllMocks())

  const renderControls = () => renderWithTimer(<TimerControls />)

  describe('render', () => {
    it('renders minutes and seconds inputs showing 00:00 initially', () => {
      renderControls()
      expect(screen.getByLabelText('Minutes')).toHaveValue('00')
      expect(screen.getByLabelText('Seconds')).toHaveValue('00')
    })

    it('renders the Start button disabled when no duration is set', () => {
      renderControls()
      expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
    })

    it('renders Reset and Clear buttons disabled when no duration is set', () => {
      renderControls()
      expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
    })

    it('renders the time pill buttons', () => {
      renderControls()
      expect(screen.getByRole('button', { name: '+30s' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+1 min' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+2 min' })).toBeInTheDocument()
    })
  })

  describe('pill buttons', () => {
    it('continues running and updates duration when a pill is clicked while the timer is running', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      await user.click(screen.getByRole('button', { name: '+30s' }))
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Stop' }))
      await user.click(screen.getByRole('button', { name: 'Reset' }))
      expect(screen.getByLabelText('Minutes')).toHaveValue('01')
      expect(screen.getByLabelText('Seconds')).toHaveValue('30')
    })

    it('adds 30 seconds when +30s is clicked', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+30s' }))
      expect(screen.getByLabelText('Seconds')).toHaveValue('30')
    })

    it('adds 1 minute when +1 min is clicked', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      expect(screen.getByLabelText('Minutes')).toHaveValue('01')
      expect(screen.getByLabelText('Seconds')).toHaveValue('00')
    })

    it('adds 2 minutes when +2 min is clicked', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+2 min' }))
      expect(screen.getByLabelText('Minutes')).toHaveValue('02')
      expect(screen.getByLabelText('Seconds')).toHaveValue('00')
    })

    it('enables Start, Reset, and Clear after adding time via pill', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+30s' }))
      expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled()
    })
  })

  describe('start / stop', () => {
    it('changes Start to Stop when timer is started', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    })

    it('changes Stop back to Start when timer is paused', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      await user.click(screen.getByRole('button', { name: 'Stop' }))
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    })

    it('disables the time inputs while the timer is running', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      expect(screen.getByLabelText('Minutes')).toBeDisabled()
      expect(screen.getByLabelText('Seconds')).toBeDisabled()
    })
  })

  describe('reset / clear', () => {
    it('enables Reset and Clear when a duration is set', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled()
    })

    it('resets to combined duration when a pill is added before starting', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: '+30s' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      await user.click(screen.getByRole('button', { name: 'Stop' }))
      await user.click(screen.getByRole('button', { name: 'Reset' }))
      expect(screen.getByLabelText('Minutes')).toHaveValue('01')
      expect(screen.getByLabelText('Seconds')).toHaveValue('30')
    })

    it('resets display to original duration when Reset is clicked after pausing', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      await user.click(screen.getByRole('button', { name: 'Stop' }))
      await user.click(screen.getByRole('button', { name: 'Reset' }))
      expect(screen.getByLabelText('Minutes')).toHaveValue('01')
      expect(screen.getByLabelText('Seconds')).toHaveValue('00')
    })

    it('resets display to 00:00 when Clear is clicked', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Clear' }))
      expect(screen.getByLabelText('Minutes')).toHaveValue('00')
      expect(screen.getByLabelText('Seconds')).toHaveValue('00')
    })

    it('disables Start after Clear', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Clear' }))
      expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
    })
  })

  describe('time input', () => {
    it('updates the timer when a value is typed in the minutes input', async () => {
      const user = userEvent.setup()
      renderControls()
      const minutesInput = screen.getByRole('textbox', { name: 'Minutes' })
      await user.click(minutesInput)
      await user.clear(minutesInput)
      await user.type(minutesInput, '02')
      await user.tab()
      expect(minutesInput).toHaveValue('02')
    })

    it('updates the timer when a value is typed in the seconds input', async () => {
      const user = userEvent.setup()
      renderControls()
      const secondsInput = screen.getByRole('textbox', { name: 'Seconds' })
      await user.click(secondsInput)
      await user.clear(secondsInput)
      await user.type(secondsInput, '30')
      await user.tab()
      expect(secondsInput).toHaveValue('30')
    })

    it('treats empty minutes input as 0 when blurred without typing', async () => {
      const user = userEvent.setup()
      renderControls()
      const minutesInput = screen.getByRole('textbox', { name: 'Minutes' })
      await user.click(minutesInput)
      await user.clear(minutesInput)
      await user.tab()
      expect(minutesInput).toHaveValue('00')
    })
  })

  describe('restart from pause', () => {
    it('resumes playing when Start is clicked after pausing', async () => {
      const user = userEvent.setup()
      renderControls()
      await user.click(screen.getByRole('button', { name: '+1 min' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      await user.click(screen.getByRole('button', { name: 'Stop' }))
      await user.click(screen.getByRole('button', { name: 'Start' }))
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TimerContext
// ─────────────────────────────────────────────────────────────────────────────

describe('TimerContext', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when useTimer is called outside TimerProvider', () => {
    const Consumer = () => { useTimer(); return null }
    expect(() => render(<Consumer />)).toThrow('useTimer must be used within a TimerProvider')
  })

  it('restart sets status to running after pausing', async () => {
    const user = userEvent.setup()
    const TestConsumer = () => {
      const { start, pause, restart, status } = useTimer()
      return (
        <>
          <button onClick={start}>Start</button>
          <button onClick={pause}>Pause</button>
          <button onClick={restart}>Restart</button>
          <span data-testid='status'>{status}</span>
        </>
      )
    }
    render(<TimerProvider><TestConsumer /></TimerProvider>)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: 'Restart' }))
    expect(screen.getByTestId('status')).toHaveTextContent('running')
  })

  it('decrements the displayed time while running', () => {
    vi.useFakeTimers()
    const TestConsumer = () => {
      const { start, setDuration, formattedTime } = useTimer()
      return (
        <>
          <button onClick={() => { setDuration(60); start() }}>Go</button>
          <span data-testid='time'>{formattedTime}</span>
        </>
      )
    }
    render(<TimerProvider><TestConsumer /></TimerProvider>)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Go' })) })
    act(() => { vi.advanceTimersByTime(1100) })
    expect(screen.getByTestId('time').textContent).not.toBe('01:00')
    vi.useRealTimers()
  })
})
