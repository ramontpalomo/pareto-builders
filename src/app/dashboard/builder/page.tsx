'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User, Briefcase, ShieldCheck, BarChart2, LogOut, Eye, Plus, Bot, Trash2, ExternalLink } from 'lucide-react'
import type { BuilderProfile, Certification, Project } from '@/lib/types'

type Tab = 'overview' | 'profile' | 'projects' | 'certifications'

export default function BuilderDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [builder, setBuilder] = useState<BuilderProfile | null>(null)
  const [certs, setCerts] = useState<Certification[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile form state
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [website, setWebsite] = useState('')
  const [specialtiesText, setSpecialtiesText] = useState('')
  const [yearsExp, setYearsExp] = useState(0)
  const [availability, setAvailability] = useState<'available' | 'busy' | 'unavailable'>('available')

  // Add project form
  const [addingProject, setAddingProject] = useState(false)
  const [projTitle, setProjTitle] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projTags, setProjTags] = useState('')
  const [projResults, setProjResults] = useState('')
  const [projDemo, setProjDemo] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: bp } = await supabase.from('builder_profiles').select('*').eq('user_id', user.id).single()
      if (!bp) { router.push('/'); return }
      setBuilder(bp)
      setHeadline(bp.headline || '')
      setBio(bp.bio || '')
      setLocation(bp.location || '')
      setLinkedin(bp.linkedin_url || '')
      setGithub(bp.github_url || '')
      setWebsite(bp.website_url || '')
      setSpecialtiesText((bp.specialties || []).join(', '))
      setYearsExp(bp.years_experience || 0)
      setAvailability(bp.availability || 'available')

      const { data: c } = await supabase.from('certifications').select('*').eq('builder_id', bp.id)
      const { data: p } = await supabase.from('projects').select('*').eq('builder_id', bp.id)
      setCerts(c || [])
      setProjects(p || [])
    }
    load()
  }, [router])

  async function saveProfile() {
    if (!builder) return
    setSaving(true)
    const supabase = createClient()
    const specialties = specialtiesText.split(',').map(s => s.trim()).filter(Boolean)
    await supabase.from('builder_profiles').update({
      headline, bio, location,
      linkedin_url: linkedin, github_url: github, website_url: website,
      specialties, years_experience: yearsExp, availability,
      updated_at: new Date().toISOString()
    }).eq('id', builder.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addProject() {
    if (!builder || !projTitle) return
    const supabase = createClient()
    const tags = projTags.split(',').map(t => t.trim()).filter(Boolean)
    const { data } = await supabase.from('projects').insert({
      builder_id: builder.id, title: projTitle, description: projDesc,
      tags, results: projResults, demo_url: projDemo
    }).select().single()
    if (data) setProjects(prev => [...prev, data])
    setProjTitle(''); setProjDesc(''); setProjTags(''); setProjResults(''); setProjDemo('')
    setAddingProject(false)
  }

  async function deleteProject(id: string) {
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const tabs: { id: Tab; icon: typeof User; label: string }[] = [
    { id: 'overview', icon: BarChart2, label: 'Visão Geral' },
    { id: 'profile', icon: User, label: 'Meu Perfil' },
    { id: 'projects', icon: Briefcase, label: 'Projetos' },
    { id: 'certifications', icon: ShieldCheck, label: 'Certificações' },
  ]

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
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 6, marginBottom: 2,
                background: tab === id ? '#252420' : 'transparent',
                color: tab === id ? '#C8F230' : '#8A8985',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 400,
                textAlign: 'left', transition: 'all 0.15s'
              }}>
              <Icon size={15} />
              {label}
            </button>
          ))}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #252420' }}>
            {builder && (
              <Link href={`/builders/${builder.slug}`} target="_blank"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#8A8985', fontSize: 13, marginBottom: 2, textDecoration: 'none' }}>
                <Eye size={15} /> Ver meu perfil
              </Link>
            )}
            <Link href="/dashboard/builder/clone"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#8A8985', fontSize: 13, marginBottom: 2, textDecoration: 'none' }}>
              <Bot size={15} /> Meu Clone de IA
            </Link>
          </div>
        </div>

        <div style={{ padding: '16px 12px', borderTop: '0.5px solid #252420' }}>
          {builder && (
            <div style={{ padding: '8px 12px', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>{builder.full_name}</p>
              <p style={{ fontSize: 10, color: '#8A8985', marginTop: 1 }}>AI Builder</p>
            </div>
          )}
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, color: '#8A8985', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px' }}>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Dashboard</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 28 }}>
              Olá, {builder?.full_name.split(' ')[0]} 👋
            </h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Visualizações do perfil', value: builder?.views_count || 0, unit: '' },
                { label: 'Score do perfil', value: builder?.profile_score || 0, unit: '/100' },
                { label: 'Projetos adicionados', value: projects.length, unit: '' },
                { label: 'Certificações', value: certs.length, unit: '' },
              ].map(({ label, value, unit }) => (
                <div key={label} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 10, padding: '20px 20px 16px' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 300, color: '#141310', letterSpacing: '-1px', lineHeight: 1 }}>
                    {value}<span style={{ fontSize: 16, color: '#C2C1BC' }}>{unit}</span>
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985', marginTop: 6, letterSpacing: '0.02em' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Checklist de perfil */}
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px' }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Complete seu perfil para aparecer mais</p>
              <div className="flex flex-col gap-3">
                {[
                  { done: !!builder?.headline, label: 'Adicione um headline profissional', action: () => setTab('profile') },
                  { done: !!builder?.bio, label: 'Escreva sua bio', action: () => setTab('profile') },
                  { done: (builder?.specialties?.length || 0) > 0, label: 'Defina suas especialidades', action: () => setTab('profile') },
                  { done: projects.length > 0, label: 'Adicione ao menos 1 projeto', action: () => setTab('projects') },
                  { done: certs.length > 0, label: 'Adicione suas certificações', action: () => setTab('certifications') },
                  { done: builder?.fma_verified || false, label: 'Verifique seu diploma FMA (destaque no marketplace)', action: () => setTab('certifications') },
                ].map(({ done, label, action }) => (
                  <button key={label} onClick={action}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '8px 0' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '0.5px solid', borderColor: done ? '#A8CF1A' : '#C2C1BC', background: done ? '#A8CF1A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: done ? 300 : 400, color: done ? '#8A8985' : '#141310', textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
                    {!done && <span style={{ fontSize: 11, color: '#C8F230', background: '#141310', padding: '2px 8px', borderRadius: 2, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Fazer agora →</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 640 }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Configurações</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 28 }}>Meu Perfil</h1>

            <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Headline profissional', value: headline, set: setHeadline, placeholder: 'Ex: Especialista em Agentes de IA & RAG', type: 'text' },
                  { label: 'Localização', value: location, set: setLocation, placeholder: 'Ex: São Paulo, SP', type: 'text' },
                  { label: 'LinkedIn', value: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/seu-perfil', type: 'url' },
                  { label: 'GitHub', value: github, set: setGithub, placeholder: 'https://github.com/seu-usuario', type: 'url' },
                  { label: 'Website', value: website, set: setWebsite, placeholder: 'https://seusite.com', type: 'url' },
                  { label: 'Especialidades (separadas por vírgula)', value: specialtiesText, set: setSpecialtiesText, placeholder: 'LLM & Agentes, RAG, Python, LangChain', type: 'text' },
                ].map(({ label, value, set, placeholder, type }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>{label}</label>
                    <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                      style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none' }} />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Fale sobre sua experiência, projetos e como você ajuda empresas..."
                    style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none', resize: 'vertical' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Anos de experiência</label>
                  <input type="number" min={0} max={40} value={yearsExp} onChange={e => setYearsExp(Number(e.target.value))}
                    style={{ width: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '11px 14px', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Disponibilidade</label>
                  <div className="flex gap-2">
                    {[{ v: 'available', l: 'Disponível' }, { v: 'busy', l: 'Ocupado' }, { v: 'unavailable', l: 'Indisponível' }].map(({ v, l }) => (
                      <button key={v} onClick={() => setAvailability(v as typeof availability)}
                        style={{ fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 2, cursor: 'pointer', border: '0.5px solid #C2C1BC', background: availability === v ? '#141310' : '#FFFFFF', color: availability === v ? '#C8F230' : '#4A4946' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving} style={{
                  background: '#141310', color: '#C8F230', fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase', padding: '13px',
                  borderRadius: 3, border: 'none', cursor: 'pointer', marginTop: 8
                }}>
                  {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {tab === 'projects' && (
          <div style={{ maxWidth: 700 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Portfólio</p>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px' }}>Meus Projetos</h1>
              </div>
              <button onClick={() => setAddingProject(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#141310', color: '#C8F230', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', padding: '10px 18px', borderRadius: 3, border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Adicionar projeto
              </button>
            </div>

            {/* Add project form */}
            {addingProject && (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #C8F230', borderRadius: 12, padding: '28px', marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#141310', marginBottom: 20 }}>Novo projeto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Título do projeto', value: projTitle, set: setProjTitle, placeholder: 'Ex: Agente de atendimento para e-commerce' },
                    { label: 'Tags/tecnologias (separadas por vírgula)', value: projTags, set: setProjTags, placeholder: 'LangChain, OpenAI, RAG, Python' },
                    { label: 'Resultado alcançado', value: projResults, set: setProjResults, placeholder: 'Ex: 60% redução no tempo de suporte' },
                    { label: 'Link da demo (opcional)', value: projDemo, set: setProjDemo, placeholder: 'https://' },
                  ].map(({ label, value, set, placeholder }) => (
                    <div key={label}>
                      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>{label}</label>
                      <input type="text" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                        style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '10px 14px', outline: 'none' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Descrição</label>
                    <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} rows={3} placeholder="Descreva o projeto, o problema resolvido e sua abordagem..."
                      style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#141310', background: '#FFFFFF', border: '0.5px solid #C2C1BC', borderRadius: 3, padding: '10px 14px', outline: 'none', resize: 'vertical' }} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={addProject} style={{ background: '#141310', color: '#C8F230', fontSize: 11, fontWeight: 500, padding: '10px 20px', borderRadius: 3, border: 'none', cursor: 'pointer' }}>Salvar projeto</button>
                    <button onClick={() => setAddingProject(false)} style={{ background: 'transparent', color: '#8A8985', fontSize: 11, fontWeight: 400, padding: '10px 20px', borderRadius: 3, border: '0.5px solid #C2C1BC', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects list */}
            {projects.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#141310', marginBottom: 8 }}>Nenhum projeto ainda</p>
                <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985' }}>Adicione seus projetos para fortalecer seu portfólio.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {projects.map(p => (
                  <div key={p.id} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 10, padding: '24px 28px' }}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#141310', letterSpacing: '-0.2px' }}>{p.title}</h3>
                      <div className="flex gap-2">
                        {p.demo_url && <a href={p.demo_url} target="_blank" style={{ color: '#8A8985' }}><ExternalLink size={14} /></a>}
                        <button onClick={() => deleteProject(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C2C1BC' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 300, color: '#4A4946', lineHeight: 1.65, marginBottom: 10 }}>{p.description}</p>
                    {p.results && <p style={{ fontSize: 11, fontWeight: 500, color: '#A8CF1A', marginBottom: 10 }}>✓ {p.results}</p>}
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 2, background: '#F5F5F3', color: '#8A8985' }}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATIONS TAB */}
        {tab === 'certifications' && (
          <div style={{ maxWidth: 640 }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 6 }}>Credenciais</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px', marginBottom: 28 }}>Certificações</h1>

            {/* FMA Banner */}
            <div style={{ background: '#141310', borderRadius: 12, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <ShieldCheck size={28} color="#C8F230" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF', marginBottom: 4 }}>Você tem diploma MBA em IA da FMA?</p>
                <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985', lineHeight: 1.6 }}>Envie o diploma para validação. Após aprovação, você recebe o selo FMA e aparece em destaque no marketplace.</p>
              </div>
            </div>

            {certs.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#141310', marginBottom: 8 }}>Nenhuma certificação ainda</p>
                <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985' }}>Adicione suas certificações para aumentar sua credibilidade.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {certs.map(c => (
                  <div key={c.id} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.is_fma ? '#C8F230' : '#EFEEEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={16} color={c.is_fma ? '#141310' : '#8A8985'} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#141310' }}>{c.name}</p>
                      <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985' }}>{c.issuer} {c.issued_at && `· ${new Date(c.issued_at).getFullYear()}`}</p>
                    </div>
                    {c.verified && <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#C8F230', color: '#141310', padding: '3px 8px', borderRadius: 2 }}>Verificado</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
