import Link from 'next/link'

const PRODUCT_LINKS = [
  { label: 'How it works',    href: '/#how-it-works' },
  { label: 'Features',        href: '/#features'     },
  { label: 'FAQ',             href: '/#faq'          },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy',  href: '/privacy' },
  { label: 'Terms of Service',href: '/terms'   },
]

const RESEARCH_LINKS = [
  { label: 'About',                        href: '/#faq'                                         },
  { label: 'Southampton Solent University',href: 'https://www.solent.ac.uk', external: true      },
                                               
]

export default function Footer() {
  return (
    <footer className="bg-sage-900">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-script text-2xl text-white">Balance</span>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">
              Productivity, in tune with how you feel.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Legal
            </p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Research */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Research
            </p>
            <ul className="space-y-3">
              {RESEARCH_LINKS.map(({ label, href, external }) => (
                <li key={href}>
                  <a href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row
                        items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © 2026 Balance — Rebeca Boara. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
