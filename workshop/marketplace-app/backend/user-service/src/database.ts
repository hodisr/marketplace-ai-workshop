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
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      role VARCHAR(20) DEFAULT 'buyer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS seller_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
      store_name VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      rating FLOAT DEFAULT 0.0
    )
  `)

  console.log(`Database initialized with schema: ${DB_SCHEMA}`)
}
