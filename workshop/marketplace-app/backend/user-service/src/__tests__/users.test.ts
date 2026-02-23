import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

let mockUsers: Array<{
  id: number
  email: string
  name: string
  role: string
  created_at: string
  sp_id: number | null
  sp_user_id: number | null
  store_name: string | null
  sp_description: string | null
  rating: number | null
}> = []
let nextId = 1

vi.mock('../database.js', () => ({
  query: vi.fn(async (text: string, params?: unknown[]) => {
    if (text.includes('INSERT INTO users')) {
      const email = params?.[0] as string
      const name = params?.[1] as string
      const role = params?.[2] as string
      const user = {
        id: nextId++,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
        sp_id: null,
        sp_user_id: null,
        store_name: null,
        sp_description: null,
        rating: null,
      }
      mockUsers.push(user)
      return { rows: [user] }
    }

    if (text.includes('SELECT') && text.includes('LEFT JOIN') && text.includes('WHERE u.id')) {
      const id = Number(params?.[0])
      const user = mockUsers.find((u) => u.id === id)
      return { rows: user ? [user] : [] }
    }

    if (text.includes('SELECT') && text.includes('WHERE email')) {
      const email = params?.[0] as string
      const user = mockUsers.find((u) => u.email === email)
      return { rows: user ? [user] : [] }
    }

    if (text.includes('SELECT') && text.includes('seller_profiles') && text.includes('WHERE user_id')) {
      return { rows: [] }
    }

    return { rows: [] }
  }),
  initDb: vi.fn(),
  getPool: vi.fn(),
}))

import { app } from '../app.js'

describe('User Service', () => {
  beforeEach(() => {
    mockUsers = []
    nextId = 1
  })

  it('test_create_user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })

    expect(res.status).toBe(201)
    expect(res.body.email).toBe('test@example.com')
    expect(res.body.name).toBe('Test User')
    expect(res.body.seller_profile).toBeNull()
  })

  it('test_get_user_by_id', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })

    const userId = createRes.body.id
    const res = await request(app).get(`/api/users/${userId}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('test@example.com')
    expect(res.body.name).toBe('Test User')
  })

  it('test_user_not_found', async () => {
    const res = await request(app).get('/api/users/999')

    expect(res.status).toBe(404)
    expect(res.body.detail).toBe('User not found')
  })

  it('test_duplicate_email', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })

    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Another User' })

    expect(res.status).toBe(409)
    expect(res.body.detail).toBe('Email already registered')
  })

  it('test_seller_not_found', async () => {
    const res = await request(app).get('/api/sellers/999')

    expect(res.status).toBe(404)
    expect(res.body.detail).toBe('Seller profile not found')
  })

  it('test_health_check', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('healthy')
    expect(res.body.service).toBe('user-service')
  })
})
