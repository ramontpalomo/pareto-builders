'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Users, Building2, Shield, TrendingUp, RefreshCw, Check, X, Eye } from 'lucide-react'
import Link from 'next/link'

type UserRow = {
  id: string
  user_id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [stats, setStats] = useState({ builders: 0, companies: 0, total: 0 })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'builder' | 'company' | 'admin'>('all')

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }

    await loadUsers()
  }

  async function loadUsers() {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data)
      setStats({
        builders: data.filter(u => u.role === 'builder').length,
        companies: data.filter(u => u.role === 'company').length,
        total: data.length,
      })
    }
    setLoading(false)
  }

  async function updateRole(userId: string, newRole: string) {
    setActionLoading(userId)
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('user_id', userId)
    await loadUsers()
    setActionLoading(null)
  }

  async function toggleActive(userId: string, currentActive: boolean) {
    setActionLoading(userId)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_active: !currentActive }).eq('user_id', userId)
    await loadUsers()
    setActionLoading(null)
  }

  async function verifyFMA(userId: string) {
    setActionLoading(userId)
    const supabase = createClient()
    await supabase.from('builder_profiles').update({ fma_verified: true }).eq('user_id', userId)
    await loadUsers()
    setActionLoading(null)
  }

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter)

  const roleColor: Record<string, string> = {
    builder: '#C8F230',
    company: '#E0DFDB',
    admin: '#141310',
  }
  const roleTextColor: Record<string, string> = {
    builder: '#141310',
    company: '#141310',
    admin: '#C8F230',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#8A8985' }}>Carregando painel admin...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#141310', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18, color: '#FFFFFF' }}>Pareto</span>
          <span style={{ background: '#C8F230', color: '#141310', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2 }}>Builders</span>
          <span style={{ color: '#8A8985', fontSize: 12, marginLeft: 8 }}>/ Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/builders" style={{ fontSize: 12, color: '#8A8985', textDecoration: 'none' }}>Ver marketplace</Link>
          <button
            onClick={() => { createClient().auth.signOut(); router.push('/') }}
            style={{ fontSize: 12, color: '#8A8985', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#141310', marginBottom: 4 }}>Painel Administrativo</h1>
          <p style={{ fontSize: 13, color: '#8A8985' }}>Gerencie usuários, verificações e configurações da plataforma</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total de usuários', value: stats.total, icon: Users, color: '#141310' },
            { label: 'AI Builders', value: stats.builders, icon: TrendingUp, color: '#C8F230' },
            { label: 'Empresas', value: stats.companies, icon: Building2, color: '#E0DFDB' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color === '#141310' ? '#C8F230' : '#141310'} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#141310', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#8A8985', marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* User Table */}
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E0DFDB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '0.5px solid #E0DFDB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#141310' }}>Usuários</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['all', 'builder', 'company', 'admin'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                  border: '0.5px solid #E0DFDB', cursor: 'pointer',
                  background: filter === f ? '#141310' : '#FFFFFF',
                  color: filter === f ? '#C8F230' : '#8A8985',
                }}>
                  {f === 'all' ? 'Todos' : f === 'builder' ? 'Builders' : f === 'company' ? 'Empresas' : 'Admins'}
                </button>
              ))}
              <button onClick={loadUsers} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, border: '0.5px solid #E0DFDB', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#8A8985' }}>
                <RefreshCw size={12} /> Atualizar
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F3' }}>
                  {['Nome', 'E-mail', 'Tipo', 'Status', 'Cadastro', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#8A8985', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '0.5px solid #E0DFDB', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '0.5px solid #E0DFDB' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#141310' }}>{user.full_name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#8A8985' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 4,
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: roleColor[user.role] || '#E0DFDB',
                        color: roleTextColor[user.role] || '#141310',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, color: user.is_active ? '#22C55E' : '#EF4444'
                      }}>
                        {user.is_active ? <Check size={12} /> : <X size={12} />}
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#8A8985' }}>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {user.role === 'builder' && (
                          <Link href={`/builders`} style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, border: '0.5px solid #E0DFDB', background: '#FFFFFF', textDecoration: 'none', color: '#8A8985', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={11} /> Ver
                          </Link>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => updateRole(user.user_id, 'admin')}
                            disabled={actionLoading === user.user_id}
                            style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, border: '0.5px solid #141310', background: '#141310', color: '#C8F230', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Shield size={11} /> Admin
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <button
                            onClick={() => updateRole(user.user_id, 'builder')}
                            disabled={actionLoading === user.user_id}
                            style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, border: '0.5px solid #E0DFDB', background: '#FFFFFF', color: '#8A8985', cursor: 'pointer' }}
                          >
                            Remover admin
                          </button>
                        )}
                        <button
                          onClick={() => toggleActive(user.user_id, user.is_active)}
                          disabled={actionLoading === user.user_id}
                          style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, border: `0.5px solid ${user.is_active ? '#FEB2B2' : '#C6F6D5'}`, background: user.is_active ? '#FFF5F5' : '#F0FFF4', color: user.is_active ? '#E53E3E' : '#22C55E', cursor: 'pointer' }}
                        >
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        {user.role === 'builder' && (
                          <button
                            onClick={() => verifyFMA(user.user_id)}
                            disabled={actionLoading === user.user_id}
                            style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, border: '0.5px solid #C8F230', background: '#F7FFE5', color: '#141310', cursor: 'pointer' }}
                          >
                            ✓ FMA
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#8A8985', fontSize: 13 }}>
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
