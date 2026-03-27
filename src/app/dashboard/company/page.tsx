'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Search, Bookmark, Bot, LogOut, Sparkles, ArrowRight, Building2, Loader2, BarChart2, GitCompare, ChevronDown, ChevronUp, X, CheckCircle } from 'lucide-react'

type MatchedBuilder = {
  id: string
  slug: string
  name: string
  match_score: number
  justificativa: string
  pontos_fortes: string[]
  pontos_atencao?: string[]
}

type Requisitos = {
  tipo_projeto: string
  tecnologias_necessarias: string[]
  complexidade: string
  prazo_estimado: string
  perfil_ideal: string
  especialidades_necessarias: string[]
}

type Estimativa = {
  complexidade: string
  complexidade_cor: string
  prazo_min: string
  prazo_max: string
  prazo_unidade: string
  orcamento_min: number
  orcamento_max: number
  perfil_builder: string
  tecnologias_sugeridas: string[]
  riscos: { risco: string; mitigacao: string }[]
  proximos_passos: string[]
  resumo: string
}

type ComparatorResult = {
  recomendado: string
  justificativa_recomendacao: string
  comparacao: { slug: string; nome: string; pontos_fortes: string[]; pontos_fracos: string[]; fit_projeto: number; resumo: string }[]
}

type Tab = 'briefing' | 'estimator'

export default function CompanyDashboard() {
  const router = useRouter()
  const [company, setCompany] = useState<{ company_name: string } | null>(null)
  const [tab, setTab] = useState<Tab>('briefing')

  // Briefing
  const [briefing, setBriefing] = useState('')
  const [matches, setMatches] = useState<MatchedBuilder[]>([])
  const [requisitos, setRequisitos] = useState<Requisitos | null>(null)
  const [recomendacaoIA, setRecomendacaoIA] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  // Estimador
  const [estimDesc, setEstimDesc] = useState('')
  const [estimativa, setEstimativa] = useState<Estimativa | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [showRiscos, setShowRiscos] = useState(false)

  // Comparador
  const [selectedBuilders, setSelectedBuilders] = useState<MatchedBuilder[]>([])
  const [comparing, setComparing] = useState(false)
  const [compResult, setCompResult] = useState<ComparatorResult | null>(null)
  const [showComparator, setShowComparator] = useState(false)

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
    setAnalyzed(false)
    setSelectedBuilders([])
    setCompResult(null)
    try {
      const res = await fetch('/api/briefing-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefing }),
      })
      const data = await res.json()
      setMatches(data.builders_rankeados || [])
      setRequisitos(data.requisitos || null)
      setRecomendacaoIA(data.recomendacao_ia || '')
      setAnalyzed(true)
    } catch {
      setAnalyzed(false)
    }
    setAnalyzing(false)
  }

  async function estimateComplexity() {
    if (!estimDesc.trim()) return
    setEstimating(true)
    try {
      const res = await fetch('/api/complexity-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: estimDesc }),
      })
      const data = await res.json()
      setEstimativa(data)
    } catch { /* ignore */ }
    setEstimating(false)
  }

  function toggleSelectBuilder(b: MatchedBuilder) {
    setSelectedBuilders(prev => {
      if (prev.find(x => x.slug === b.slug)) return prev.filter(x => x.slug !== b.slug)
      if (prev.length >= 3) return prev
      return [...prev, b]
    })
  }

  async function compareBuilders() {
    if (selectedBuilders.length < 2) return
    setComparing(true)
    setCompResult(null)
    try {
      const res = await fetch('/api/compare-builders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderSlugs: selectedBuilders.map(b => b.slug), briefing }),
      })
      const data = await res.json()
      setCompResult(data)
      setShowComparator(true)
    } catch { /* ignore */ }
    setComparing(false)
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const complexColors: Record<string, string> = { green: '#A8CF1A', yellow: '#C8F230', orange: '#E8A030', red: '#E05A30' }

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
          {([
            { id: 'briefing', icon: Sparkles, label: 'Briefing + Match IA' },
            { id: 'estimator', icon: BarChart2, label: 'Estimador de Projeto' },
          ] as { id: Tab; icon: typeof Sparkles; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 2, background: tab === id ? '#252420' : 'transparent', color: tab === id ? '#C8F230' : '#8A8985', border: 'none', cursor: 'pointer', fontSize: 13 }}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <Link href="/builders" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 2, color: '#8A8985', fontSize: 13, textDecoration: 'none' }}>
            <Search size={15} /> Explorar Builders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#4A4946', fontSize: 13 }}>
            <Bookmark size={15} /> Builders Salvos
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#4A4946', fontSize: 13 }}>
            <Bot size={15} /> Conversas
          </div>
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

        {/* BRIEFING TAB */}
        {tab === 'briefing' && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Powered by IA</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 8 }}>
              Briefing Inteligente
            </h1>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985', marginBottom: 32 }}>
              Descreva seu projeto em linguagem natural. Nossa IA estrutura os requisitos e encontra os Builders mais compatíveis com score real.
            </p>

            {/* Input */}
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px', marginBottom: 24, maxWidth: 720 }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>
                Descreva seu projeto
              </label>
              <textarea value={briefing} onChange={e => setBriefing(e.target.value)} rows={5}
                placeholder="Ex: Quero implementar um agente de IA para automatizar o atendimento ao cliente da minha loja online. Tenho cerca de 500 pedidos por mês e o maior gargalo é responder perguntas repetitivas sobre entrega, troca e cancelamento..."
                style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#141310', background: '#F5F5F3', border: 'none', borderRadius: 6, padding: '16px', outline: 'none', resize: 'vertical', lineHeight: 1.7 }} />
              <div className="flex items-center justify-between mt-4">
                <p style={{ fontSize: 12, fontWeight: 300, color: '#C2C1BC' }}>Quanto mais detalhes, melhor o match.</p>
                <button onClick={analyzeBriefing} disabled={analyzing || !briefing.trim()} style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: '#141310', color: '#C8F230',
                  fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '12px 24px', borderRadius: 3, border: 'none', cursor: briefing.trim() ? 'pointer' : 'not-allowed', opacity: briefing.trim() ? 1 : 0.5
                }}>
                  {analyzing ? <><Loader2 size={14} /> Analisando com IA...</> : <><Sparkles size={14} /> Encontrar Builders</>}
                </button>
              </div>
            </div>

            {/* Requisitos estruturados */}
            {analyzed && requisitos && (
              <div style={{ background: '#141310', borderRadius: 12, padding: '24px 28px', marginBottom: 20, maxWidth: 720 }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8F230', marginBottom: 14 }}>IA · Requisitos Estruturados</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 4 }}>Tipo de projeto</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{requisitos.tipo_projeto}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 4 }}>Complexidade</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#C8F230' }}>{requisitos.complexidade}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 4 }}>Prazo estimado</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{requisitos.prazo_estimado}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 4 }}>Perfil ideal</p>
                    <p style={{ fontSize: 13, fontWeight: 300, color: '#C2C1BC' }}>{requisitos.perfil_ideal}</p>
                  </div>
                </div>
                {requisitos.especialidades_necessarias?.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #252420' }}>
                    <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 8 }}>Especialidades necessárias</p>
                    <div className="flex flex-wrap gap-2">
                      {requisitos.especialidades_necessarias.map(e => (
                        <span key={e} style={{ fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 2, background: '#252420', color: '#C8F230', letterSpacing: '0.06em' }}>{e}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recomendação */}
            {analyzed && recomendacaoIA && (
              <div style={{ background: '#F0F8E0', border: '0.5px solid #A8CF1A', borderRadius: 10, padding: '16px 20px', marginBottom: 20, maxWidth: 720 }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A7A10', marginBottom: 6 }}>Recomendação da IA</p>
                <p style={{ fontSize: 13, fontWeight: 300, color: '#3A5A08', lineHeight: 1.65 }}>{recomendacaoIA}</p>
              </div>
            )}

            {/* Comparador selector */}
            {analyzed && matches.length > 0 && (
              <div style={{ maxWidth: 720, marginBottom: 16 }}>
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985' }}>
                    {matches.length} Builders · Ordenados por compatibilidade com IA
                  </p>
                  {selectedBuilders.length >= 2 && (
                    <button onClick={compareBuilders} disabled={comparing} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#C8F230', color: '#141310', fontSize: 11, fontWeight: 600, padding: '9px 18px', borderRadius: 3, border: 'none', cursor: 'pointer' }}>
                      {comparing ? <Loader2 size={12} /> : <GitCompare size={12} />}
                      Comparar {selectedBuilders.length} selecionados
                    </button>
                  )}
                  {selectedBuilders.length === 1 && (
                    <p style={{ fontSize: 11, color: '#8A8985' }}>Selecione mais 1-2 builders para comparar</p>
                  )}
                  {selectedBuilders.length === 0 && (
                    <p style={{ fontSize: 11, color: '#8A8985' }}>Selecione até 3 builders para comparar</p>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {analyzed && matches.length > 0 && (
              <div className="flex flex-col gap-4" style={{ maxWidth: 720 }}>
                {matches.map((b, i) => {
                  const isSelected = selectedBuilders.find(x => x.slug === b.slug)
                  return (
                    <div key={b.slug} style={{ background: '#FFFFFF', border: i === 0 ? '1px solid #C8F230' : isSelected ? '1px solid #141310' : '0.5px solid #E0DFDB', borderRadius: 12, padding: '24px 28px' }}>
                      <div className="flex items-start gap-4">
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EFEEEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#8A8985' }}>{b.name.charAt(0)}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#141310' }}>{b.name}</p>
                            {i === 0 && <span style={{ background: '#C8F230', color: '#141310', fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2 }}>Melhor match</span>}
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 300, color: '#4A4946', lineHeight: 1.6, marginBottom: 10 }}>{b.justificativa}</p>

                          {b.pontos_fortes?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-12">
                              {b.pontos_fortes.map(p => (
                                <span key={p} className="flex items-center gap-1" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 2, background: '#F0F8E0', color: '#5A7A10', fontWeight: 500 }}>
                                  <CheckCircle size={9} /> {p}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <Link href={`/builders/${b.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: '#141310', background: '#F5F5F3', padding: '7px 14px', borderRadius: 2, border: '0.5px solid #E0DFDB', textDecoration: 'none' }}>
                              Ver perfil <ArrowRight size={11} />
                            </Link>
                            <Link href={`/builders/${b.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: '#141310', background: '#C8F230', padding: '7px 14px', borderRadius: 2, textDecoration: 'none' }}>
                              <Bot size={12} /> Falar com clone
                            </Link>
                            <button onClick={() => toggleSelectBuilder(b)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: isSelected ? '#FFFFFF' : '#8A8985', background: isSelected ? '#141310' : 'transparent', padding: '7px 14px', borderRadius: 2, border: '0.5px solid', borderColor: isSelected ? '#141310' : '#C2C1BC', cursor: 'pointer' }}>
                              <GitCompare size={11} /> {isSelected ? 'Selecionado' : 'Comparar'}
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: b.match_score >= 85 ? '#A8CF1A' : '#141310', letterSpacing: '-1px' }}>{b.match_score}%</p>
                          <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985' }}>Match IA</p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="mt-4">
                  <Link href="/builders" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 400, color: '#4A4946', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Ver todos os Builders →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ESTIMADOR TAB */}
        {tab === 'estimator' && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>IA · Ferramenta</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 8 }}>
              Estimador de Complexidade
            </h1>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985', marginBottom: 32 }}>
              Descreva seu projeto e a IA estima complexidade, prazo, orçamento e os principais riscos.
            </p>

            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px', marginBottom: 24, maxWidth: 720 }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>
                Descreva seu projeto
              </label>
              <textarea value={estimDesc} onChange={e => setEstimDesc(e.target.value)} rows={5}
                placeholder="Ex: Preciso de um sistema de análise de documentos jurídicos com IA. A empresa recebe cerca de 200 contratos por mês para revisão. Quero que a IA extraia cláusulas importantes, identifique riscos e gere um resumo executivo automaticamente..."
                style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#141310', background: '#F5F5F3', border: 'none', borderRadius: 6, padding: '16px', outline: 'none', resize: 'vertical', lineHeight: 1.7 }} />
              <div className="flex justify-end mt-4">
                <button onClick={estimateComplexity} disabled={estimating || !estimDesc.trim()} style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: '#141310', color: '#C8F230',
                  fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '12px 24px', borderRadius: 3, border: 'none', cursor: estimDesc.trim() ? 'pointer' : 'not-allowed', opacity: estimDesc.trim() ? 1 : 0.5
                }}>
                  {estimating ? <><Loader2 size={14} /> Estimando...</> : <><Sparkles size={14} /> Estimar projeto</>}
                </button>
              </div>
            </div>

            {estimativa && (
              <div style={{ maxWidth: 720 }}>
                {/* Complexidade */}
                <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px', marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Análise do Projeto</p>
                  <p style={{ fontSize: 13, fontWeight: 300, color: '#4A4946', lineHeight: 1.65, marginBottom: 20 }}>{estimativa.resumo}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={{ background: '#F5F5F3', borderRadius: 8, padding: '16px' }}>
                      <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 6 }}>Complexidade</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: complexColors[estimativa.complexidade_cor] || '#141310' }}>{estimativa.complexidade}</p>
                    </div>
                    <div style={{ background: '#F5F5F3', borderRadius: 8, padding: '16px' }}>
                      <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 6 }}>Prazo estimado</p>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#141310' }}>{estimativa.prazo_min}–{estimativa.prazo_max} {estimativa.prazo_unidade}</p>
                    </div>
                    <div style={{ background: '#F5F5F3', borderRadius: 8, padding: '16px' }}>
                      <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 6 }}>Investimento</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#141310' }}>
                        R$ {(estimativa.orcamento_min / 1000).toFixed(0)}k–{(estimativa.orcamento_max / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  {estimativa.tecnologias_sugeridas?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 10, color: '#8A8985', marginBottom: 8 }}>Tecnologias sugeridas</p>
                      <div className="flex flex-wrap gap-1">
                        {estimativa.tecnologias_sugeridas.map(t => <span key={t} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 2, background: '#EFEEEB', color: '#4A4946', fontWeight: 500 }}>{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Próximos passos */}
                {estimativa.proximos_passos?.length > 0 && (
                  <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px', marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Próximos Passos</p>
                    <div className="flex flex-col gap-3">
                      {estimativa.proximos_passos.map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#C8F230', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#141310', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <p style={{ fontSize: 13, fontWeight: 300, color: '#4A4946', lineHeight: 1.6 }}>{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Riscos */}
                {estimativa.riscos?.length > 0 && (
                  <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px', marginBottom: 16 }}>
                    <button onClick={() => setShowRiscos(!showRiscos)} className="flex items-center justify-between w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985' }}>Riscos identificados ({estimativa.riscos.length})</p>
                      {showRiscos ? <ChevronUp size={16} color="#8A8985" /> : <ChevronDown size={16} color="#8A8985" />}
                    </button>
                    {showRiscos && (
                      <div className="flex flex-col gap-4" style={{ marginTop: 16 }}>
                        {estimativa.riscos.map((r, i) => (
                          <div key={i} style={{ background: '#FFF8F0', border: '0.5px solid #F0D0A0', borderRadius: 8, padding: '14px 16px' }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: '#141310', marginBottom: 4 }}>⚠ {r.risco}</p>
                            <p style={{ fontSize: 12, fontWeight: 300, color: '#4A4946' }}>Mitigação: {r.mitigacao}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CTA para briefing */}
                <div style={{ background: '#141310', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF', marginBottom: 4 }}>Pronto para encontrar o Builder ideal?</p>
                    <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985' }}>Use o Briefing Inteligente para match com IA.</p>
                  </div>
                  <button onClick={() => setTab('briefing')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#C8F230', color: '#141310', fontSize: 11, fontWeight: 600, padding: '10px 20px', borderRadius: 3, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <Sparkles size={13} /> Fazer briefing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Comparador de Builders */}
      {showComparator && compResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,19,16,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '0.5px solid #E0DFDB', width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 4 }}>IA · Comparador</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#141310', letterSpacing: '-0.5px' }}>Comparação de Builders</h2>
              </div>
              <button onClick={() => setShowComparator(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8985' }}>
                <X size={20} />
              </button>
            </div>

            {/* Recomendação */}
            <div style={{ background: '#141310', borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8F230', marginBottom: 8 }}>Recomendação da IA</p>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#C2C1BC', lineHeight: 1.65 }}>{compResult.justificativa_recomendacao}</p>
            </div>

            {/* Comparação lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compResult.comparacao?.length || 1}, 1fr)`, gap: 16 }}>
              {compResult.comparacao?.map(b => {
                const isRecomendado = b.slug === compResult.recomendado
                return (
                  <div key={b.slug} style={{ background: isRecomendado ? '#F5FFE0' : '#F5F5F3', border: isRecomendado ? '1px solid #A8CF1A' : '0.5px solid #E0DFDB', borderRadius: 10, padding: '20px' }}>
                    {isRecomendado && (
                      <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#C8F230', color: '#141310', padding: '2px 8px', borderRadius: 2, marginBottom: 8 }}>Recomendado</span>
                    )}
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#141310', marginBottom: 4 }}>{b.nome}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: isRecomendado ? '#A8CF1A' : '#141310', marginBottom: 8 }}>{b.fit_projeto}%</p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: '#4A4946', lineHeight: 1.6, marginBottom: 12 }}>{b.resumo}</p>
                    {b.pontos_fortes?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5A7A10', marginBottom: 6 }}>Pontos fortes</p>
                        {b.pontos_fortes.map(p => <p key={p} style={{ fontSize: 11, color: '#4A4946', marginBottom: 3 }}>✓ {p}</p>)}
                      </div>
                    )}
                    {b.pontos_fracos?.length > 0 && (
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Atenção</p>
                        {b.pontos_fracos.map(p => <p key={p} style={{ fontSize: 11, color: '#8A8985', marginBottom: 3 }}>· {p}</p>)}
                      </div>
                    )}
                    <Link href={`/builders/${b.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 11, fontWeight: 500, color: '#141310', background: isRecomendado ? '#C8F230' : '#EFEEEB', padding: '9px', borderRadius: 3, textDecoration: 'none' }}>
                      Ver perfil completo <ArrowRight size={11} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
