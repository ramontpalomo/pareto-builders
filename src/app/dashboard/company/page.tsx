'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Search, Bookmark, Bot, LogOut, Sparkles, ArrowRight, Building2 } from 'lucide-react'
import type { BuilderProfile } from '@/lib/types'

const MOCK_BUILDERS: BuilderProfile[] = [
  { id: '1', user_id: 'u1', slug: 'lucas-mendonca', full_name: 'Lucas Mendonça', headline: 'Agentes de IA & Automação com LLMs', bio: '', location: 'São Paulo, SP', specialties: ['LLM & Agentes', 'RAG & Search', 'Automação'], years_experience: 5, availability: 'available', fma_verified: true, fma_grade: '9.5', profile_score: 95, created_at: '', updated_at: '' },
  { id: '5', user_id: 'u5', slug: 'pedro-alves', full_name: 'Pedro Alves', headline: 'RAG e busca semântica para empresas', bio: '', location: 'Curitiba, PR', specialties: ['RAG & Search', 'LLM & Agentes', 'NLP'], years_experience: 6, availability: 'available', fma_verified: true, fma_grade: '9.0', profile_score: 90, created_at: '', updated_at: '' },
  { id: '3', user_id: 'u3', slug: 'rafael-teixeira', full_name: 'Rafael Teixeira', headline: 'Computer Vision e MLOps para indústria', bio: '', location: 'Belo Horizonte, MG', specialties: ['Computer Vision', 'MLOps', 'Data Science'], years_experience: 7, availability: 'busy', fma_verified: true, fma_grade: '8.8', profile_score: 88, created_at: '', updated_at: '' },
]

export default function CompanyDashboard() {
  const router = useRouter()
  const [company, setCompany] = useState<{ company_name: string } | null>(null)
  const [briefing, setBriefing] = useState('')
  const [matches, setMatches] = useState<(BuilderProfile & { matchScore: number })[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: cp } = await supabase.from('company_profiles').select('*').eq('user_id', user.id).single()
      if (cp) setCompany(cp)
    }
    load()
  }, [router])

  async function analyzeBriefing() {
    if (!briefing.trim()) return
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1800))
    // Simulação de match score por IA — em produção, chamar API Claude
    const scored = MOCK_BUILDERS.map(b => ({
      ...b,
      matchScore: Math.floor(70 + Math.random() * 28)
    })).sort((a, b) => b.matchScore - a.matchScore)
    setMatches(scored)
    setAnalyzing(false)
    setAnalyzed(true)
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex' }}>
      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#141310', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '0.5px solid #252420' }}>
          <Link href="/" className="flex items-center gap-2">
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 16, color: '#FFFFFF' }}>Pareto</span>
            <span style={{ background: '#C8F230', color: '#141310', fontSize: 8, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 2 }}>Builders</span>
          </Link>
        </div>

        <div style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { icon: Sparkles, label: 'Briefing Inteligente', active: true },
            { icon: Search, label: 'Explorar Builders', href: '/builders' },
            { icon: Bookmark, label: 'Builders Salvos', active: false },
            { icon: Bot, label: 'Conversas', active: false },
          ].map(({ icon: Icon, label, href, active }) => (
            href ? (
              <Link key={label} href={href}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 2, color: '#8A8985', fontSize: 13, textDecoration: 'none' }}>
                <Icon size={15} /> {label}
              </Link>
            ) : (
              <div key={label}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 2, background: active ? '#252420' : 'transparent', color: active ? '#C8F230' : '#8A8985', fontSize: 13 }}>
                <Icon size={15} /> {label}
              </div>
            )
          ))}
        </div>

        <div style={{ padding: '16px 12px', borderTop: '0.5px solid #252420' }}>
          {company && (
            <div style={{ padding: '8px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={14} color="#8A8985" />
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>{company.company_name}</p>
                <p style={{ fontSize: 10, color: '#8A8985' }}>Empresa</p>
              </div>
            </div>
          )}
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#8A8985', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px' }}>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Powered by IA</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 8 }}>
          Briefing Inteligente
        </h1>
        <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985', marginBottom: 32 }}>
          Descreva seu projeto em linguagem natural. Nossa IA analisa e encontra os Builders mais compatíveis.
        </p>

        {/* Briefing input */}
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px', marginBottom: 24, maxWidth: 720 }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>
            Descreva seu projeto
          </label>
          <textarea
            value={briefing}
            onChange={e => setBriefing(e.target.value)}
            rows={5}
            placeholder="Ex: Quero implementar um agente de IA para automatizar o atendimento ao cliente da minha loja online. Tenho cerca de 500 pedidos por mês e o maior gargalo é responder perguntas repetitivas sobre entrega, troca e cancelamento..."
            style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#141310', background: '#F5F5F3', border: 'none', borderRadius: 6, padding: '16px', outline: 'none', resize: 'vertical', lineHeight: 1.7 }}
          />
          <div className="flex items-center justify-between mt-4">
            <p style={{ fontSize: 12, fontWeight: 300, color: '#C2C1BC' }}>Quanto mais detalhes, melhor o match.</p>
            <button onClick={analyzeBriefing} disabled={analyzing || !briefing.trim()} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#141310', color: '#C8F230',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '12px 24px', borderRadius: 3,
              border: 'none', cursor: briefing.trim() ? 'pointer' : 'not-allowed',
              opacity: briefing.trim() ? 1 : 0.5
            }}>
              {analyzing ? (
                <><Sparkles size={14} /> Analisando...</>
              ) : (
                <><Sparkles size={14} /> Encontrar Builders</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {analyzed && matches.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>
              Builders recomendados por IA — ordenados por compatibilidade
            </p>
            <div className="flex flex-col gap-4" style={{ maxWidth: 720 }}>
              {matches.map((b, i) => (
                <div key={b.id} style={{ background: '#FFFFFF', border: i === 0 ? '1px solid #C8F230' : '0.5px solid #E0DFDB', borderRadius: 12, padding: '24px 28px' }}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EFEEEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#8A8985' }}>{b.full_name.charAt(0)}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#141310' }}>{b.full_name}</p>
                        {b.fma_verified && (
                          <span style={{ background: '#C8F230', color: '#141310', fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2 }}>MBA FMA</span>
                        )}
                        {i === 0 && (
                          <span style={{ background: '#EFEEEB', color: '#141310', fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2 }}>Melhor match</span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', marginBottom: 12 }}>{b.headline}</p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {b.specialties.slice(0, 4).map(s => (
                          <span key={s} style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 2, background: '#EFEEEB', color: '#4A4946' }}>{s}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Link href={`/builders/${b.slug}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 11, fontWeight: 500, color: '#141310',
                          background: '#F5F5F3', padding: '7px 14px', borderRadius: 2,
                          border: '0.5px solid #E0DFDB', textDecoration: 'none'
                        }}>
                          Ver perfil <ArrowRight size={11} />
                        </Link>
                        <Link href={`/builders/${b.slug}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 11, fontWeight: 500, color: '#141310',
                          background: '#C8F230', padding: '7px 14px', borderRadius: 2,
                          textDecoration: 'none'
                        }}>
                          <Bot size={12} /> Falar com clone
                        </Link>
                      </div>
                    </div>

                    {/* Match score */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: b.matchScore >= 90 ? '#A8CF1A' : '#141310', letterSpacing: '-1px' }}>{b.matchScore}%</p>
                      <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985' }}>Match</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/builders" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 12, fontWeight: 400, color: '#4A4946',
                textDecoration: 'underline', textUnderlineOffset: 3
              }}>
                Ver todos os Builders →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
