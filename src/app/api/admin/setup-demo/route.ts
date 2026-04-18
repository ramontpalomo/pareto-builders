import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rota idempotente de setup dos usuários/perfis demo.
// Usa a Supabase Admin API (service role) para criar ou atualizar:
//   - auth.users (com senha)
//   - public.profiles
//   - public.builder_profiles (quando role = builder)
//   - public.company_profiles (quando role = company)
// Chamada: POST /api/admin/setup-demo  body: { "secret": "pareto-setup-2026" }

type DemoUser = {
  email: string
  password: string
  role: 'builder' | 'company' | 'admin'
  full_name: string
  slug?: string
  bio?: string
  headline?: string
  specialties?: string[]
  hourly_rate_min?: number
  hourly_rate_max?: number
  location?: string
  fma_grade?: string
  years_experience?: number
  avatar_url?: string
  company_name?: string
  industry?: string
  company_size?: string
}

const DEMO_USERS: DemoUser[] = [
  // ── BUILDERS ──────────────────────────────────────────────────────────────
  {
    email: 'lucas.mendonca@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Lucas Mendonça', slug: 'lucas-mendonca',
    headline: 'Senior AI Engineer | LLMs & Agentes Autônomos',
    bio: 'Senior AI Engineer com 8 anos de experiência. Ex-Google, ex-Nubank. Especialista em LLMs, agentes autônomos e arquiteturas RAG em escala. Já entreguei soluções para fintechs, healthtechs e varejo.',
    specialties: ['LLM & Agentes', 'RAG & Search', 'Automação', 'MLOps'],
    hourly_rate_min: 400, hourly_rate_max: 500,
    location: 'São Paulo, SP', fma_grade: 'A', years_experience: 8,
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    email: 'marina.oliveira@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Marina Oliveira', slug: 'marina-oliveira',
    headline: 'AI Product Engineer | RAG Corporativo',
    bio: 'AI Product Engineer focada em RAG corporativo e busca semântica. Construo sistemas de conhecimento para empresas que precisam extrair valor de documentos internos.',
    specialties: ['RAG & Search', 'Vector Databases', 'LLM & Agentes', 'Python'],
    hourly_rate_min: 340, hourly_rate_max: 420,
    location: 'Rio de Janeiro, RJ', fma_grade: 'A', years_experience: 6,
    avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    email: 'carlos.santos@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Carlos Santos', slug: 'carlos-santos',
    headline: 'Automation Engineer | IA para Finanças e Jurídico',
    bio: 'Especialista em automação de processos com IA para os setores financeiro e jurídico. Experiência com OCR avançado, extração estruturada de documentos e agentes que reduzem trabalho manual repetitivo.',
    specialties: ['Automação', 'LLM & Agentes', 'OCR & Documentos', 'Python'],
    hourly_rate_min: 280, hourly_rate_max: 360,
    location: 'Belo Horizonte, MG', fma_grade: 'B', years_experience: 5,
    avatar_url: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  {
    email: 'juliana.ferreira@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Juliana Ferreira', slug: 'juliana-ferreira',
    headline: 'Senior Data Scientist | ML & Predição',
    bio: 'Data Scientist sênior com foco em ML aplicado e análise preditiva. Desenho modelos end-to-end: da coleta ao deploy com monitoramento.',
    specialties: ['Machine Learning', 'Análise Preditiva', 'Python', 'MLOps'],
    hourly_rate_min: 360, hourly_rate_max: 440,
    location: 'São Paulo, SP', fma_grade: 'A', years_experience: 7,
    avatar_url: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    email: 'rafael.costa@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Rafael Costa', slug: 'rafael-costa',
    headline: 'Fullstack + AI | MVPs com Next.js e Claude',
    bio: 'Fullstack + AI. Construo MVPs rápidos com Next.js, Supabase e APIs de LLMs (Claude, OpenAI). Ideal para startups que precisam validar ideias com IA embutida.',
    specialties: ['LLM & Agentes', 'Fullstack Next.js', 'Supabase', 'TypeScript'],
    hourly_rate_min: 240, hourly_rate_max: 320,
    location: 'Porto Alegre, RS', fma_grade: 'B', years_experience: 4,
    avatar_url: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    email: 'andre.ribeiro@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'André Ribeiro', slug: 'andre-ribeiro',
    headline: 'Computer Vision Engineer | Edge AI & IoT',
    bio: 'Computer Vision e IA para varejo, manufatura e agricultura. Experiência com deploy em Edge (Jetson, Coral) e integração IoT em chão de fábrica.',
    specialties: ['Computer Vision', 'Edge AI', 'IoT', 'Python'],
    hourly_rate_min: 380, hourly_rate_max: 460,
    location: 'Campinas, SP', fma_grade: 'A', years_experience: 9,
    avatar_url: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    email: 'sofia.lima@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Sofia Lima', slug: 'sofia-lima',
    headline: 'AI Marketing Engineer | Growth Automation',
    bio: 'AI para marketing e growth. Copy automatizada, análise de audiência, personalização em escala. Integro IA ao stack de marketing existente (HubSpot, RD, Meta Ads).',
    specialties: ['LLM & Agentes', 'Marketing AI', 'Automação', 'Analytics'],
    hourly_rate_min: 220, hourly_rate_max: 300,
    location: 'Florianópolis, SC', fma_grade: 'B', years_experience: 4,
    avatar_url: 'https://randomuser.me/api/portraits/women/82.jpg',
  },
  {
    email: 'pedro.alves@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Pedro Alves', slug: 'pedro-alves',
    headline: 'AI Infrastructure Engineer | MLOps & Fine-tuning',
    bio: 'AI Infrastructure Engineer. MLOps, escala de LLMs self-hosted, fine-tuning de modelos open-source. Trabalho com empresas que precisam IA on-prem ou dedicated cloud.',
    specialties: ['MLOps', 'Infraestrutura', 'Fine-tuning', 'Kubernetes'],
    hourly_rate_min: 450, hourly_rate_max: 550,
    location: 'Remoto', fma_grade: 'A', years_experience: 10,
    avatar_url: 'https://randomuser.me/api/portraits/men/91.jpg',
  },
  // Novos builders
  {
    email: 'thiago.barbosa@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Thiago Barbosa', slug: 'thiago-barbosa',
    headline: 'NLP Engineer | Sales AI & CRM Inteligente',
    bio: 'Especialista em NLP aplicado a vendas e CRM. Construo pipelines de qualificação de leads com IA, análise de sentimento em ligações e CRMs conversacionais.',
    specialties: ['NLP', 'Sales AI', 'FinTech AI', 'Python'],
    hourly_rate_min: 300, hourly_rate_max: 380,
    location: 'Recife, PE', fma_grade: 'B', years_experience: 5,
    avatar_url: 'https://randomuser.me/api/portraits/men/15.jpg',
  },
  {
    email: 'patricia.nunes@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Patrícia Nunes', slug: 'patricia-nunes',
    headline: 'Senior MLOps | Modelos em Produção em Escala',
    bio: 'MLOps sênior com foco em estabilidade, custo e governança de modelos em produção. Já operacionalizei modelos para mais de 10M de requisições/dia.',
    specialties: ['MLOps', 'Data Science', 'Python', 'Infraestrutura'],
    hourly_rate_min: 420, hourly_rate_max: 520,
    location: 'São Paulo, SP', fma_grade: 'A', years_experience: 8,
    avatar_url: 'https://randomuser.me/api/portraits/women/35.jpg',
  },
  {
    email: 'diego.azevedo@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Diego Azevedo', slug: 'diego-azevedo',
    headline: 'RPA + IA | Automação de Processos Corporativos',
    bio: 'Automação de processos com RPA (UiPath, Automation Anywhere) combinada com IA para casos onde robôs clássicos não chegam. Foco em back-office financeiro e RH.',
    specialties: ['RPA', 'Automação', 'NLP', 'Python'],
    hourly_rate_min: 220, hourly_rate_max: 300,
    location: 'Curitiba, PR', fma_grade: 'B', years_experience: 6,
    avatar_url: 'https://randomuser.me/api/portraits/men/51.jpg',
  },
  {
    email: 'fernanda.alves@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Fernanda Alves', slug: 'fernanda-alves',
    headline: 'Fine-tuning & NLP | Modelos sob Medida',
    bio: 'Especialista em fine-tuning de LLMs para domínios específicos. Crio modelos proprietários para empresas que precisam de respostas precisas em verticais como saúde, jurídico e financeiro.',
    specialties: ['Fine-tuning', 'NLP', 'LLM & Agentes', 'Python'],
    hourly_rate_min: 380, hourly_rate_max: 480,
    location: 'Brasília, DF', fma_grade: 'A', years_experience: 7,
    avatar_url: 'https://randomuser.me/api/portraits/women/38.jpg',
  },
  // ── COMPANIES ─────────────────────────────────────────────────────────────
  {
    email: 'techvision@pareto-demo.io', password: 'Demo@2026', role: 'company',
    full_name: 'TechVision Corp',
    company_name: 'TechVision Corp', industry: 'Tecnologia', company_size: '200-500',
  },
  {
    email: 'rhdigital@pareto-demo.io', password: 'Demo@2026', role: 'company',
    full_name: 'RH Digital',
    company_name: 'RH Digital', industry: 'Recursos Humanos', company_size: '50-200',
  },
  {
    email: 'varejoplus@pareto-demo.io', password: 'Demo@2026', role: 'company',
    full_name: 'Varejo Plus',
    company_name: 'Varejo Plus', industry: 'Varejo', company_size: '500-1000',
  },
]

export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({}))
  if (secret !== 'pareto-setup-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: Array<Record<string, unknown>> = []

  for (const u of DEMO_USERS) {
    try {
      // 1) Buscar user_id via profiles
      const { data: profile } = await adminClient
        .from('profiles')
        .select('user_id')
        .eq('email', u.email)
        .maybeSingle()

      let userId: string | undefined = profile?.user_id

      if (userId) {
        const { error: updErr } = await adminClient.auth.admin.updateUserById(userId, {
          password: u.password,
          email_confirm: true,
          user_metadata: { role: u.role, full_name: u.full_name, slug: u.slug },
        })
        if (updErr) {
          results.push({ email: u.email, step: 'updateUserById', error: updErr.message })
          continue
        }
      } else {
        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { role: u.role, full_name: u.full_name, slug: u.slug },
        })
        if (createErr) {
          results.push({ email: u.email, step: 'createUser', error: createErr.message })
          continue
        }
        userId = created.user.id
      }

      if (!userId) {
        results.push({ email: u.email, error: 'no userId after create/update' })
        continue
      }

      // 2) Upsert em profiles
      const { error: profErr } = await adminClient.from('profiles').upsert({
        user_id: userId,
        email: u.email,
        role: u.role,
        full_name: u.full_name,
      }, { onConflict: 'user_id' })
      if (profErr) {
        results.push({ email: u.email, step: 'profiles.upsert', error: profErr.message })
        continue
      }

      // 3) Role-specific
      if (u.role === 'builder') {
        const { error: bpErr } = await adminClient.from('builder_profiles').upsert({
          user_id: userId,
          slug: u.slug,
          full_name: u.full_name,
          headline: u.headline,
          bio: u.bio,
          specialties: u.specialties,
          hourly_rate_min: u.hourly_rate_min,
          hourly_rate_max: u.hourly_rate_max,
          location: u.location,
          fma_grade: u.fma_grade,
          fma_verified: !!u.fma_grade,
          years_experience: u.years_experience,
          availability: 'available',
          avatar_url: u.avatar_url,
          profile_score: u.fma_grade === 'A' ? 90 : 78,
        }, { onConflict: 'user_id' })
        if (bpErr) {
          results.push({ email: u.email, step: 'builder_profiles.upsert', error: bpErr.message })
          continue
        }
      } else if (u.role === 'company') {
        const { error: cpErr } = await adminClient.from('company_profiles').upsert({
          user_id: userId,
          company_name: u.company_name,
          industry: u.industry,
          size: u.company_size,
        }, { onConflict: 'user_id' })
        if (cpErr) {
          results.push({ email: u.email, step: 'company_profiles.upsert', error: cpErr.message })
          continue
        }
      }

      results.push({ email: u.email, ok: true, userId })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ email: u.email, error: msg })
    }
  }

  return NextResponse.json({ results })
}
