import { Router } from 'express'
import { pool } from '../db/pool'

const router = Router()

router.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

router.get('/db-check', async (_request, response) => {
  const result = await pool.query('SELECT NOW()')
  response.json({ databaseTime: result.rows[0].now })
})

export default router