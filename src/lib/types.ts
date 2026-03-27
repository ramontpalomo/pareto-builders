export type UserRole = 'builder' | 'company'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface BuilderProfile {
  id: string
  user_id: string
  slug: string
  full_name: string
  headline: string
  bio: string
  avatar_url?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  website_url?: string
  specialties: string[]
  years_experience: number
  availability: 'available' | 'busy' | 'unavailable'
  hourly_rate_min?: number
  hourly_rate_max?: number
  fma_verified: boolean
  fma_grade?: string
  profile_score: number
  views_count?: number
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  builder_id: string
  name: string
  issuer: string
  issued_at?: string
  credential_url?: string
  diploma_url?: string
  is_fma: boolean
  verified: boolean
}

export interface Project {
  id: string
  builder_id: string
  title: string
  description: string
  tags: string[]
  demo_url?: string
  image_url?: string
  results?: string
  created_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  industry?: string
  size?: string
  website_url?: string
  description?: string
  logo_url?: string
}
