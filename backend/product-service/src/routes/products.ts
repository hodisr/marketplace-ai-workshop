import { Router, Request, Response } from 'express'
import { query } from '../database.js'
import { ProductCreate, ProductUpdate, Product, Category } from '../types.js'

export const productsRouter = Router()

productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const per_page = Math.max(1, parseInt(req.query.per_page as string) || 20)
    const offset = (page - 1) * per_page

    const countResult = await query('SELECT COUNT(*) FROM products')
    const total = parseInt(countResult.rows[0].count, 10)

    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, c.parent_id as category_parent_id
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [per_page, offset]
    )

    const items: Product[] = result.rows.map((row: Record<string, unknown>) => ({
      id: row.id as number,
      title: row.title as string,
      description: row.description as string,
      price: row.price as number,
      image_url: (row.image_url as string) || null,
      category_id: (row.category_id as number) || null,
      category: row.category_name
        ? {
            id: row.category_id as number,
            name: row.category_name as string,
            slug: row.category_slug as string,
            parent_id: (row.category_parent_id as number) || null,
          }
        : null,
      seller_id: row.seller_id as number,
      seller_name: (row.seller_name as string) || '',
      status: row.status as Product['status'],
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }))

    const total_pages = total === 0 ? 0 : Math.ceil(total / per_page)

    res.json({
      items,
      meta: { total, page, per_page, total_pages },
    })
  } catch (err) {
    console.error('Error listing products:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, c.parent_id as category_parent_id
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Product not found' })
      return
    }

    const row = result.rows[0] as Record<string, unknown>
    const product: Product = {
      id: row.id as number,
      title: row.title as string,
      description: row.description as string,
      price: row.price as number,
      image_url: (row.image_url as string) || null,
      category_id: (row.category_id as number) || null,
      category: row.category_name
        ? {
            id: row.category_id as number,
            name: row.category_name as string,
            slug: row.category_slug as string,
            parent_id: (row.category_parent_id as number) || null,
          }
        : null,
      seller_id: row.seller_id as number,
      seller_name: (row.seller_name as string) || '',
      status: row.status as Product['status'],
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }

    res.json(product)
  } catch (err) {
    console.error('Error getting product:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

productsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, price, image_url, category_id, seller_id, seller_name, status } = req.body as ProductCreate

    if (!title || price === undefined || price === null || !seller_id) {
      res.status(400).json({ detail: 'Missing required fields: title, price, seller_id' })
      return
    }

    const result = await query(
      `INSERT INTO products (title, description, price, image_url, category_id, seller_id, seller_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description || '', price, image_url || null, category_id || null, seller_id, seller_name || '', status || 'draft']
    )

    const row = result.rows[0] as Record<string, unknown>
    const product: Product = {
      id: row.id as number,
      title: row.title as string,
      description: row.description as string,
      price: row.price as number,
      image_url: (row.image_url as string) || null,
      category_id: (row.category_id as number) || null,
      category: null,
      seller_id: row.seller_id as number,
      seller_name: (row.seller_name as string) || '',
      status: row.status as Product['status'],
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }

    res.status(201).json(product)
  } catch (err) {
    console.error('Error creating product:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

productsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body as ProductUpdate
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramIndex++}`)
      values.push(updates.price)
    }
    if (updates.image_url !== undefined) {
      fields.push(`image_url = $${paramIndex++}`)
      values.push(updates.image_url)
    }
    if (updates.category_id !== undefined) {
      fields.push(`category_id = $${paramIndex++}`)
      values.push(updates.category_id)
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }

    fields.push('updated_at = NOW()')
    values.push(req.params.id)

    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Product not found' })
      return
    }

    const row = result.rows[0] as Record<string, unknown>
    const product: Product = {
      id: row.id as number,
      title: row.title as string,
      description: row.description as string,
      price: row.price as number,
      image_url: (row.image_url as string) || null,
      category_id: (row.category_id as number) || null,
      category: null,
      seller_id: row.seller_id as number,
      seller_name: (row.seller_name as string) || '',
      status: row.status as Product['status'],
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }

    res.json(product)
  } catch (err) {
    console.error('Error updating product:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

productsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Product not found' })
      return
    }

    res.status(204).send()
  } catch (err) {
    console.error('Error deleting product:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})
