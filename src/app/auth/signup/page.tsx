'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Building2, Wrench, Eye, EyeOff } from 'lucide-react'

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = params.get('role') === 'company' ? 'company' : 'builder'

  const [role, setRole] = useState<'builder' | 'company'>(defaultRole as 'builder' | 'company')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    // Cria o profile
    await supabase.from('profiles').insert({
      user_id: data.user.id,
      role,
      full_name: fullName,
      email,
    })

    // Se builder, cria o builder profile com slug básico
    if (role === 'builder') {
      const slug = fullName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim().replace(/\s+/g, '-')
        + '-' + Math.random().toString(36).slice(2, 6)

      await supabase.from('builder_profiles').insert({
        user_id: data.user.id,
        slug,
        full_name: fullName,
        headline: '',
        bio: '',
        specialties: [],
        years_experience: 0,
        availability: 'available',
        fma_verified: false,
        profile_score: 10,
      })
      router.push('/dashboard/builder')
    } else {
      await supabase.from('company_profiles').insert({
        user_id: data.user.id,
        company_name: fullName,
      })
      router.push('/dashboard/company')
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
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 460 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Gratuito para começar</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 32 }}>
            Criar conta
          </h1>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
            {[
              { value: 'builder', icon: Wrench, label: 'Sou AI Builder', sub: 'Quero oferecer meus serviços' },
              { value: 'company', icon: Building2, label: 'Sou Empresa', sub: 'Quero contratar um Builder' },
            ].map(({ value, icon: Icon, label, sub }) => (
              <button key={value} type="button" onClick={() => setRole(value as 'builder' | 'company')}
                style={{
                  padding: '16px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                  border: role === value ? '1.5px solid #141310' : '0.5px solid #E0DFDB',
                  background: role === value ? '#F5F5F3' : '#FFFFFF',
                  transition: 'all 0.15s'
                }}>
                <Icon size={16} color={role === value ? '#141310' : '#8A8985'} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 13, fontWeight: 500, color: '#141310', marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985' }}>{sub}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>
                {role === 'builder' ? 'Seu nome completo' : 'Nome da empresa'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder={role === 'builder' ? 'João Silva' : 'Empresa S.A.'}
                style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>E-mail</label>
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
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
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
              opacity: loading ? 0.7 : 1, marginTop: 4
            }}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>

            <p style={{ fontSize: 11, fontWeight: 300, color: '#C2C1BC', textAlign: 'center' }}>
              Ao criar conta você concorda com os Termos de Uso e Política de Privacidade.
            </p>
          </form>

          <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', textAlign: 'center', marginTop: 24 }}>
            Já tem conta?{' '}
            <Link href="/auth/login" style={{ color: '#141310', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
