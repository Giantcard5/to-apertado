export type BathroomPin = {
  id: string
  name: string
  lat: number
  lng: number
  distance_meters: number
  avg_rating: number | null
  total_ratings: number
  is_free: boolean
  is_accessible: boolean
  place_type: string
  status: 'active' | 'needs_review'
}

export type BathroomDetail = BathroomPin & {
  address: string | null
  requires_key: boolean
  opening_hours: { raw: string } | null
  source: 'osm' | 'user' | 'manual'
  recent_ratings: Rating[]
  photos: Photo[]
}

export type Rating = {
  id: string
  overall: number
  cleanliness: number | null
  has_paper: boolean | null
  has_soap: boolean | null
  has_dryer: boolean | null
  smell: number | null
  comment: string | null
  created_at: string
}

export type Photo = {
  id: string
  url: string
  status: 'pending' | 'approved' | 'rejected' | 'manual_review'
}

export type User = {
  id: string
  name: string | null
  avatar_url: string | null
  points: number
  role: 'user' | 'admin'
  badges: Badge[]
}

export type Badge = {
  slug: string
  name: string
  description: string | null
  awarded_at: string
}

export type ApiError = {
  error: string
  message: string
  details?: Array<{ field: string; message: string }>
}
