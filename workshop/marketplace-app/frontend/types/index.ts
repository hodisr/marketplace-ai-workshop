export type ProductStatus = 'draft' | 'active' | 'sold' | 'archived'

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
  category_id: number | null
  category: Category | null
  seller_id: number
  status: ProductStatus
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  title: string
  description: string
  price: number
  image_url?: string
  category_id?: number
  seller_id: number
  status?: ProductStatus
}

export interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ProductListResponse {
  items: Product[]
  meta: PaginationMeta
}

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
