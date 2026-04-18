import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Sparkles, Bot, ShieldCheck, BarChart3, MessageSquare, Clock, CheckCircle, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Briefing Inteligente com IA',
    description: 'Descreva seu projeto em linguagem natural. A IA estrutura os requisitos, estima complexidade e ranqueia os builders mais adequados com score de compatibilidade.',
  },
  {
    icon: Bot,
    title: 'Clone de IA de cada Builder',
    description: 'Converse com o agente de IA personalizado de cada builder antes de contratar. Valide o fit técnico e cultural sem precisar agendar uma call.',
  },
  {
    icon: BarChart3,
    title: 'Match Score & Comparador',
    description: 'Receba uma análise detalhada de compatibilidade para cada builder. Compare até 3 lado a lado com análise da IA baseada nos seus requisitos específicos.',
  },
  {
    icon: ShieldCheck,
    title: 'Builders Verificados pelo FMA',
    description: 'Todos os builders passaram pela certificação FMA (Fundamentos de Machine/AI). Competências verificadas, projetos auditados, reputação validada.',
  },
  {
    icon: Clock,
    title: 'Estimador de Prazo e Orçamento',
    description: 'Antes de selecionar builders, receba uma estimativa de complexidade, prazo e orçamento baseada na sua descrição — sem precisar de proposta formal.',
  },
  {
    icon: MessageSquare,
    title: 'Busca Semântica',
    description: 'Encontre builders descrevendo o problema de negócio, não a tecnologia. "Quero reduzir custo de atendimento com IA" → a IA mapeia para os especialistas certos.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Descreva seu projeto',
    description: 'Em linguagem natural, sem precisar saber de tecnologia. "Quero automatizar análise de contratos" é suficiente.',
  },
  {
    number: '02',
    title: 'IA analisa e ranqueia',
    description: 'Nosso sistema entende a necessidade, estima complexidade, orçamento e encontra os builders com maior fit para o seu contexto.',
  },
  {
    number: '03',
    title: 'Valide antes de contratar',
    description: 'Converse com o clone de IA de cada builder, compare perfis lado a lado e tome a decisão com segurança.',
  },
]

const SECTORS = [
  'Varejo & E-commerce', 'Saúde & MedTech', 'Finanças & FinTech',
  'Jurídico & LegalTech', 'RH & PeopleTech', 'Indústria & Manufatura',
  'Logística', 'Agronegócio', 'Educação', 'Marketing & Growth',
]

const TESTIMONIALS = [
  {
    quote: 'Descrevemos nosso desafio de conciliação fiscal e em 5 minutos tínhamos 3 builders ranqueados com justificativa. Contratamos o Carlos no dia seguinte.',
    author: 'Diretor de TI',
    company: 'FinTech regional, 300 colaboradores',
  },
  {
    quote: 'O clone de IA do builder me convenceu antes mesmo de falar com ele. Sabia exatamente como resolver nosso problema de visão computacional em loja.',
    author: 'Head de Inovação',
    company: 'Rede varejista, 80 lojas',
  },
  {
    quote: 'O Estimador de Complexidade nos ajudou a calibrar o budget com o board antes de começar o processo. Isso foi fundamental para a aprovação.',
    author: 'CTO',
    company: 'Startup SaaS B2B',
  },
]

export default function ParaEmpresasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section style={{ background: '#F5F5F3', borderBottom: '0.5px solid #E0DFDB' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8985' }}>Para Empresas</span>
              <span style={{ width: 32, height: '0.5px', background: '#C2C1BC', display: 'block' }} />
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985' }}>Pareto Builders</span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 5.5vw, 68px)',
              fontWeight: 900, lineHeight: 0.95,
              letterSpacing: '-2.5px', color: '#141310', marginBottom: 24,
            }}>
              Contrate IA real.<br />
              <em style={{ fontStyle: 'italic' }}>Sem achismo.</em>
            </h1>

            <p style={{ fontSize: 16, fontWeight: 300, color: '#8A8985', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
              Encontre AI Builders certificados pelo FMA, valide o fit via clone de IA antes de contratar e implemente projetos com resultado garantido.
            </p>

            <div className="flex flex-wrap gap-3 mb-16">
              <Link href="/auth/signup?role=company" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#141310', color: '#C8F230',
                fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '15px 30px', borderRadius: 3,
              }}>
                Criar conta gratuita <ArrowRight size={14} />
              </Link>
              <Link href="/builders" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#4A4946',
                fontSize: 12, fontWeight: 400, letterSpacing: '0.04em',
                padding: '14px 28px', borderRadius: 3, border: '0.5px solid #C2C1BC',
              }}>
                Explorar builders
              </Link>
            </div>

            {/* Métricas */}
            <div className="flex flex-wrap gap-10">
              {[
                { n: '500+', label: 'AI Builders certificados' },
                { n: '120+', label: 'Empresas atendidas' },
                { n: '98%', label: 'Satisfação declarada' },
                { n: '4.2h', label: 'Média para primeiro match' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#141310', letterSpacing: '-1px' }}>{n}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985', letterSpacing: '0.04em' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ background: '#FFFFFF', borderBottom: '0.5px solid #E0DFDB', padding: '72px 0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Processo</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#141310', letterSpacing: '-1px' }}>
              Do briefing ao projeto em horas
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            {STEPS.map((step, i) => (
              <div key={step.number} style={{
                padding: '36px 32px',
                background: i === 1 ? '#141310' : '#F5F5F3',
                borderRadius: i === 1 ? 12 : 8,
                position: 'relative',
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48, fontWeight: 900, letterSpacing: '-2px',
                  color: i === 1 ? '#C8F230' : '#E0DFDB',
                  marginBottom: 20, lineHeight: 1,
                }}>
                  {step.number}
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: i === 1 ? '#FFFFFF' : '#141310', marginBottom: 10 }}>
                  {step.title}
                </p>
                <p style={{ fontSize: 14, fontWeight: 300, color: i === 1 ? '#8A8985' : '#4A4946', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section style={{ background: '#F5F5F3', borderBottom: '0.5px solid #E0DFDB', padding: '72px 0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Funcionalidades</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#141310', letterSpacing: '-1px', maxWidth: 480 }}>
              Ferramentas de IA para contratar com confiança
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} style={{
                background: '#FFFFFF', border: '0.5px solid #E0DFDB',
                borderRadius: 10, padding: '28px 24px',
              }}>
                <div style={{
                  width: 36, height: 36, background: '#141310', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <Icon size={16} style={{ color: '#C8F230' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#141310', marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 13, fontWeight: 300, color: '#4A4946', lineHeight: 1.65 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SETORES */}
      <section style={{ background: '#141310', borderBottom: '0.5px solid #252420', padding: '56px 0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#4A4946', marginBottom: 20 }}>
            Setores atendidos
          </p>
          <div className="flex flex-wrap gap-3">
            {SECTORS.map(s => (
              <span key={s} style={{
                fontSize: 12, fontWeight: 400, color: '#8A8985',
                padding: '6px 16px', borderRadius: 20,
                border: '0.5px solid #2E2D2A',
                letterSpacing: '0.02em',
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ background: '#FFFFFF', borderBottom: '0.5px solid #E0DFDB', padding: '72px 0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 10 }}>Resultados</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#141310', letterSpacing: '-1px' }}>
              Empresas que encontraram o builder certo
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#F5F5F3', border: '0.5px solid #E0DFDB',
                borderRadius: 10, padding: '28px 24px',
              }}>
                <p style={{ fontSize: 14, fontWeight: 300, color: '#141310', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ borderTop: '0.5px solid #E0DFDB', paddingTop: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#141310' }}>{t.author}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985' }}>{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS RÁPIDOS */}
      <section style={{ background: '#F5F5F3', borderBottom: '0.5px solid #E0DFDB', padding: '56px 0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { icon: CheckCircle, label: 'Sem taxa de intermediação' },
              { icon: Zap, label: 'Primeiro match em menos de 24h' },
              { icon: ShieldCheck, label: 'Builders verificados pelo FMA' },
              { icon: Bot, label: 'Valide o fit antes de contratar' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, background: '#141310', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={14} style={{ color: '#C8F230' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 400, color: '#141310' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: '#141310', padding: '80px 0' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4946', marginBottom: 16 }}>Comece agora</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900,
            letterSpacing: '-2px', color: '#FFFFFF', marginBottom: 16, lineHeight: 1.05,
          }}>
            Descreva seu projeto.<br />
            <span style={{ color: '#C8F230' }}>A IA faz o resto.</span>
          </h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#8A8985', marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
            Crie sua conta gratuitamente e receba matches de builders em minutos.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/signup?role=company" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#C8F230', color: '#141310',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '16px 32px', borderRadius: 3,
            }}>
              Criar conta gratuita <ArrowRight size={14} />
            </Link>
            <Link href="/builders" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#8A8985',
              fontSize: 12, fontWeight: 400, letterSpacing: '0.04em',
              padding: '15px 30px', borderRadius: 3, border: '0.5px solid #2E2D2A',
            }}>
              Ver builders disponíveis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
