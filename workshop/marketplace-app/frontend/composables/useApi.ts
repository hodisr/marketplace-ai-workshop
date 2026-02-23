import type { Product, ProductListResponse, ProductCreate, User, SellerProfile } from '~/types'

export function useApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.productServiceUrl
  const userBaseUrl = config.public.userServiceUrl

  async function fetchProducts(page = 1, perPage = 20): Promise<ProductListResponse> {
    return await $fetch(`${baseUrl}/api/products`, {
      params: { page, per_page: perPage },
    })
  }

  async function fetchProduct(id: number): Promise<Product> {
    return await $fetch(`${baseUrl}/api/products/${id}`)
  }

  async function createProduct(data: ProductCreate): Promise<Product> {
    return await $fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      body: data,
    })
  }

  async function fetchUser(id: number): Promise<User> {
    return await $fetch(`${userBaseUrl}/api/users/${id}`)
  }

  async function fetchSellerProfile(id: number): Promise<SellerProfile> {
    return await $fetch(`${userBaseUrl}/api/sellers/${id}`)
  }

  return { fetchProducts, fetchProduct, createProduct, fetchUser, fetchSellerProfile }
}
