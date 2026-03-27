'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ borderBottom: '0.5px solid #E0DFDB', background: '#FFFFFF' }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18, color: '#141310', letterSpacing: '-0.5px' }}>
            Pareto
          </span>
          <span style={{
            background: '#C8F230', color: '#141310',
            fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2
          }}>
            Builders
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/builders" style={{ fontSize: 13, fontWeight: 400, color: '#4A4946', letterSpacing: '0.01em' }}
            className="hover:text-[#141310] transition-colors">
            Explorar Builders
          </Link>
          <Link href="/para-empresas" style={{ fontSize: 13, fontWeight: 400, color: '#4A4946' }}
            className="hover:text-[#141310] transition-colors">
            Para Empresas
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" style={{
            fontSize: 12, fontWeight: 500, color: '#4A4946',
            letterSpacing: '0.04em', padding: '10px 18px'
          }}>
            Entrar
          </Link>
          <Link href="/auth/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#141310', color: '#C8F230',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
            padding: '10px 20px', borderRadius: 3
          }}>
            Criar perfil grátis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={20} color="#141310" /> : <Menu size={20} color="#141310" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '0.5px solid #E0DFDB', background: '#FFFFFF' }} className="md:hidden px-6 py-4 flex flex-col gap-4">
          <Link href="/builders" style={{ fontSize: 14, color: '#4A4946' }} onClick={() => setOpen(false)}>Explorar Builders</Link>
          <Link href="/para-empresas" style={{ fontSize: 14, color: '#4A4946' }} onClick={() => setOpen(false)}>Para Empresas</Link>
          <Link href="/auth/login" style={{ fontSize: 14, color: '#4A4946' }} onClick={() => setOpen(false)}>Entrar</Link>
          <Link href="/auth/signup" style={{
            display: 'inline-flex', justifyContent: 'center',
            background: '#141310', color: '#C8F230',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
            padding: '11px 20px', borderRadius: 3
          }} onClick={() => setOpen(false)}>
            Criar perfil grátis
          </Link>
        </div>
      )}
    </nav>
  )
}
