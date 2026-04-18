import Link from 'next/link'
import { MapPin, Sparkles } from 'lucide-react'

interface BuilderCardProps {
  slug: string
  full_name: string
  headline: string
  avatar_url?: string
  location?: string
  specialties: string[]
  availability: 'available' | 'busy' | 'unavailable'
  fma_verified: boolean
  years_experience: number
  ai_motivo?: string
  ai_relevancia?: number
}

const availabilityLabel = {
  available: { label: 'Disponível', color: '#A8CF1A' },
  busy: { label: 'Ocupado', color: '#C2C1BC' },
  unavailable: { label: 'Indisponível', color: '#E0DFDB' },
}

export default function BuilderCard({
  slug, full_name, headline, avatar_url, location,
  specialties, availability, fma_verified, years_experience,
  ai_motivo, ai_relevancia,
}: BuilderCardProps) {
  const avail = availabilityLabel[availability] || availabilityLabel.unavailable

  return (
    <Link href={`/builders/${slug}`} className="block group">
      <div style={{
        background: '#FFFFFF',
        border: ai_motivo ? '0.5px solid #C8F230' : '0.5px solid #E0DFDB',
        borderTop: ai_motivo ? '2px solid #C8F230' : '0.5px solid #E0DFDB',
        borderRadius: 12,
        padding: '24px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
        className="group-hover:border-[#8A8985] group-hover:shadow-sm">

        {/* AI motivo strip */}
        {ai_motivo && (
          <div style={{
            marginBottom: 14,
            padding: '6px 10px',
            background: '#F5FDE8',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
          }}>
            <Sparkles size={9} style={{ color: '#5A8A00', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 10, fontWeight: 500, color: '#3A6600', letterSpacing: '0.03em', lineHeight: 1.4 }}>
              {ai_motivo}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#EFEEEB', border: '0.5px solid #E0DFDB',
            flexShrink: 0, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {avatar_url ? (
              <img
                src={avatar_url}
                alt={full_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#8A8985' }}>
                {full_name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p style={{ fontSize: 14, fontWeight: 500, color: '#141310' }}>{full_name}</p>
              {fma_verified && (
                <span style={{
                  background: '#C8F230', color: '#141310',
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2,
                  whiteSpace: 'nowrap'
                }}>MBA FMA</span>
              )}
            </div>
            <p style={{ fontSize: 12, fontWeight: 300, color: '#8A8985', marginTop: 2 }} className="truncate">
              {headline}
            </p>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 mb-4">
          {location && (
            <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#8A8985' }}>
              <MapPin size={11} />
              {location}
            </span>
          )}
          <span style={{ fontSize: 11, color: '#8A8985' }}>
            {years_experience}+ anos
          </span>
          <span style={{
            fontSize: 9, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: avail.color,
            marginLeft: 'auto'
          }}>
            ● {avail.label}
          </span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {specialties.slice(0, 4).map(s => (
            <span key={s} style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '3px 9px',
              borderRadius: 2, background: '#EFEEEB', color: '#4A4946'
            }}>{s}</span>
          ))}
          {specialties.length > 4 && (
            <span style={{
              fontSize: 10, fontWeight: 300, color: '#8A8985',
              padding: '3px 6px'
            }}>+{specialties.length - 4}</span>
          )}
        </div>

        {/* AI relevance score */}
        {ai_relevancia !== undefined && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '0.5px solid #EFEEEB', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 300, color: '#8A8985' }}>match IA</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: ai_relevancia >= 80 ? '#3A6600' : ai_relevancia >= 60 ? '#7A6000' : '#8A8985'
            }}>{ai_relevancia}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}
