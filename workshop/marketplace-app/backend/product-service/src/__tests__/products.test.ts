import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

let products: Record<string, unknown>[] = []
let nextId = 1

vi.mock('../database.js', () => {
  return {
    query: vi.fn((text: string, params?: unknown[]) => {
      const sql = text.trim().toUpperCase()

      if (sql.startsWith('SELECT COUNT')) {
        return Promise.resolve({ rows: [{ count: String(products.length) }] })
      }

      if (sql.startsWith('SELECT') && params && params.length === 1 && !sql.includes('LIMIT')) {
        const id = Number(params[0])
        const product = products.find((p) => p.id === id)
        return Promise.resolve({ rows: product ? [product] : [] })
      }

      if (sql.startsWith('SELECT')) {
        const limit = params ? Number(params[0]) : 20
        const offset = params ? Number(params[1]) : 0
        const sliced = products.slice(offset, offset + limit)
        return Promise.resolve({ rows: sliced })
      }

      if (sql.startsWith('INSERT')) {
        const id = nextId++
        const now = new Date().toISOString()
        const newProduct: Record<string, unknown> = {
          id,
          title: params![0],
          description: params![1],
          price: params![2],
          image_url: params![3],
          category_id: params![4],
          seller_id: params![5],
          status: params![6],
          created_at: now,
          updated_at: now,
          category_name: null,
          category_slug: null,
          category_parent_id: null,
        }
        products.push(newProduct)
        return Promise.resolve({ rows: [newProduct] })
      }

      if (sql.startsWith('UPDATE')) {
        const idParam = params![params!.length - 1]
        const idx = products.findIndex((p) => p.id === Number(idParam))
        if (idx === -1) return Promise.resolve({ rows: [] })
        const updated = { ...products[idx], updated_at: new Date().toISOString() }
        products[idx] = updated
        return Promise.resolve({ rows: [updated] })
      }

      if (sql.startsWith('DELETE')) {
        const id = Number(params![0])
        const idx = products.findIndex((p) => p.id === id)
        if (idx === -1) return Promise.resolve({ rows: [] })
        const deleted = products.splice(idx, 1)
        return Promise.resolve({ rows: deleted })
      }

      return Promise.resolve({ rows: [] })
    }),
    initDb: vi.fn(() => Promise.resolve()),
    getPool: vi.fn(),
  }
})

import { app } from '../app.js'

describe('Product Service', () => {
  beforeEach(() => {
    products = []
    nextId = 1
  })

  it('test_list_products_empty', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      items: [],
      meta: { total: 0, page: 1, per_page: 20, total_pages: 0 },
    })
  })

  it('test_create_product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ title: 'Test Product', description: 'A test', price: 29.99, seller_id: 1 })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Test Product')
    expect(res.body.description).toBe('A test')
    expect(res.body.price).toBe(29.99)
    expect(res.body.seller_id).toBe(1)
    expect(res.body.status).toBe('draft')
    expect(res.body.id).toBeDefined()
  })

  it('test_get_product_by_id', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .send({ title: 'Test Product', description: 'A test', price: 29.99, seller_id: 1 })
    const id = createRes.body.id

    const res = await request(app).get(`/api/products/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(id)
    expect(res.body.title).toBe('Test Product')
  })

  it('test_get_product_not_found', async () => {
    const res = await request(app).get('/api/products/999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ detail: 'Product not found' })
  })

  it('test_list_products_with_data', async () => {
    await request(app)
      .post('/api/products')
      .send({ title: 'Product 1', description: 'First', price: 10.0, seller_id: 1 })
    await request(app)
      .post('/api/products')
      .send({ title: 'Product 2', description: 'Second', price: 20.0, seller_id: 2 })

    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(2)
    expect(res.body.meta.total).toBe(2)
    expect(res.body.meta.page).toBe(1)
    expect(res.body.meta.per_page).toBe(20)
    expect(res.body.meta.total_pages).toBe(1)
  })

  it('test_health_check', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'healthy', service: 'product-service' })
  })
})
