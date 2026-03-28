'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Bot, Building2, ShieldCheck, ArrowRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const BUILDERS = [
  { name: 'Lucas Mendonça', email: 'lucas.mendonca@pareto-demo.io', slug: 'lucas-mendonca', specialty: 'LLM & Agentes', fma: true, grade: '9.5', score: 95 },
  { name: 'Marina Oliveira', email: 'marina.oliveira@pareto-demo.io', slug: 'marina-oliveira', specialty: 'Machine Learning', fma: true, grade: '9.8', score: 98 },
  { name: 'Carlos Santos', email: 'carlos.santos@pareto-demo.io', slug: 'carlos-santos', specialty: 'Automação N8N', fma: false, grade: null, score: 72 },
  { name: 'Juliana Ferreira', email: 'juliana.ferreira@pareto-demo.io', slug: 'juliana-ferreira', specialty: 'Computer Vision', fma: true, grade: '8.9', score: 88 },
  { name: 'Rafael Costa', email: 'rafael.costa@pareto-demo.io', slug: 'rafael-costa', specialty: 'IA para RH', fma: false, grade: null, score: 78 },
  { name: 'André Ribeiro', email: 'andre.ribeiro@pareto-demo.io', slug: 'andre-ribeiro', specialty: 'Full-stack IA', fma: true, grade: '9.1', score: 85 },
  { name: 'Sofia Lima', email: 'sofia.lima@pareto-demo.io', slug: 'sofia-lima', specialty: 'IA para Marketing', fma: false, grade: null, score: 80 },
  { name: 'Pedro Alves', email: 'pedro.alves@pareto-demo.io', slug: 'pedro-alves', specialty: 'RAG & Search', fma: true, grade: '9.0', score: 90 },
]

const COMPANIES = [
  { name: 'TechVision Corp', email: 'techvision@pareto-demo.io', industry: 'Tecnologia & SaaS' },
  { name: 'RH Digital', email: 'rhdigital@pareto-demo.io', industry: 'RH & HRTech' },
  { name: 'Varejo Plus', email: 'varejoplus@pareto-demo.io', industry: 'Varejo & E-commerce' },
]

const SENHA = 'Demo@2026'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8985', padding: 2 }}>
      {copied ? <Check size={13} color="#C8F230" /> : <Copy size={13} />}
    </button>
  )
}

export default function DemoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 8 }}>
            Acesso Demo
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#141310', letterSpacing: '-1px', marginBottom: 10 }}>
            Teste o Pareto Builders
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, color: '#4A4946', maxWidth: 520 }}>
            Use as credenciais abaixo para explorar a plataforma como Builder ou Empresa. Todos os recursos de IA estão ativos — incluindo Clone de IA, Briefing Inteligente e Match Score.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#141310', borderRadius: 4, padding: '8px 16px', marginTop: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 300, color: '#8A8985' }}>Senha de todos os usuários:</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#C8F230', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{SENHA}</span>
            <CopyButton text={SENHA} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BUILDERS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot size={16} color="#C8F230" />
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#141310' }}>
                AI Builders ({BUILDERS.length} contas)
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BUILDERS.map((b) => (
                <div key={b.email} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 8, padding: '16px 20px' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#141310' }}>{b.name}</p>
                        {b.fma && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#C8F230', padding: '2px 6px', borderRadius: 2, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#141310' }}>
                            <ShieldCheck size={9} /> FMA {b.grade}
                          </span>
                        )}
                        <span style={{ fontSize: 9, fontWeight: 500, color: '#8A8985' }}>Score {b.score}</span>
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985', marginBottom: 8 }}>{b.specialty}</p>
                      <div className="flex items-center gap-2">
                        <code style={{ fontSize: 11, color: '#4A4946', background: '#F5F5F3', padding: '2px 8px', borderRadius: 2, fontFamily: 'monospace' }}>{b.email}</code>
                        <CopyButton text={b.email} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Link href={`/builders/${b.slug}`} style={{
                        fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: '#8A8985', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                        border: '0.5px solid #E0DFDB', borderRadius: 2, padding: '4px 10px'
                      }}>
                        Perfil
                      </Link>
                      <Link href={`/auth/login`} style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: '#141310', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                        background: '#C8F230', borderRadius: 2, padding: '4px 10px'
                      }}>
                        Login <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* EMPRESAS */}
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} color="#141310" />
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#141310' }}>
                Empresas ({COMPANIES.length} contas)
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {COMPANIES.map((c) => (
                <div key={c.email} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 8, padding: '16px 20px' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#141310', marginBottom: 2 }}>{c.name}</p>
                      <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985', marginBottom: 8 }}>{c.industry}</p>
                      <div className="flex items-center gap-2">
                        <code style={{ fontSize: 11, color: '#4A4946', background: '#F5F5F3', padding: '2px 8px', borderRadius: 2, fontFamily: 'monospace' }}>{c.email}</code>
                        <CopyButton text={c.email} />
                      </div>
                    </div>
                    <Link href="/auth/login" style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: '#141310', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                      background: '#C8F230', borderRadius: 2, padding: '4px 10px'
                    }}>
                      Login <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* O que testar */}
            <div style={{ background: '#141310', borderRadius: 12, padding: '24px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8F230', marginBottom: 16 }}>
                O que testar
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { role: 'Como Builder', items: ['Score de Perfil com IA', 'Gerador de Case Study', 'Análise de TCC', 'Configurar Clone de IA', 'Radar de Demanda'] },
                  { role: 'Como Empresa', items: ['Briefing Inteligente + Match', 'Estimador de Complexidade', 'Comparador de Builders', 'Chat com Clone de IA nos perfis'] },
                ].map((s) => (
                  <div key={s.role}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 8 }}>{s.role}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.items.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C8F230', flexShrink: 0 }} />
                          <p style={{ fontSize: 12, fontWeight: 300, color: '#C2C1BC' }}>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '0.5px solid #252420' }}>
                <Link href="/builders" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#C8F230', color: '#141310',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '12px', borderRadius: 3, textDecoration: 'none'
                }}>
                  Ver Marketplace <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
