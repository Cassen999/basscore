import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
  describe('copyright', () => {
    it('renders the copyright notice with the current year', () => {
      render(<Footer />)
      expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Basscore`))).toBeInTheDocument()
    })
  })

  describe('contact', () => {
    it('renders the contact email link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /cassen\.gerber@gmail\.com/i })).toBeInTheDocument()
    })

    it('the contact link points to the correct mailto address', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /cassen\.gerber@gmail\.com/i })).toHaveAttribute(
        'href',
        'mailto:cassen.gerber@gmail.com',
      )
    })
  })

  describe('branding', () => {
    it('renders the Basscore initials image', () => {
      render(<Footer />)
      expect(screen.getByAltText('Basscore initials')).toBeInTheDocument()
    })
  })
})
