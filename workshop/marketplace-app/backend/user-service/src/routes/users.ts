import { Router } from 'express'
import { query } from '../database.js'
import { UserCreate } from '../types.js'

export const usersRouter = Router()

usersRouter.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query(
      `SELECT u.*, sp.id as sp_id, sp.user_id as sp_user_id, sp.store_name, sp.description as sp_description, sp.rating
       FROM users u
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id
       WHERE u.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'User not found' })
      return
    }

    const row = result.rows[0]
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
      seller_profile: row.store_name
        ? {
            id: row.sp_id,
            user_id: row.sp_user_id,
            store_name: row.store_name,
            description: row.sp_description,
            rating: row.rating,
          }
        : null,
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' })
  }
})

usersRouter.post('/users', async (req, res) => {
  try {
    const { email, name, role }: UserCreate = req.body
    const userRole = role || 'buyer'

    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      res.status(409).json({ detail: 'Email already registered' })
      return
    }

    const result = await query(
      'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
      [email, name, userRole]
    )

    const user = {
      ...result.rows[0],
      seller_profile: null,
    }

    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' })
  }
})

usersRouter.get('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query(
      'SELECT * FROM seller_profiles WHERE user_id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Seller profile not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' })
  }
})
