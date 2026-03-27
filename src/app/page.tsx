import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Bot, Sparkles, ShieldCheck, Search, Zap } from 'lucide-react'

const MOCK_BUILDERS = [
  { name: 'Lucas Mendonça', headline: 'Agentes de IA & Automação com LLMs', specialty: 'LLM & Agentes', fma: true },
  { name: 'Ana Paula Reis', headline: 'IA aplicada a vendas e CRM', specialty: 'Sales AI', fma: false },
  { name: 'Rafael Teixeira', headline: 'Computer Vision e MLOps', specialty: 'MLOps', fma: true },
]

const SPECIALTIES = ['LLM & Agentes', 'RAG & Search', 'Automação', 'Computer Vision', 'NLP', 'MLOps', 'Sales AI', 'FinTech AI']

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section style={{ background: '#F5F5F3', borderBottom: '0.5px solid #E0DFDB' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8985' }}>Pareto × FMA</span>
              <span style={{ width: 32, height: '0.5px', background: '#C2C1BC', display: 'block' }} />
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985' }}>Marketplace de AI Builders</span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, lineHeight: 0.95,
              letterSpacing: '-3px', color: '#141310', marginBottom: 24
            }}>
              Implemente <em style={{ fontStyle: 'italic' }}>IA real</em><br />no seu negócio.
            </h1>

            <p style={{ fontSize: 16, fontWeight: 300, color: '#8A8985', lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
              Encontre AI Builders certificados, converse com seus agentes de IA e acelere sua transformação digital.
            </p>

            <div className="flex flex-wrap gap-3 mb-16">
              <Link href="/builders" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#141310', color: '#C8F230',
                fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '14px 28px', borderRadius: 3
              }}>
                Encontrar um Builder <ArrowRight size={14} />
              </Link>
              <Link href="/auth/signup?role=builder" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#4A4946',
                fontSize: 12, fontWeight: 400, letterSpacing: '0.04em',
                padding: '13px 27px', borderRadius: 3, border: '0.5px solid #C2C1BC'
              }}>
                Sou AI Builder — criar meu perfil
              </Link>
            </div>

            <div className="flex flex-wrap gap-8">
              {[{ n: '500+', label: 'AI Builders' }, { n: '120+', label: 'Empresas atendidas' }, { n: '98%', label: 'Satisfação' }].map(({ n, label }) => (
                <div key={label}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', letterSpacing: '-1px' }}>{n}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#8A8985', letterSpacing: '0.04em' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES STRIP */}
      <section style={{ background: '#141310' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3 overflow-x-auto">
          <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4946', whiteSpace: 'nowrap' }}>Especialidades</span>
          <span style={{ width: 24, height: '0.5px', background: '#252420', flexShrink: 0 }} />
          <div className="flex gap-2">
            {SPECIALTIES.map(s => (
              <Link key={s} href={`/builders?specialty=${encodeURIComponent(s)}`} style={{
                fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '5px 12px', borderRadius: 2,
                border: '0.5px solid #252420', color: '#8A8985', whiteSpace: 'nowrap'
              }} className="hover:border-[#C8F230] hover:text-[#C8F230] transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 12 }}>Como funciona</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#141310', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Do briefing ao contrato<br /><em style={{ fontStyle: 'italic', color: '#8A8985' }}>em horas, não semanas.</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: '#E0DFDB', borderRadius: 12, border: '0.5px solid #E0DFDB', overflow: 'hidden' }}>
          {[
            { icon: Search, step: '01', title: 'Descreva seu projeto', body: 'Nossa IA analisa sua necessidade e encontra os Builders mais compatíveis com score de match.' },
            { icon: Bot, step: '02', title: 'Converse com o clone do Builder', body: 'Cada Builder tem um agente de IA. Tire dúvidas, entenda a abordagem e receba uma proposta preliminar.' },
            { icon: ShieldCheck, step: '03', title: 'Compare e escolha', body: 'Veja match scores, portfólios e certificações lado a lado. Destaque para quem tem MBA FMA.' },
            { icon: Zap, step: '04', title: 'Comece o projeto', body: 'Agende a reunião direto pelo clone e feche o escopo com o Builder ideal.' },
          ].map(({ icon: Icon, step, title, body }) => (
            <div key={step} style={{ background: '#FFFFFF', padding: '36px 28px' }}>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ fontSize: 10, fontWeight: 500, color: '#C2C1BC', letterSpacing: '0.1em' }}>{step}</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFEEEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color="#141310" />
                </div>
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#141310', letterSpacing: '-0.3px', marginBottom: 8 }}>{title}</p>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', lineHeight: 1.65 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED BUILDERS */}
      <section style={{ background: '#F5F5F3', borderTop: '0.5px solid #E0DFDB', borderBottom: '0.5px solid #E0DFDB' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 8 }}>Builders em destaque</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#141310', letterSpacing: '-0.8px' }}>
                Conheça quem está<br />transformando empresas
              </h2>
            </div>
            <Link href="/builders" style={{ fontSize: 12, fontWeight: 500, color: '#4A4946', letterSpacing: '0.04em', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Ver todos →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {MOCK_BUILDERS.map(b => (
              <div key={b.name} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '28px 24px' }}>
                <div className="flex items-start gap-3 mb-4">
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFEEEB', border: '0.5px solid #E0DFDB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#8A8985' }}>{b.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#141310' }}>{b.name}</p>
                      {b.fma && (
                        <span style={{ background: '#C8F230', color: '#141310', fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 2 }}>MBA FMA</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985', marginTop: 2 }}>{b.headline}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 2, background: '#EFEEEB', color: '#4A4946' }}>{b.specialty}</span>
                  <Link href="/builders" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: '#141310', background: '#C8F230', padding: '5px 12px', borderRadius: 2 }}>
                    <Bot size={11} /> Falar com clone
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FMA BANNER */}
      <section style={{ background: '#141310' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={18} color="#C8F230" />
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8F230' }}>Certificação Reconhecida pelo MEC</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.8px', lineHeight: 1.15, maxWidth: 480 }}>
              Builders com MBA em IA da Faculdade Mar Atlântico têm destaque garantido no marketplace.
            </h2>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', lineHeight: 1.65, maxWidth: 280 }}>
              O selo FMA diferencia profissionais com formação sólida, reconhecida pelo MEC, com TCC avaliado.
            </p>
            <Link href="/auth/signup?role=builder" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#C8F230', color: '#141310',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '13px 24px', borderRadius: 3
            }}>
              Cadastrar com diploma FMA <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* AI FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12 max-w-xl">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 12 }}>Powered by AI</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: '#141310', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Não é um marketplace qualquer.
          </h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#8A8985', lineHeight: 1.7, marginTop: 12 }}>
            IA Generativa em cada etapa — do match ao agendamento.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {[
            { icon: Bot, title: 'Clone de IA do Builder', body: 'Converse com o agente treinado pelo próprio Builder antes de qualquer reunião.' },
            { icon: Sparkles, title: 'Match Inteligente', body: 'Descreva seu projeto em linguagem natural. A IA encontra os melhores Builders com score de compatibilidade.' },
            { icon: Search, title: 'Busca Semântica', body: 'Não busca por palavra-chave. Entende a intenção e retorna o que você realmente precisa.' },
            { icon: Zap, title: 'Proposta Automática', body: 'O clone do Builder gera uma proposta preliminar durante a conversa, sem esperar o profissional.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} style={{ background: '#F5F5F3', border: '0.5px solid #E0DFDB', borderRadius: 10, padding: '28px 24px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#141310', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={16} color="#C8F230" />
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#141310', letterSpacing: '-0.2px', marginBottom: 8 }}>{title}</p>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', lineHeight: 1.65 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: '#F5F5F3', borderTop: '0.5px solid #E0DFDB' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8985', marginBottom: 16 }}>Gratuito para começar</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#141310', letterSpacing: '-2px', lineHeight: 1, marginBottom: 24 }}>
            Pronto para implementar IA<br />no seu negócio?
          </h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#8A8985', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 40px' }}>
            Crie sua conta gratuitamente. Empresas encontram Builders. Builders encontram oportunidades.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/signup?role=company" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#141310', color: '#C8F230',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '14px 28px', borderRadius: 3
            }}>
              Sou empresa — quero contratar <ArrowRight size={14} />
            </Link>
            <Link href="/auth/signup?role=builder" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#4A4946',
              fontSize: 12, fontWeight: 400, letterSpacing: '0.04em',
              padding: '13px 27px', borderRadius: 3, border: '0.5px solid #C2C1BC'
            }}>
              Sou Builder — criar meu perfil
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
