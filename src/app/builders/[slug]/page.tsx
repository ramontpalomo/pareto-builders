'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { MapPin, Globe, ShieldCheck, Bot, ExternalLink, Send, X, Link2, Code2 } from 'lucide-react'
import type { BuilderProfile, Certification, Project } from '@/lib/types'

const MOCK_BUILDER: BuilderProfile = {
  id: '1', user_id: 'u1', slug: 'lucas-mendonca',
  full_name: 'Lucas Mendonça', headline: 'Agentes de IA & Automação com LLMs',
  bio: 'Especialista em implementação de agentes de IA com mais de 5 anos de experiência. Já ajudei +30 empresas a automatizar processos e aumentar produtividade com Inteligência Artificial. Formado com nota 9.5 no MBA em IA da Faculdade Mar Atlântico.',
  avatar_url: undefined, location: 'São Paulo, SP',
  linkedin_url: '#', github_url: '#', website_url: '#',
  specialties: ['LLM & Agentes', 'RAG & Search', 'Automação', 'NLP', 'Python'],
  years_experience: 5, availability: 'available',
  fma_verified: true, fma_grade: '9.5', profile_score: 95,
  created_at: '', updated_at: ''
}
const MOCK_CERTS: Certification[] = [
  { id: 'c1', builder_id: '1', name: 'MBA em Inteligência Artificial', issuer: 'Faculdade Mar Atlântico', issued_at: '2024-06-15', is_fma: true, verified: true },
  { id: 'c2', builder_id: '1', name: 'AWS Certified ML Specialist', issuer: 'Amazon Web Services', issued_at: '2023-11-01', is_fma: false, verified: false },
]
const MOCK_PROJECTS: Project[] = [
  { id: 'p1', builder_id: '1', title: 'Agente de Atendimento para E-commerce', description: 'Implementei um agente conversacional com RAG que reduziu 60% do volume do suporte humano em uma loja com 50k clientes/mês.', tags: ['LangChain', 'OpenAI', 'RAG', 'Python'], results: '60% redução no suporte · ROI em 3 meses', created_at: '' },
  { id: 'p2', builder_id: '1', title: 'Pipeline de Análise de Contratos com IA', description: 'Sistema de extração e análise automática de contratos jurídicos usando LLMs, reduzindo o tempo de revisão de 2h para 5min.', tags: ['GPT-4', 'LangGraph', 'Python', 'FastAPI'], results: '95% redução no tempo de revisão', created_at: '' },
]

const availStyle = { available: { label: 'Disponível para projetos', color: '#A8CF1A' }, busy: { label: 'Ocupado no momento', color: '#C2C1BC' }, unavailable: { label: 'Indisponível', color: '#E0DFDB' } }

export default function BuilderProfilePage() {
  const { slug } = useParams()
  const [builder, setBuilder] = useState<BuilderProfile | null>(null)
  const [certs, setCerts] = useState<Certification[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Olá! Sou o assistente de IA de ${MOCK_BUILDER.full_name}. Posso te contar sobre seus projetos, especialidades e disponibilidade. O que você gostaria de saber?` }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [cloneConfig, setCloneConfig] = useState<{ personality?: string; context?: string; can_pricing?: boolean; greeting?: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data } = await supabase.from('builder_profiles').select('*').eq('slug', slug).single()
      if (data) {
        setBuilder(data)
        const [certsRes, projRes, cloneRes] = await Promise.all([
          supabase.from('certifications').select('*').eq('builder_id', data.id),
          supabase.from('projects').select('*').eq('builder_id', data.id),
          supabase.from('ai_clones').select('*').eq('builder_id', data.id).single(),
        ])
        setCerts(certsRes.data || [])
        setProjects(projRes.data || [])
        if (cloneRes.data) {
          setCloneConfig(cloneRes.data)
          setMessages([{ role: 'assistant', content: cloneRes.data.greeting || `Olá! Sou o assistente de IA de ${data.full_name}. Como posso ajudar?` }])
        } else {
          setMessages([{ role: 'assistant', content: `Olá! Sou o assistente de IA de ${data.full_name}. Posso te contar sobre projetos, especialidades e disponibilidade. O que gostaria de saber?` }])
        }
      } else {
        setBuilder(MOCK_BUILDER)
        setCerts(MOCK_CERTS)
        setProjects(MOCK_PROJECTS)
        setMessages([{ role: 'assistant', content: `Olá! Sou o assistente de IA de ${MOCK_BUILDER.full_name}. Como posso ajudar com seu projeto de IA?` }])
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  async function sendMessage() {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    setSending(true)
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newMessages)

    try {
      const res = await fetch('/api/clone-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          builderName: builder?.full_name,
          personality: cloneConfig?.personality || '',
          context: cloneConfig?.context || `Builder especializado em ${builder?.specialties?.join(', ')}. ${builder?.years_experience} anos de experiência.`,
          canPricing: cloneConfig?.can_pricing ?? false,
          history: messages,
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Desculpe, não consegui processar sua mensagem.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com o assistente. Tente novamente.' }])
    }
    setSending(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 13, color: '#8A8985' }}>Carregando perfil...</p>
    </div>
  )

  const b = builder!
  const avail = availStyle[b.availability]

  return (
    <div className="flex flex-col min-h-screen" style={{ position: 'relative' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Profile */}
          <div className="lg:col-span-2">
            {/* Header card */}
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 16, padding: '36px 32px', marginBottom: 16 }}>
              <div className="flex items-start gap-5">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#EFEEEB', border: '0.5px solid #E0DFDB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {b.avatar_url ? <img src={b.avatar_url} alt={b.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> :
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#8A8985' }}>{b.full_name.charAt(0)}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#141310', letterSpacing: '-0.5px' }}>{b.full_name}</h1>
                    {b.fma_verified && (
                      <div className="flex items-center gap-1" style={{ background: '#C8F230', padding: '3px 8px', borderRadius: 2 }}>
                        <ShieldCheck size={11} color="#141310" />
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#141310' }}>MBA FMA {b.fma_grade && `· ${b.fma_grade}`}</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 300, color: '#4A4946', marginBottom: 10 }}>{b.headline}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {b.location && <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#8A8985' }}><MapPin size={12} />{b.location}</span>}
                    <span style={{ fontSize: 12, color: '#8A8985' }}>{b.years_experience}+ anos de experiência</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: avail.color }}>● {avail.label}</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              {(b.linkedin_url || b.github_url || b.website_url) && (
                <div className="flex gap-3 mt-5 pt-5" style={{ borderTop: '0.5px solid #EFEEEB' }}>
                  {b.linkedin_url && <a href={b.linkedin_url} style={{ fontSize: 12, color: '#4A4946', display: 'flex', alignItems: 'center', gap: 5 }}><Link2 size={13} /> LinkedIn</a>}
                  {b.github_url && <a href={b.github_url} style={{ fontSize: 12, color: '#4A4946', display: 'flex', alignItems: 'center', gap: 5 }}><Code2 size={13} /> GitHub</a>}
                  {b.website_url && <a href={b.website_url} style={{ fontSize: 12, color: '#4A4946', display: 'flex', alignItems: 'center', gap: 5 }}><Globe size={13} /> Website</a>}
                </div>
              )}
            </div>

            {/* Bio */}
            {b.bio && (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px 32px', marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 14 }}>Sobre</p>
                <p style={{ fontSize: 14, fontWeight: 300, color: '#4A4946', lineHeight: 1.75 }}>{b.bio}</p>
              </div>
            )}

            {/* Specialties */}
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px 32px', marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {b.specialties.map(s => (
                  <span key={s} style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 2, background: '#EFEEEB', color: '#4A4946' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Projects */}
            {projects.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px 32px', marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 20 }}>Projetos & Cases</p>
                <div className="flex flex-col gap-5">
                  {projects.map(p => (
                    <div key={p.id} style={{ paddingBottom: 20, borderBottom: '0.5px solid #EFEEEB' }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#141310', letterSpacing: '-0.2px' }}>{p.title}</h3>
                        {p.demo_url && <a href={p.demo_url} style={{ fontSize: 11, color: '#8A8985', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> Demo</a>}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 300, color: '#4A4946', lineHeight: 1.65, marginBottom: 10 }}>{p.description}</p>
                      {p.results && (
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#A8CF1A', marginBottom: 10 }}>✓ {p.results}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 2, background: '#F5F5F3', color: '#8A8985', fontWeight: 500 }}>{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px 32px' }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Certificações</p>
                <div className="flex flex-col gap-4">
                  {certs.map(c => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.is_fma ? '#C8F230' : '#EFEEEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={14} color={c.is_fma ? '#141310' : '#8A8985'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#141310' }}>{c.name}</p>
                        <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985' }}>{c.issuer} {c.issued_at && `· ${new Date(c.issued_at).getFullYear()}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="flex flex-col gap-4">
            {/* AI Clone CTA */}
            <div style={{ background: '#141310', borderRadius: 12, padding: '28px 24px' }}>
              <div className="flex items-center gap-2 mb-3">
                <Bot size={16} color="#C8F230" />
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8F230' }}>Clone de IA</p>
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 10 }}>
                Converse com o agente de IA de {b.full_name.split(' ')[0]}
              </p>
              <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985', lineHeight: 1.65, marginBottom: 20 }}>
                Tire dúvidas sobre projetos, valores e disponibilidade — 24h por dia, sem esperar.
              </p>
              <button onClick={() => setShowChat(true)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                background: '#C8F230', color: '#141310',
                fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '13px', borderRadius: 3, border: 'none', cursor: 'pointer'
              }}>
                <Bot size={14} /> Iniciar conversa
              </button>
            </div>

            {/* Profile score */}
            <div style={{ background: '#F5F5F3', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '24px' }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 12 }}>Score do Perfil</p>
              <div className="flex items-end gap-2 mb-2">
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#141310', letterSpacing: '-1px' }}>{b.profile_score}</span>
                <span style={{ fontSize: 13, color: '#8A8985', marginBottom: 4 }}>/100</span>
              </div>
              <div style={{ height: 4, background: '#E0DFDB', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.profile_score}%`, background: '#C8F230', borderRadius: 2 }} />
              </div>
            </div>

            {/* Contact */}
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '24px' }}>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', lineHeight: 1.65, marginBottom: 16 }}>
                Prefere entrar em contato direto? Mande uma mensagem.
              </p>
              <Link href={`/auth/signup?role=company`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#141310', color: '#FFFFFF',
                fontSize: 12, fontWeight: 500, letterSpacing: '0.04em',
                padding: '12px', borderRadius: 3, textDecoration: 'none'
              }}>
                Entrar em contato
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT MODAL */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,19,16,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '0.5px solid #E0DFDB', width: '100%', maxWidth: 420, height: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Chat header */}
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E0DFDB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141310' }}>
              <div className="flex items-center gap-2">
                <Bot size={16} color="#C8F230" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>Clone de IA · {b.full_name.split(' ')[0]}</p>
                  <p style={{ fontSize: 10, color: '#8A8985' }}>Responde instantaneamente</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8985' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user' ? '#141310' : '#F5F5F3',
                    color: m.role === 'user' ? '#FFFFFF' : '#141310',
                    fontSize: 13, fontWeight: 300, lineHeight: 1.6
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 16px', borderRadius: '12px 12px 12px 2px', background: '#F5F5F3', fontSize: 13, color: '#8A8985' }}>
                    Digitando...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '0.5px solid #E0DFDB', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua pergunta..."
                style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#F5F5F3', border: 'none', borderRadius: 3, padding: '10px 14px', outline: 'none' }}
              />
              <button onClick={sendMessage} disabled={sending || !input.trim()} style={{
                background: '#141310', color: '#C8F230', border: 'none', borderRadius: 3,
                padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
