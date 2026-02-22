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
      seller_name VARCHAR(150) DEFAULT '',
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  // Seed sample data if empty
  const catCount = await query('SELECT COUNT(*) FROM categories')
  if (parseInt(catCount.rows[0].count, 10) === 0) {
    await query(`
      INSERT INTO categories (name, slug) VALUES
        ('Electronics', 'electronics'),
        ('Home & Garden', 'home-garden'),
        ('Clothing', 'clothing'),
        ('Books', 'books'),
        ('Sports', 'sports'),
        ('Vintage', 'vintage')
    `)

    await query(`
      INSERT INTO products (title, description, price, image_url, category_id, seller_id, seller_name, status) VALUES
        ('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with 30-hour battery life and active noise cancellation.', 189.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', 1, 1, 'Alice Johnson', 'active'),
        ('Mechanical Keyboard', 'RGB backlit mechanical keyboard with Cherry MX Blue switches.', 129.99, 'https://images.unsplash.com/photo-1628089700970-0012c5718efc?w=400&h=300&fit=crop', 1, 2, 'Bob Smith', 'active'),
        ('Indoor Herb Garden Kit', 'Self-watering herb garden with LED grow lights. Grow basil, mint, and cilantro year-round.', 49.99, 'https://images.unsplash.com/photo-1556929361-cec445926332?w=400&h=300&fit=crop', 2, 1, 'Alice Johnson', 'active'),
        ('Vintage Leather Jacket', 'Genuine leather motorcycle jacket from the 1970s. Great condition.', 275.00, 'https://images.unsplash.com/photo-1564247556387-6e97f44aa0cd?w=400&h=300&fit=crop', 3, 1, 'Alice Johnson', 'active'),
        ('The Pragmatic Programmer', 'Classic software engineering book, 20th Anniversary Edition. Like new.', 34.99, 'https://images.unsplash.com/photo-1630852722046-d1c0606aefa5?w=400&h=300&fit=crop', 4, 2, 'Bob Smith', 'active'),
        ('Yoga Mat Premium', 'Extra thick non-slip yoga mat with carrying strap. 6mm cushioning.', 39.99, 'https://images.unsplash.com/photo-1646239646963-b0b9be56d6b5?w=400&h=300&fit=crop', 5, 2, 'Bob Smith', 'active'),
        ('Retro Polaroid Camera', 'Restored Polaroid SX-70 instant camera. Fully functional with original case.', 199.00, 'https://images.unsplash.com/photo-1516313913232-ad84871cfe06?w=400&h=300&fit=crop', 6, 1, 'Alice Johnson', 'active'),
        ('Smart Watch Fitness Tracker', 'Heart rate, GPS, sleep tracking, and 7-day battery life.', 159.00, 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=400&h=300&fit=crop', 1, 2, 'Bob Smith', 'active'),
        ('Handmade Ceramic Vase', 'Hand-thrown stoneware vase with ocean blue glaze. 12 inches tall.', 65.00, 'https://images.unsplash.com/photo-1526198049595-f32cde2a219d?w=400&h=300&fit=crop', 2, 1, 'Alice Johnson', 'active'),
        ('Running Shoes', 'Lightweight trail running shoes with responsive cushioning. Size 10.', 89.99, 'https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?w=400&h=300&fit=crop', 5, 2, 'Bob Smith', 'active')
    `)
    console.log('Seeded sample categories and products')
  }
}
