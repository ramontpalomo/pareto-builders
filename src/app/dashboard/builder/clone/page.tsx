'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Bot, ArrowLeft, Save, Eye, EyeOff, Sparkles, MessageSquare, DollarSign, Calendar, ToggleLeft, ToggleRight } from 'lucide-react'
import type { BuilderProfile } from '@/lib/types'

interface AiClone {
  id: string
  builder_id: string
  personality: string
  context: string
  can_discuss_pricing: boolean
  can_schedule_meetings: boolean
  greeting: string
  enabled: boolean
}

export default function ClonePage() {
  const router = useRouter()
  const [builder, setBuilder] = useState<BuilderProfile | null>(null)
  const [clone, setClone] = useState<AiClone | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMessages, setPreviewMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [previewInput, setPreviewInput] = useState('')
  const [previewSending, setPreviewSending] = useState(false)

  // Form state
  const [personality, setPersonality] = useState('')
  const [context, setContext] = useState('')
  const [greeting, setGreeting] = useState('')
  const [canPricing, setCanPricing] = useState(true)
  const [canMeetings, setCanMeetings] = useState(false)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: bp } = await supabase.from('builder_profiles').select('*').eq('user_id', user.id).single()
      if (!bp) { router.push('/'); return }
      setBuilder(bp)

      const { data: cloneData } = await supabase.from('ai_clones').select('*').eq('builder_id', bp.id).single()
      if (cloneData) {
        setClone(cloneData)
        setPersonality(cloneData.personality || '')
        setContext(cloneData.context || '')
        setGreeting(cloneData.greeting || '')
        setCanPricing(cloneData.can_discuss_pricing ?? true)
        setCanMeetings(cloneData.can_schedule_meetings ?? false)
        setEnabled(cloneData.enabled ?? true)
      } else {
        // Defaults inteligentes baseados no perfil
        setPersonality(`Sou o assistente de IA de ${bp.full_name}. Sou profissional, direto e focado em entender as necessidades da empresa antes de propor soluções. Respondo em português.`)
        setContext(`${bp.headline || ''}. ${bp.bio || ''}`)
        setGreeting(`Olá! Sou o assistente de IA de ${bp.full_name}. Posso responder perguntas sobre projetos, especialidades e disponibilidade. Como posso ajudar?`)
      }
    }
    load()
  }, [router])

  async function save() {
    if (!builder) return
    setSaving(true)
    const supabase = createClient()
    const data = {
      builder_id: builder.id,
      personality,
      context,
      greeting,
      can_discuss_pricing: canPricing,
      can_schedule_meetings: canMeetings,
      enabled,
      updated_at: new Date().toISOString(),
    }

    if (clone) {
      await supabase.from('ai_clones').update(data).eq('id', clone.id)
    } else {
      const { data: newClone } = await supabase.from('ai_clones').insert(data).select().single()
      if (newClone) setClone(newClone)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function sendPreview() {
    if (!previewInput.trim() || previewSending) return
    const msg = previewInput.trim()
    setPreviewInput('')
    setPreviewSending(true)
    setPreviewMessages(prev => [...prev, { role: 'user', content: msg }])

    try {
      const res = await fetch('/api/clone-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          builderName: builder?.full_name,
          personality,
          context,
          canPricing,
          history: previewMessages,
        }),
      })
      const json = await res.json()
      setPreviewMessages(prev => [...prev, { role: 'assistant', content: json.reply || 'Erro ao gerar resposta.' }])
    } catch {
      setPreviewMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com a IA. Verifique a configuração da API.' }])
    }
    setPreviewSending(false)
  }

  function openPreview() {
    setPreviewMessages([{ role: 'assistant', content: greeting || `Olá! Sou o assistente de IA de ${builder?.full_name?.split(' ')[0]}. Como posso ajudar?` }])
    setPreviewOpen(true)
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
          <Link href="/dashboard/builder" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#8A8985', fontSize: 13, textDecoration: 'none', marginBottom: 2 }}>
            <ArrowLeft size={15} /> Voltar ao Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, background: '#252420', color: '#C8F230', fontSize: 13, marginBottom: 2 }}>
            <Bot size={15} /> Meu Clone de IA
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '0.5px solid #252420' }}>
          {builder && (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>{builder.full_name}</p>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', maxWidth: 'calc(100% - 220px)' }}>
        <div style={{ maxWidth: 720 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Inteligência Artificial</p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px' }}>Meu Clone de IA</h1>
              <p style={{ fontSize: 14, fontWeight: 300, color: '#8A8985', marginTop: 6, lineHeight: 1.6 }}>
                Configure o agente que vai representar você 24h no marketplace. Empresas vão conversar com ele antes de qualquer reunião.
              </p>
            </div>
            {/* Status toggle */}
            <button onClick={() => setEnabled(!enabled)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '0.5px solid #E0DFDB', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', flexShrink: 0 }}>
              {enabled
                ? <><ToggleRight size={20} color="#A8CF1A" /> <span style={{ fontSize: 12, fontWeight: 500, color: '#A8CF1A' }}>Ativo</span></>
                : <><ToggleLeft size={20} color="#C2C1BC" /> <span style={{ fontSize: 12, fontWeight: 500, color: '#C2C1BC' }}>Inativo</span></>
              }
            </button>
          </div>

          {/* Capacidades */}
          <div style={{ background: '#141310', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>O que seu clone pode fazer</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: MessageSquare, label: 'Responder perguntas sobre projetos e especialidades', always: true },
                { icon: DollarSign, label: 'Discutir valores e proposta preliminar', key: 'pricing', value: canPricing, set: setCanPricing },
                { icon: Calendar, label: 'Sugerir agendamento de reunião', key: 'meetings', value: canMeetings, set: setCanMeetings },
              ].map(({ icon: Icon, label, always, value, set }) => (
                <div key={label} className="flex items-center gap-3">
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: (always || value) ? '#C8F230' : '#252420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={(always || value) ? '#141310' : '#8A8985'} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 300, color: '#FFFFFF', flex: 1 }}>{label}</span>
                  {!always && set && (
                    <button onClick={() => set(!value)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      {value
                        ? <ToggleRight size={22} color="#C8F230" />
                        : <ToggleLeft size={22} color="#4A4946" />
                      }
                    </button>
                  )}
                  {always && <span style={{ fontSize: 10, fontWeight: 500, color: '#4A4946', letterSpacing: '0.08em' }}>SEMPRE</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '32px', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Saudação inicial */}
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>
                  Saudação inicial
                </label>
                <p style={{ fontSize: 12, fontWeight: 300, color: '#C2C1BC', marginBottom: 8 }}>
                  Primeira mensagem que a empresa vê ao abrir o chat.
                </p>
                <textarea value={greeting} onChange={e => setGreeting(e.target.value)} rows={2}
                  placeholder="Ex: Olá! Sou o assistente de IA do João. Posso te contar sobre meus projetos e como posso ajudar sua empresa..."
                  style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none', resize: 'vertical' }} />
              </div>

              {/* Personalidade */}
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>
                  Personalidade e tom de voz
                </label>
                <p style={{ fontSize: 12, fontWeight: 300, color: '#C2C1BC', marginBottom: 8 }}>
                  Como você quer que seu clone se comporte? Ex: direto, consultivo, empático, técnico...
                </p>
                <textarea value={personality} onChange={e => setPersonality(e.target.value)} rows={3}
                  placeholder="Ex: Sou consultivo e objetivo. Faço perguntas para entender o problema antes de propor soluções. Uso linguagem acessível, sem jargões desnecessários."
                  style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none', resize: 'vertical' }} />
              </div>

              {/* Contexto */}
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>
                  Contexto sobre você e seu trabalho
                </label>
                <p style={{ fontSize: 12, fontWeight: 300, color: '#C2C1BC', marginBottom: 8 }}>
                  Quanto mais contexto, melhor o clone vai representar você. Fale sobre experiências, setores, tecnologias e casos de uso.
                </p>
                <textarea value={context} onChange={e => setContext(e.target.value)} rows={5}
                  placeholder="Ex: Tenho 5 anos de experiência implementando LLMs e agentes de IA para empresas do varejo e saúde. Meus projetos mais recentes incluem chatbots com RAG, pipelines de automação com LangChain e integrações com ERPs..."
                  style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} style={{
              flex: 1, background: '#141310', color: '#C8F230',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '13px', borderRadius: 3, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <Save size={14} />
              {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar configuração'}
            </button>
            <button onClick={openPreview} style={{
              background: '#FFFFFF', color: '#141310',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '13px 24px', borderRadius: 3, border: '0.5px solid #C2C1BC', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Sparkles size={14} /> Testar clone
            </button>
          </div>

          {/* Dica */}
          <div style={{ background: '#F5F5F3', border: '0.5px solid #E0DFDB', borderRadius: 8, padding: '16px 20px', marginTop: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985', lineHeight: 1.7 }}>
              <strong style={{ color: '#141310', fontWeight: 500 }}>Dica:</strong> Adicione projetos e certificações no seu dashboard — o clone usa essas informações automaticamente para responder sobre seu portfólio.
            </p>
          </div>
        </div>
      </main>

      {/* PREVIEW CHAT MODAL */}
      {previewOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,19,16,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '0.5px solid #E0DFDB', width: '100%', maxWidth: 420, height: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E0DFDB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141310' }}>
              <div className="flex items-center gap-2">
                <Bot size={16} color="#C8F230" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>Pré-visualização do Clone</p>
                  <p style={{ fontSize: 10, color: '#8A8985' }}>Como as empresas vão te ver</p>
                </div>
              </div>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8985', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {previewMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user' ? '#141310' : '#F5F5F3',
                    color: m.role === 'user' ? '#FFFFFF' : '#141310',
                    fontSize: 13, fontWeight: 300, lineHeight: 1.6
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {previewSending && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 16px', borderRadius: '12px 12px 12px 2px', background: '#F5F5F3', fontSize: 13, color: '#8A8985' }}>Digitando...</div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '0.5px solid #E0DFDB', display: 'flex', gap: 8 }}>
              <input
                type="text" value={previewInput} onChange={e => setPreviewInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendPreview()}
                placeholder="Digite uma mensagem para testar..."
                style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#F5F5F3', border: 'none', borderRadius: 3, padding: '10px 14px', outline: 'none' }}
              />
              <button onClick={sendPreview} disabled={previewSending || !previewInput.trim()} style={{
                background: '#141310', color: '#C8F230', border: 'none', borderRadius: 3,
                padding: '10px 14px', cursor: 'pointer'
              }}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
