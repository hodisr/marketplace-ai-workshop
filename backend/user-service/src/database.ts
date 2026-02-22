import pg from 'pg'
import { DATABASE_URL, DB_SCHEMA } from './config.js'

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  options: `-c search_path=${DB_SCHEMA}`,
})

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

  // Seed sample data if empty
  const userCount = await query('SELECT COUNT(*) FROM users')
  if (parseInt(userCount.rows[0].count, 10) === 0) {
    await query(`
      INSERT INTO users (email, name, role) VALUES
        ('alice@example.com', 'Alice Johnson', 'seller'),
        ('bob@example.com', 'Bob Smith', 'seller'),
        ('carol@example.com', 'Carol Williams', 'buyer')
    `)
    await query(`
      INSERT INTO seller_profiles (user_id, store_name, description, rating) VALUES
        (1, 'Alice''s Vintage Finds', 'Curated vintage items and collectibles', 4.8),
        (2, 'Bob''s Electronics', 'Quality refurbished electronics', 4.5)
    `)
    console.log('Seeded sample users and seller profiles')
  }

  console.log(`Database initialized with schema: ${DB_SCHEMA}`)
}
