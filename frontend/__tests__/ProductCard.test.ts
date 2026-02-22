import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '../components/ProductCard.vue'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  image_url: null,
  category_id: 1,
  category: { id: 1, name: 'Electronics', slug: 'electronics', parent_id: null },
  seller_id: 1,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('ProductCard', () => {
  it('renders product title', () => {
    const wrapper = mount(ProductCard, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('Test Product')
  })

  it('renders product price', () => {
    const wrapper = mount(ProductCard, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('$29.99')
  })

  it('renders category badge when category exists', () => {
    const wrapper = mount(ProductCard, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('Electronics')
  })

  it('does not render category badge when category is null', () => {
    const productWithoutCategory = { ...mockProduct, category: null, category_id: null }
    const wrapper = mount(ProductCard, { props: { product: productWithoutCategory } })
    expect(wrapper.text()).not.toContain('Electronics')
  })

  it('shows placeholder when image_url is null', () => {
    const wrapper = mount(ProductCard, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('No image')
  })

  it('renders seller info', () => {
    const wrapper = mount(ProductCard, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('Seller #1')
  })
})
