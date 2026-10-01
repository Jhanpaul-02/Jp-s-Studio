import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

router.get('/', async (_request, response) => {
  const result = await pool.query('SELECT * FROM projects ORDER BY id')
  response.json(result.rows)
})


router.post('/', requireAdmin, async (request, response) => {
  const {
    title,
    category,
    description,
    stack,
    project_number,
    accent
  } = request.body

  if (
    typeof title !== 'string' ||
    typeof category !== 'string' ||
    typeof description !== 'string' ||
    !Array.isArray(stack) ||
    !stack.every((item: unknown) => typeof item === 'string') ||
    typeof project_number !== 'string' ||
    typeof accent !== 'string'
  ) {
    response.status(400).json({ error: 'Invalid project data' })
    return
  }

  const result = await pool.query(
    `INSERT INTO projects (title, category, description, stack, project_number, accent)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, category, description, stack, project_number, accent]
  )

  response.status(201).json(result.rows[0])
})

router.patch('/:id', requireAdmin, async (request, response) => {
  const projectId = Number(request.params.id)
  const {
  title,
  category,
  description,
  stack,
  project_number,
  accent
} = request.body ?? {}

  if (!Number.isInteger(projectId) || projectId <= 0) {
    response.status(400).json({ error: 'Project id must be a positive integer' })
    return
  }
if (
  (title !== undefined && (typeof title !== 'string' || title.trim() === '')) ||
  (category !== undefined && (typeof category !== 'string' || category.trim() === '')) ||
  (description !== undefined && (typeof description !== 'string' || description.trim() === '')) ||
  (stack !== undefined &&
    (!Array.isArray(stack) || !stack.every((item: unknown) => typeof item === 'string'))) ||
  (project_number !== undefined &&
    (typeof project_number !== 'string' || project_number.trim() === '')) ||
  (accent !== undefined && (typeof accent !== 'string' || accent.trim() === ''))
) {
  response.status(400).json({ error: 'Invalid project data' })
  return
}

if (
  title === undefined &&
  category === undefined &&
  description === undefined &&
  stack === undefined &&
  project_number === undefined &&
  accent === undefined
) {
  response.status(400).json({ error: 'Provide at least one field to update' })
  return
}

  const result = await pool.query(
  `UPDATE projects
   SET title = COALESCE($1, title),
       category = COALESCE($2, category),
       description = COALESCE($3, description),
       stack = COALESCE($4, stack),
       project_number = COALESCE($5, project_number),
       accent = COALESCE($6, accent)
   WHERE id = $7
   RETURNING *`,
  [
    title?.trim() ?? null,
    category?.trim() ?? null,
    description?.trim() ?? null,
    stack ?? null,
    project_number?.trim() ?? null,
    accent?.trim() ?? null,
    projectId
  ]
)

  if (result.rowCount === 0) {
    response.status(404).json({ error: 'Project not found' })
    return
  }

  response.json(result.rows[0])
})

router.delete('/:id', requireAdmin, async (request, response) => {
  const projectId = Number(request.params.id)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    response.status(400).json({ error: 'Project id must be a positive integer' })
    return
  }

  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 RETURNING id, title',
    [projectId]
  )

  if (result.rowCount === 0) {
    response.status(404).json({ error: 'Project not found' })
    return
  }

  response.json({ deleted: result.rows[0] })
})
export default router