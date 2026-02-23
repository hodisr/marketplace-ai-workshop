import pg from 'pg'
import { DATABASE_URL, DB_SCHEMA } from './config.js'

const pool = new pg.Pool({ connectionString: DATABASE_URL })

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

export function getPool() {
  return pool
}

export async function initDb() {
  await query(`CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA}`)
  await query(`SET search_path TO ${DB_SCHEMA}`)

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      parent_id INTEGER REFERENCES categories(id)
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      price FLOAT NOT NULL,
      image_url VARCHAR(500),
      category_id INTEGER REFERENCES categories(id),
      seller_id INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}
