import 'dotenv/config'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing from the server environment')
}

export const pool = new Pool({
  connectionString: databaseUrl
})