import { NextResponse } from 'next/server'

// Diagnóstico: testa conectividade com Supabase REST e Auth via fetch direto.
// GET /api/admin/test-auth?secret=pareto-setup-2026
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== 'pareto-setup-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SECRET = process.env.SUPABASE_SECRET_KEY!
  const results: Record<string, unknown> = { supabaseUrl: SB, keyPrefix: SECRET.slice(0, 12) }

  // Test 1: REST ping
  try {
    const r = await fetch(`${SB}/rest/v1/profiles?select=count`, {
      headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, Prefer: 'count=exact' },
    })
    results.rest = { status: r.status, count: r.headers.get('content-range') }
  } catch (e) {
    results.rest = { error: e instanceof Error ? e.message : String(e) }
  }

  // Test 2: Auth admin list users
  try {
    const r = await fetch(`${SB}/auth/v1/admin/users?page=1&per_page=5`, {
      headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
    })
    const body = await r.text()
    results.authAdmin = { status: r.status, body: body.slice(0, 400) }
  } catch (e) {
    results.authAdmin = { error: e instanceof Error ? e.message : String(e) }
  }

  // Test 3: Auth health endpoint (no auth needed)
  try {
    const r = await fetch(`${SB}/auth/v1/health`)
    results.authHealth = { status: r.status, body: (await r.text()).slice(0, 200) }
  } catch (e) {
    results.authHealth = { error: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json(results)
}
