import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rota de setup único para criar usuários demo via API oficial do Supabase
// Só funciona com a service role key
const DEMO_USERS = [
  { email: 'lucas.mendonca@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Lucas Mendonça', slug: 'lucas-mendonca' },
  { email: 'marina.oliveira@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Marina Oliveira', slug: 'marina-oliveira' },
  { email: 'carlos.santos@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Carlos Santos', slug: 'carlos-santos' },
  { email: 'juliana.ferreira@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Juliana Ferreira', slug: 'juliana-ferreira' },
  { email: 'rafael.costa@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Rafael Costa', slug: 'rafael-costa' },
  { email: 'andre.ribeiro@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'André Ribeiro', slug: 'andre-ribeiro' },
  { email: 'sofia.lima@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Sofia Lima', slug: 'sofia-lima' },
  { email: 'pedro.alves@pareto-demo.io', password: 'Demo@2026', role: 'builder', full_name: 'Pedro Alves', slug: 'pedro-alves' },
  { email: 'techvision@pareto-demo.io', password: 'Demo@2026', role: 'company', full_name: 'TechVision Corp' },
  { email: 'rhdigital@pareto-demo.io', password: 'Demo@2026', role: 'company', full_name: 'RH Digital' },
  { email: 'varejoplus@pareto-demo.io', password: 'Demo@2026', role: 'company', full_name: 'Varejo Plus' },
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

  const results = []

  for (const u of DEMO_USERS) {
    // Tentar atualizar a senha do usuário existente via admin API
    // Primeiro, buscar o user_id pelo email na tabela de profiles
    const { data: profile } = await adminClient
      .from('profiles')
      .select('user_id, email')
      .eq('email', u.email)
      .single()

    if (profile?.user_id) {
      // Atualizar senha via admin API
      const { error } = await adminClient.auth.admin.updateUserById(profile.user_id, {
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, full_name: u.full_name, slug: (u as { slug?: string }).slug },
      })
      results.push({ email: u.email, updated: !error, error: error?.message })
    } else {
      results.push({ email: u.email, updated: false, error: 'User not found in profiles' })
    }
  }

  return NextResponse.json({ results })
}
