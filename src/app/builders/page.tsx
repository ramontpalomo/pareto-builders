'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BuilderCard from '@/components/BuilderCard'
import { createClient } from '@/lib/supabase'
import { Search, SlidersHorizontal, X, Sparkles, Loader2 } from 'lucide-react'
import type { BuilderProfile } from '@/lib/types'

const SPECIALTIES = ['LLM & Agentes', 'RAG & Search', 'Automação', 'Computer Vision', 'NLP', 'MLOps', 'Sales AI', 'FinTech AI', 'RPA', 'Data Science']
const AVAILABILITY_OPTS = [
  { value: 'available', label: 'Disponível' },
  { value: 'busy', label: 'Ocupado' },
]

// Mock builders para visualização antes do banco estar populado
const MOCK: BuilderProfile[] = [
  { id: '1', user_id: 'u1', slug: 'lucas-mendonca', full_name: 'Lucas Mendonça', headline: 'Agentes de IA & Automação com LLMs', bio: '', location: 'São Paulo, SP', specialties: ['LLM & Agentes', 'RAG & Search', 'Automação'], years_experience: 5, availability: 'available', fma_verified: true, fma_grade: '9.5', profile_score: 95, created_at: '', updated_at: '' },
  { id: '2', user_id: 'u2', slug: 'ana-paula-reis', full_name: 'Ana Paula Reis', headline: 'IA aplicada a vendas e CRM', bio: '', location: 'Rio de Janeiro, RJ', specialties: ['Sales AI', 'NLP', 'Automação'], years_experience: 3, availability: 'available', fma_verified: false, profile_score: 72, created_at: '', updated_at: '' },
  { id: '3', user_id: 'u3', slug: 'rafael-teixeira', full_name: 'Rafael Teixeira', headline: 'Computer Vision e MLOps para indústria', bio: '', location: 'Belo Horizonte, MG', specialties: ['Computer Vision', 'MLOps', 'Data Science'], years_experience: 7, availability: 'busy', fma_verified: true, fma_grade: '8.8', profile_score: 88, created_at: '', updated_at: '' },
  { id: '4', user_id: 'u4', slug: 'camila-santos', full_name: 'Camila Santos', headline: 'FinTech AI e modelos de risco', bio: '', location: 'São Paulo, SP', specialties: ['FinTech AI', 'Data Science', 'MLOps'], years_experience: 4, availability: 'available', fma_verified: false, profile_score: 68, created_at: '', updated_at: '' },
  { id: '5', user_id: 'u5', slug: 'pedro-alves', full_name: 'Pedro Alves', headline: 'RAG e busca semântica para empresas', bio: '', location: 'Curitiba, PR', specialties: ['RAG & Search', 'LLM & Agentes', 'NLP'], years_experience: 6, availability: 'available', fma_verified: true, fma_grade: '9.0', profile_score: 90, created_at: '', updated_at: '' },
  { id: '6', user_id: 'u6', slug: 'juliana-lima', full_name: 'Juliana Lima', headline: 'Automação de processos com RPA e IA', bio: '', location: 'Brasília, DF', specialties: ['RPA', 'Automação', 'NLP'], years_experience: 4, availability: 'available', fma_verified: false, profile_score: 65, created_at: '', updated_at: '' },
]

function BuildersContent() {
  const params = useSearchParams()
  const [builders, setBuilders] = useState<BuilderProfile[]>(MOCK)
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState(params.get('specialty') || '')
  const [availability, setAvailability] = useState('')
  const [onlyFma, setOnlyFma] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [semanticMode, setSemanticMode] = useState(false)
  const [semanticQuery, setSemanticQuery] = useState('')
  const [semanticSearching, setSemanticSearching] = useState(false)
  const [semanticIntent, setSemanticIntent] = useState('')

  async function doSemanticSearch() {
    if (!semanticQuery.trim()) return
    setSemanticSearching(true)
    try {
      const res = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: semanticQuery }),
      })
      const filters = await res.json()
      setSemanticIntent(filters.intencao || '')
      // Aplicar filtros retornados pela IA
      if (filters.especialidades?.length > 0) setSelectedSpecialty(filters.especialidades[0])
      if (filters.fma_preferido) setOnlyFma(true)
      if (filters.disponibilidade === 'disponivel') setAvailability('available')
      if (filters.palavras_chave?.length > 0) setSearch(filters.palavras_chave.join(' '))
    } catch { /* ignore */ }
    setSemanticSearching(false)
  }

  useEffect(() => {
    async function fetchBuilders() {
      const supabase = createClient()
      let query = supabase.from('builder_profiles').select('*').order('profile_score', { ascending: false })
      if (onlyFma) query = query.eq('fma_verified', true)
      if (availability) query = query.eq('availability', availability)
      const { data } = await query
      if (data && data.length > 0) setBuilders(data)
    }
    fetchBuilders()
  }, [onlyFma, availability])

  const filtered = builders.filter(b => {
    const matchSearch = !search || b.full_name.toLowerCase().includes(search.toLowerCase()) || b.headline?.toLowerCase().includes(search.toLowerCase())
    const matchSpecialty = !selectedSpecialty || b.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
    return matchSearch && matchSpecialty
  })

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
            {filtered.length} profissionais disponíveis · Encontre o Builder ideal para o seu projeto
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        {/* Search + Filter bar */}
        {/* Toggle busca semântica */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setSemanticMode(!semanticMode); setSemanticIntent('') }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 2, border: '0.5px solid', borderColor: semanticMode ? '#141310' : '#C2C1BC', background: semanticMode ? '#141310' : 'transparent', color: semanticMode ? '#C8F230' : '#8A8985', cursor: 'pointer' }}>
            <Sparkles size={12} /> Busca Inteligente IA
          </button>
          {semanticMode && <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985' }}>Descreva o que você precisa em linguagem natural</p>}
        </div>

        {semanticMode && (
          <div style={{ marginBottom: 16 }}>
            <div className="flex gap-2">
              <div style={{ position: 'relative', flex: 1 }}>
                <Sparkles size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#C8F230' }} />
                <input type="text" value={semanticQuery} onChange={e => setSemanticQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSemanticSearch()}
                  placeholder="Ex: Preciso de alguém para automatizar meu RH com IA..."
                  style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, background: '#141310', border: '0.5px solid #252420', borderRadius: 3, padding: '12px 14px 12px 40px', outline: 'none', color: '#FFFFFF' }} />
              </div>
              <button onClick={doSemanticSearch} disabled={semanticSearching || !semanticQuery.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#C8F230', color: '#141310', fontSize: 11, fontWeight: 600, padding: '12px 20px', borderRadius: 3, border: 'none', cursor: 'pointer' }}>
                {semanticSearching ? <Loader2 size={13} /> : <Search size={13} />} Buscar
              </button>
            </div>
            {semanticIntent && (
              <p style={{ fontSize: 11, fontWeight: 300, color: '#4A4946', marginTop: 8 }}>IA entendeu: <em>{semanticIntent}</em></p>
            )}
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#8A8985' }} />
            <input
              type="text"
              placeholder="Buscar por nome, especialidade, tecnologia..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px 11px 36px', outline: 'none' }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: showFilters ? '#141310' : '#FFFFFF',
            color: showFilters ? '#C8F230' : '#4A4946',
            border: '0.5px solid #C2C1BC', borderRadius: 3,
            padding: '11px 18px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
          }}>
            <SlidersHorizontal size={14} /> Filtros
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{ background: '#F5F5F3', border: '0.5px solid #E0DFDB', borderRadius: 8, padding: '20px 24px', marginBottom: 20 }}>
            <div className="flex flex-wrap gap-6 items-start">
              {/* Specialty */}
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
                        border: '0.5px solid #C2C1BC'
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
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
                        border: '0.5px solid #C2C1BC'
                      }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FMA */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Certificação</p>
                <button onClick={() => setOnlyFma(!onlyFma)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '4px 11px', borderRadius: 2, cursor: 'pointer',
                    background: onlyFma ? '#C8F230' : '#FFFFFF',
                    color: '#141310', border: '0.5px solid #C2C1BC'
                  }}>
                  {onlyFma && <X size={10} />} MBA FMA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Specialty quick filters */}
        {!showFilters && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            <button onClick={() => setSelectedSpecialty('')}
              style={{
                fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap',
                background: !selectedSpecialty ? '#141310' : '#FFFFFF',
                color: !selectedSpecialty ? '#C8F230' : '#4A4946',
                border: '0.5px solid #C2C1BC'
              }}>
              Todos
            </button>
            {SPECIALTIES.slice(0, 7).map(s => (
              <button key={s} onClick={() => setSelectedSpecialty(selectedSpecialty === s ? '' : s)}
                style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '5px 12px', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: selectedSpecialty === s ? '#141310' : '#FFFFFF',
                  color: selectedSpecialty === s ? '#C8F230' : '#4A4946',
                  border: '0.5px solid #C2C1BC'
                }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#141310', marginBottom: 8 }}>Nenhum Builder encontrado</p>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985' }}>Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filtered.map(b => (
              <BuilderCard key={b.id} {...b} />
            ))}
          </div>
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
