'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features',     href: '/#features'     },
  { label: 'FAQ',          href: '/#faq'           },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300
                        ${scrolled
                          ? 'bg-sage-800/95 backdrop-blur-md shadow-raised'
                          : 'bg-sage-800'
                        }`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-script text-2xl text-white">
          Balance
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href}
              className="text-sm text-white/80 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link href="/auth/signup"
            className="px-4 py-2 rounded-lg bg-white text-sage-800 text-sm font-medium
                       hover:bg-warm-100 transition-colors focus-visible:outline-2">
            Get started free
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav aria-label="Mobile navigation"
          className="md:hidden bg-sage-900 border-t border-white/10 px-6 py-4 space-y-4">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-white/80 hover:text-white transition-colors py-2">
              {label}
            </a>
          ))}
          <Link href="/auth/signup"
            onClick={() => setMenuOpen(false)}
            className="block text-center px-4 py-3 rounded-lg bg-white text-sage-800
                       text-sm font-medium hover:bg-warm-100 transition-colors mt-2">
            Get started free
          </Link>
        </nav>
      )}
    </header>
  )
}
