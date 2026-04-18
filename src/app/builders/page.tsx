'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BuilderCard from '@/components/BuilderCard'
import { createClient } from '@/lib/supabase'
import { Search, SlidersHorizontal, X, Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import type { BuilderProfile } from '@/lib/types'

const SPECIALTIES = [
  'LLM & Agentes', 'RAG & Search', 'Automação', 'Computer Vision',
  'NLP', 'MLOps', 'Sales AI', 'FinTech AI', 'RPA', 'Data Science',
  'Fine-tuning', 'Infraestrutura',
]

const AVAILABILITY_OPTS = [
  { value: 'available', label: 'Disponível' },
  { value: 'busy', label: 'Ocupado' },
]

type SemanticResult = BuilderProfile & { ai_relevancia?: number; ai_motivo?: string }

const SEMANTIC_EXAMPLES = [
  'Preciso automatizar conciliação fiscal com leitura de notas fiscais',
  'Quero um chatbot inteligente para atendimento ao cliente',
  'Busco alguém para analisar imagens de produtos no varejo',
  'Preciso de ML para prever churn de clientes SaaS',
]

function BuildersContent() {
  const params = useSearchParams()
  const [builders, setBuilders] = useState<BuilderProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState(params.get('specialty') || '')
  const [availability, setAvailability] = useState('')
  const [onlyFma, setOnlyFma] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Semantic search state
  const [semanticMode, setSemanticMode] = useState(false)
  const [semanticQuery, setSemanticQuery] = useState('')
  const [semanticSearching, setSemanticSearching] = useState(false)
  const [semanticResults, setSemanticResults] = useState<SemanticResult[] | null>(null)
  const [semanticIntent, setSemanticIntent] = useState('')

  async function doSemanticSearch() {
    if (!semanticQuery.trim()) return
    setSemanticSearching(true)
    setSemanticResults(null)
    setSemanticIntent('')
    try {
      const res = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: semanticQuery }),
      })
      const data = await res.json()
      setSemanticIntent(data.intencao || '')
      setSemanticResults(data.builders || [])
    } catch {
      setSemanticResults([])
    }
    setSemanticSearching(false)
  }

  function clearSemanticSearch() {
    setSemanticResults(null)
    setSemanticIntent('')
    setSemanticQuery('')
  }

  function toggleSemanticMode() {
    setSemanticMode(prev => {
      if (prev) clearSemanticSearch()
      return !prev
    })
  }

  // Buscar builders do Supabase — filtros aplicados no servidor
  useEffect(() => {
    async function fetchBuilders() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('builder_profiles')
        .select('*')
        .order('profile_score', { ascending: false })
      if (onlyFma) query = query.eq('fma_verified', true)
      if (availability) query = query.eq('availability', availability)
      if (selectedSpecialty) query = query.contains('specialties', [selectedSpecialty])
      const { data } = await query
      setBuilders(data || [])
      setLoading(false)
    }
    fetchBuilders()
  }, [onlyFma, availability, selectedSpecialty])

  // Filtro de texto no cliente (nome e headline)
  const filtered = builders.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.full_name.toLowerCase().includes(q) ||
      b.headline?.toLowerCase().includes(q)
    )
  })

  const displayBuilders = semanticResults !== null ? semanticResults : filtered
  const activeFiltersCount = [selectedSpecialty, availability, onlyFma].filter(Boolean).length

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Header */}
      <section style={{ background: '#F5F5F3', borderBottom: '0.5px solid #E0DFDB', padding: '48px 0 36px' }}>
        <div className="max-w-6xl mx-auto px-6">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Marketplace</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#141310', letterSpacing: '-1px', marginBottom: 6 }}>
            AI Builders
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985' }}>
            {semanticResults !== null
              ? `${semanticResults.length} resultado${semanticResults.length !== 1 ? 's' : ''} ranqueado${semanticResults.length !== 1 ? 's' : ''} por IA`
              : loading
                ? 'Carregando builders...'
                : `${filtered.length} profissional${filtered.length !== 1 ? 'is' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">

        {/* Toggle busca semântica */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <button
            onClick={toggleSemanticMode}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 11, fontWeight: 600, padding: '8px 18px', borderRadius: 3,
              border: '0.5px solid',
              borderColor: semanticMode ? '#141310' : '#C2C1BC',
              background: semanticMode ? '#141310' : 'transparent',
              color: semanticMode ? '#C8F230' : '#8A8985',
              cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
            }}>
            <Sparkles size={12} />
            Busca com IA
          </button>
          {!semanticMode && (
            <span style={{ fontSize: 12, fontWeight: 300, color: '#8A8985' }}>
              Descreva o que precisa em linguagem natural — a IA encontra e ranqueia os melhores builders
            </span>
          )}
        </div>

        {/* Painel de busca semântica */}
        {semanticMode && (
          <div style={{
            marginBottom: 24, padding: '20px 24px',
            background: '#141310', borderRadius: 10,
            border: '0.5px solid #252420',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#C8F230', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Sparkles size={10} />
              Busca Semântica com IA
            </p>

            <div className="flex gap-2" style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={semanticQuery}
                onChange={e => setSemanticQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSemanticSearch()}
                placeholder="Descreva sua necessidade... Ex: quero automatizar processos de RH com IA"
                style={{
                  flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  background: '#1C1B18', border: '0.5px solid #303028', borderRadius: 4,
                  padding: '13px 16px', outline: 'none', color: '#FFFFFF',
                }}
              />
              <button
                onClick={doSemanticSearch}
                disabled={semanticSearching || !semanticQuery.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#C8F230', color: '#141310',
                  fontSize: 11, fontWeight: 700, padding: '13px 24px',
                  borderRadius: 4, border: 'none', cursor: 'pointer',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  opacity: semanticSearching || !semanticQuery.trim() ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}>
                {semanticSearching
                  ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analisando</>
                  : <><Search size={13} /> Buscar</>}
              </button>
            </div>

            {/* Exemplos */}
            {!semanticResults && !semanticSearching && (
              <div className="flex flex-wrap gap-2">
                {SEMANTIC_EXAMPLES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => { setSemanticQuery(ex); }}
                    style={{
                      fontSize: 11, fontWeight: 300, color: '#8A8985',
                      background: '#1C1B18', border: '0.5px solid #303028',
                      borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}>
                    {ex}
                  </button>
                ))}
              </div>
            )}

            {/* Intenção interpretada */}
            {semanticIntent && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985' }}>
                  IA entendeu:{' '}
                  <span style={{ color: '#C2C1BC', fontStyle: 'italic' }}>{semanticIntent}</span>
                </p>
                <button
                  onClick={clearSemanticSearch}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4A4946', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <ArrowLeft size={10} /> nova busca
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filtros clássicos (ocultados quando há resultados semânticos) */}
        {semanticResults === null && (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#8A8985' }} />
                <input
                  type="text"
                  placeholder="Filtrar por nome ou headline..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, color: '#141310', background: '#FFFFFF',
                    border: '0.5px solid #C2C1BC', borderRadius: 3,
                    padding: '11px 14px 11px 36px', outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: showFilters || activeFiltersCount > 0 ? '#141310' : '#FFFFFF',
                  color: showFilters || activeFiltersCount > 0 ? '#C8F230' : '#4A4946',
                  border: '0.5px solid #C2C1BC', borderRadius: 3,
                  padding: '11px 18px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>
                <SlidersHorizontal size={14} />
                Filtros
                {activeFiltersCount > 0 && (
                  <span style={{
                    background: '#C8F230', color: '#141310', borderRadius: '50%',
                    width: 16, height: 16, fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {(activeFiltersCount > 0 || search) && (
                <button
                  onClick={() => { setSelectedSpecialty(''); setAvailability(''); setOnlyFma(false); setSearch('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8A8985', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={11} /> Limpar filtros
                </button>
              )}
            </div>

            {/* Painel de filtros avançados */}
            {showFilters && (
              <div style={{ background: '#F5F5F3', border: '0.5px solid #E0DFDB', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div className="flex flex-wrap gap-6 items-start">
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Especialidade</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES.map(s => (
                        <button key={s} onClick={() => setSelectedSpecialty(selectedSpecialty === s ? '' : s)}
                          style={{
                            fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                            padding: '4px 11px', borderRadius: 2, cursor: 'pointer',
                            background: selectedSpecialty === s ? '#141310' : '#FFFFFF',
                            color: selectedSpecialty === s ? '#C8F230' : '#4A4946',
                            border: '0.5px solid #C2C1BC',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Disponibilidade</p>
                    <div className="flex gap-2">
                      {AVAILABILITY_OPTS.map(a => (
                        <button key={a.value} onClick={() => setAvailability(availability === a.value ? '' : a.value)}
                          style={{
                            fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                            padding: '4px 11px', borderRadius: 2, cursor: 'pointer',
                            background: availability === a.value ? '#141310' : '#FFFFFF',
                            color: availability === a.value ? '#C8F230' : '#4A4946',
                            border: '0.5px solid #C2C1BC',
                          }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Certificação</p>
                    <button onClick={() => setOnlyFma(!onlyFma)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '4px 11px', borderRadius: 2, cursor: 'pointer',
                        background: onlyFma ? '#C8F230' : '#FFFFFF',
                        color: '#141310', border: '0.5px solid #C2C1BC',
                      }}>
                      {onlyFma && <X size={10} />} MBA FMA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filtros rápidos de especialidade */}
            {!showFilters && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <button onClick={() => setSelectedSpecialty('')}
                  style={{
                    fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '5px 12px', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: !selectedSpecialty ? '#141310' : '#FFFFFF',
                    color: !selectedSpecialty ? '#C8F230' : '#4A4946',
                    border: '0.5px solid #C2C1BC',
                  }}>
                  Todos
                </button>
                {SPECIALTIES.slice(0, 9).map(s => (
                  <button key={s} onClick={() => setSelectedSpecialty(selectedSpecialty === s ? '' : s)}
                    style={{
                      fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '5px 12px', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap',
                      background: selectedSpecialty === s ? '#141310' : '#FFFFFF',
                      color: selectedSpecialty === s ? '#C8F230' : '#4A4946',
                      border: '0.5px solid #C2C1BC',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {loading && semanticResults === null && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={24} style={{ margin: '0 auto 12px', color: '#C8F230', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985' }}>Carregando builders...</p>
          </div>
        )}

        {/* Analisando com IA */}
        {semanticSearching && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, margin: '0 auto 16px', background: '#141310', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} style={{ color: '#C8F230', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#141310', marginBottom: 6 }}>IA analisando sua necessidade</p>
            <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985' }}>Compreendendo contexto e ranqueando builders por adequação semântica...</p>
          </div>
        )}

        {/* Zero results semânticos */}
        {semanticResults !== null && semanticResults.length === 0 && !semanticSearching && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#141310', marginBottom: 8 }}>Nenhum Builder encontrado</p>
            <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', marginBottom: 20 }}>Tente descrever com outras palavras ou use os filtros manuais.</p>
            <button onClick={clearSemanticSearch}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4A4946', background: 'none', border: '0.5px solid #C2C1BC', padding: '8px 18px', borderRadius: 3, cursor: 'pointer' }}>
              <ArrowLeft size={11} /> Ver todos os builders
            </button>
          </div>
        )}

        {/* Zero results filtros */}
        {!semanticSearching && semanticResults === null && filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#141310', marginBottom: 8 }}>Nenhum Builder encontrado</p>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985' }}>Tente ajustar os filtros ou a busca.</p>
          </div>
        )}

        {/* Grid de builders */}
        {!semanticSearching && !loading && displayBuilders.length > 0 && (
          <>
            {semanticResults !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#F5FDE8', borderRadius: 6, border: '0.5px solid #C8F230' }}>
                <Sparkles size={12} style={{ color: '#5A8A00' }} />
                <p style={{ fontSize: 12, fontWeight: 300, color: '#3A6600' }}>
                  {semanticResults.length} builder{semanticResults.length !== 1 ? 's' : ''} ranqueado{semanticResults.length !== 1 ? 's' : ''} por IA com base na sua necessidade
                  {semanticIntent && <> — <em>{semanticIntent}</em></>}
                </p>
                <button onClick={clearSemanticSearch}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A8A00', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={10} /> Limpar
                </button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {displayBuilders.map(b => {
                const sm = b as SemanticResult
                return (
                  <BuilderCard
                    key={b.id}
                    slug={b.slug}
                    full_name={b.full_name}
                    headline={b.headline}
                    avatar_url={b.avatar_url}
                    location={b.location}
                    specialties={b.specialties}
                    availability={b.availability}
                    fma_verified={b.fma_verified}
                    years_experience={b.years_experience}
                    ai_motivo={sm.ai_motivo}
                    ai_relevancia={sm.ai_relevancia}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function BuildersPage() {
  return (
    <Suspense>
      <BuildersContent />
    </Suspense>
  )
}
