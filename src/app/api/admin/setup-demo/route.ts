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
  specialties?: string[]
  hourly_rate?: number
  location?: string
  fma_grade?: string
  company_name?: string
  industry?: string
  company_size?: string
}

const DEMO_USERS: DemoUser[] = [
  // BUILDERS
  {
    email: 'lucas.mendonca@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Lucas Mendonça', slug: 'lucas-mendonca',
    bio: 'Senior AI Engineer especializado em LLMs e agentes autônomos. Ex-Google, ex-Nubank.',
    specialties: ['LLM & Agentes', 'RAG & Search', 'Automação'],
    hourly_rate: 450, location: 'São Paulo, SP', fma_grade: 'A',
  },
  {
    email: 'marina.oliveira@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Marina Oliveira', slug: 'marina-oliveira',
    bio: 'AI Product Engineer com foco em RAG corporativo e search semântica.',
    specialties: ['RAG & Search', 'Vector Databases', 'LLM & Agentes'],
    hourly_rate: 380, location: 'Rio de Janeiro, RJ', fma_grade: 'A',
  },
  {
    email: 'carlos.santos@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Carlos Santos', slug: 'carlos-santos',
    bio: 'Especialista em automação de processos com IA para finanças e jurídico.',
    specialties: ['Automação', 'LLM & Agentes', 'OCR & Documentos'],
    hourly_rate: 320, location: 'Belo Horizonte, MG', fma_grade: 'B',
  },
  {
    email: 'juliana.ferreira@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Juliana Ferreira', slug: 'juliana-ferreira',
    bio: 'Data Scientist sênior com foco em ML aplicado e predição.',
    specialties: ['Machine Learning', 'Análise Preditiva', 'Python'],
    hourly_rate: 400, location: 'São Paulo, SP', fma_grade: 'A',
  },
  {
    email: 'rafael.costa@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Rafael Costa', slug: 'rafael-costa',
    bio: 'Fullstack + AI. Construo MVPs com Next.js, Supabase e Claude/OpenAI.',
    specialties: ['LLM & Agentes', 'Fullstack Next.js', 'Supabase'],
    hourly_rate: 280, location: 'Porto Alegre, RS', fma_grade: 'B',
  },
  {
    email: 'andre.ribeiro@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'André Ribeiro', slug: 'andre-ribeiro',
    bio: 'Computer Vision e IA para varejo, manufatura e agricultura.',
    specialties: ['Computer Vision', 'Edge AI', 'IoT'],
    hourly_rate: 420, location: 'Campinas, SP', fma_grade: 'A',
  },
  {
    email: 'sofia.lima@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Sofia Lima', slug: 'sofia-lima',
    bio: 'AI para marketing e growth. Copy automatizada, análise de audiência.',
    specialties: ['LLM & Agentes', 'Marketing AI', 'Automação'],
    hourly_rate: 260, location: 'Florianópolis, SC', fma_grade: 'B',
  },
  {
    email: 'pedro.alves@pareto-demo.io', password: 'Demo@2026', role: 'builder',
    full_name: 'Pedro Alves', slug: 'pedro-alves',
    bio: 'AI Infrastructure Engineer. MLOps, escala de LLMs, fine-tuning.',
    specialties: ['MLOps', 'Infraestrutura', 'Fine-tuning'],
    hourly_rate: 500, location: 'Remoto', fma_grade: 'A',
  },
  // COMPANIES
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
      // 1) Procurar usuário pelo email (listUsers com filter)
      const { data: list } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 })
      const existing = list?.users?.find(x => x.email === u.email)

      let userId: string | undefined = existing?.id

      if (userId) {
        // Atualizar senha + metadata
        await adminClient.auth.admin.updateUserById(userId, {
          password: u.password,
          email_confirm: true,
          user_metadata: { role: u.role, full_name: u.full_name, slug: u.slug },
        })
      } else {
        // Criar usuário
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
          bio: u.bio,
          specialties: u.specialties,
          hourly_rate: u.hourly_rate,
          location: u.location,
          fma_grade: u.fma_grade,
          availability: 'available',
          full_name: u.full_name,
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
          company_size: u.company_size,
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
