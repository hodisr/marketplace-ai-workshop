export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://marketplace:marketplace@localhost:5432/marketplace'
export const DB_SCHEMA = process.env.DB_SCHEMA || 'users'
export const PORT = parseInt(process.env.PORT || '8002', 10)
