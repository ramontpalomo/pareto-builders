'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        setError('E-mail ainda não confirmado. Verifique sua caixa de entrada e clique no link que enviamos.')
      } else if (authError.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos. Tente novamente.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    if (profile?.role === 'builder') {
      router.push('/dashboard/builder')
    } else if (profile?.role === 'company') {
      router.push('/dashboard/company')
    } else if (profile?.role === 'admin') {
      router.push('/dashboard/admin')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '0.5px solid #E0DFDB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="flex items-center gap-2">
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18, color: '#141310' }}>Pareto</span>
          <span style={{ background: '#C8F230', color: '#141310', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2 }}>Builders</span>
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A8985' }}>
          <ArrowLeft size={14} /> Voltar ao início
        </Link>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Bem-vindo de volta</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 32 }}>
            Entrar na plataforma
          </h1>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6, fontWeight: 400 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6, fontWeight: 400 }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 40px 11px 14px', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8A8985' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#E53E3E', background: '#FFF5F5', border: '0.5px solid #FEB2B2', borderRadius: 3, padding: '10px 14px' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#141310', color: '#C8F230',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '14px', borderRadius: 3,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', textAlign: 'center', marginTop: 28 }}>
            Não tem conta?{' '}
            <Link href="/auth/signup" style={{ color: '#141310', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Criar gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
