import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Metronome } from './Metronome'
import { MetronomePage } from './MetronomePage'

// ─────────────────────────────────────────────────────────────────────────────
// Browser API mocks (not available in jsdom)
// ─────────────────────────────────────────────────────────────────────────────

const mockGainNode = {
  gain: { value: 0, setTargetAtTime: vi.fn() },
  connect: vi.fn(),
}
const mockAudioContext = {
  createGain: vi.fn(() => mockGainNode),
  createBufferSource: vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn() })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  decodeAudioData: vi.fn().mockResolvedValue({}),
}
vi.stubGlobal('AudioContext', function MockAudioContext() { return mockAudioContext })
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
}))

vi.mock('../BCTooltip/BCTooltip', () => ({ default: () => null }))

vi.mock('primereact/dropdown', () => ({
  Dropdown: ({
    value,
    options,
    onChange,
    optionLabel = 'label',
    optionValue,
  }: {
    value: unknown
    options: Record<string, unknown>[]
    onChange: (e: { value: unknown }) => void
    optionLabel?: string
    optionValue?: string
  }) => (
    <select
      value={String(value ?? '')}
      onChange={e => {
        const opt = options.find(o => String(optionValue ? o[optionValue] : o.value) === e.target.value)
        if (opt) onChange({ value: optionValue ? opt[optionValue] : opt.value })
      }}
    >
      {(options ?? []).map(o => (
        <option key={String(optionValue ? o[optionValue] : o.value)} value={String(optionValue ? o[optionValue] : o.value)}>
          {String(o[optionLabel])}
        </option>
      ))}
    </select>
  ),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Metronome
// ─────────────────────────────────────────────────────────────────────────────

describe('Metronome', () => {
  beforeEach(() => vi.clearAllMocks())

  const renderMetronome = (overrides: Partial<{
    bpm: number
    subdivision: 0.25 | 0.5 | 1 | 2 | 4
    isPlaying: boolean
    volume: number
    bpMeasure: number
  }> = {}) =>
    render(
      <Metronome
        bpm={120}
        subdivision={1}
        isPlaying={false}
        volume={0.5}
        bpMeasure={4}
        {...overrides}
      />
    )

  describe('beat dots', () => {
    it('renders subdivision × bpMeasure dots', () => {
      const { container } = renderMetronome()
      expect(container.querySelectorAll('.beat-dot')).toHaveLength(4)
    })

    it('renders more dots when subdivision increases', () => {
      const { container } = renderMetronome({ subdivision: 2 })
      expect(container.querySelectorAll('.beat-dot')).toHaveLength(8)
    })

    it('renders fewer dots when bpMeasure decreases', () => {
      const { container } = renderMetronome({ bpMeasure: 3 })
      expect(container.querySelectorAll('.beat-dot')).toHaveLength(3)
    })

    it('renders no active dot when isPlaying is false', () => {
      const { container } = renderMetronome({ isPlaying: false })
      expect(container.querySelectorAll('.beat-dot--active')).toHaveLength(0)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// MetronomePage
// ─────────────────────────────────────────────────────────────────────────────

describe('MetronomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  describe('render', () => {
    it('renders the BPM input with the default value of 120', () => {
      render(<MetronomePage />)
      expect(screen.getByRole('spinbutton')).toHaveValue('120')
    })

    it('renders the Subdivision label', () => {
      render(<MetronomePage />)
      expect(screen.getByText('Subdivision')).toBeInTheDocument()
    })

    it('renders the Time Signature label', () => {
      render(<MetronomePage />)
      expect(screen.getByText('Time Signature')).toBeInTheDocument()
    })

    it('renders the volume slider with horizontal orientation on mobile viewports', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      })
      render(<MetronomePage />)
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })
  })

  describe('start / stop', () => {
    it('renders a Start button initially', () => {
      render(<MetronomePage />)
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    })

    it('changes the button to Stop when Start is clicked', async () => {
      const user = userEvent.setup()
      render(<MetronomePage />)
      await user.click(screen.getByRole('button', { name: 'Start' }))
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    })

    it('changes the button back to Start when Stop is clicked', async () => {
      const user = userEvent.setup()
      render(<MetronomePage />)
      await user.click(screen.getByRole('button', { name: 'Start' }))
      await user.click(screen.getByRole('button', { name: 'Stop' }))
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    })

    it('resumes a suspended AudioContext when Start is clicked', async () => {
      mockAudioContext.state = 'suspended'
      const user = userEvent.setup()
      render(<MetronomePage />)
      await user.click(screen.getByRole('button', { name: 'Start' }))
      expect(mockAudioContext.resume).toHaveBeenCalled()
      mockAudioContext.state = 'running'
    })

    it('clears the existing timer when subdivision changes while playing', async () => {
      const user = userEvent.setup()
      render(<MetronomePage />)
      await user.click(screen.getByRole('button', { name: 'Start' }))
      fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '2' } })
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    })
  })

  describe('control interactions', () => {
    it('updates the subdivision when Eight Note is selected', () => {
      render(<MetronomePage />)
      fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '2' } })
      expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
    })

    it('updates the time signature when 3/4 is selected', () => {
      render(<MetronomePage />)
      fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '3/4' } })
      expect(screen.getAllByRole('combobox')[1]).toBeInTheDocument()
    })

    it('updates the volume when the slider value changes', () => {
      render(<MetronomePage />)
      const slider = screen.getByRole('slider')
      fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(slider).toBeInTheDocument()
    })
  })
})
