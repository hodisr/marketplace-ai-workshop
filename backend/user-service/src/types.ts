export type UserRole = 'buyer' | 'seller' | 'admin'

export interface SellerProfile {
  id: number
  user_id: number
  store_name: string
  description: string
  rating: number
}

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at: string
  seller_profile: SellerProfile | null
}

export interface UserCreate {
  email: string
  name: string
  role?: UserRole
}
