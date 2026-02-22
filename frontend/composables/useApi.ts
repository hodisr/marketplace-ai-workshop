import type { Product, ProductListResponse, ProductCreate, User, SellerProfile } from '~/types'

export function useApi() {
  async function fetchProducts(page = 1, perPage = 20): Promise<ProductListResponse> {
    return await $fetch('/api/products', {
      params: { page, per_page: perPage },
    })
  }

  async function fetchProduct(id: number): Promise<Product> {
    return await $fetch(`/api/products/${id}`)
  }

  async function createProduct(data: ProductCreate): Promise<Product> {
    return await $fetch('/api/products', {
      method: 'POST',
      body: data,
    })
  }

  async function fetchUser(id: number): Promise<User> {
    return await $fetch(`/api/users/${id}`)
  }

  async function fetchSellerProfile(id: number): Promise<SellerProfile> {
    return await $fetch(`/api/sellers/${id}`)
  }

  return { fetchProducts, fetchProduct, createProduct, fetchUser, fetchSellerProfile }
}
