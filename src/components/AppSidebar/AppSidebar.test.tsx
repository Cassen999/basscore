import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import AppSidebar from './AppSidebar'

vi.mock('primereact/sidebar', () => ({
  Sidebar: ({
    visible,
    onHide,
    position,
    children,
    className,
  }: {
    visible: boolean
    onHide: () => void
    position?: string
    children: React.ReactNode
    className?: string
  }) =>
    visible ? (
      <div data-testid='sidebar' data-position={position} className={className ?? ''}>
        {children}
        <button data-testid='sidebar-close' onClick={onHide}>
          close
        </button>
      </div>
    ) : null,
}))

describe('AppSidebar', () => {
  it('renders children when visible', () => {
    render(
      <AppSidebar visible onHide={vi.fn()}>
        <span>Controls here</span>
      </AppSidebar>,
    )
    expect(screen.getByText('Controls here')).toBeInTheDocument()
  })

  it('renders the bass guitar image', () => {
    render(
      <AppSidebar visible onHide={vi.fn()}>
        <div />
      </AppSidebar>,
    )
    expect(screen.getByAltText('Bass guitar')).toBeInTheDocument()
  })

  it('calls onHide when Sidebar fires its close event', async () => {
    const user = userEvent.setup()
    const onHide = vi.fn()
    render(
      <AppSidebar visible onHide={onHide}>
        <div />
      </AppSidebar>,
    )
    await user.click(screen.getByTestId('sidebar-close'))
    expect(onHide).toHaveBeenCalledOnce()
  })

  it('forwards position prop to the underlying Sidebar', () => {
    render(
      <AppSidebar visible onHide={vi.fn()} position='left'>
        <div />
      </AppSidebar>,
    )
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-position', 'left')
  })

  it('does not render when visible=false', () => {
    render(
      <AppSidebar visible={false} onHide={vi.fn()}>
        <span>hidden</span>
      </AppSidebar>,
    )
    expect(screen.queryByText('hidden')).not.toBeInTheDocument()
  })
})
