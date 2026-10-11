import express, { Router } from 'express'
import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import { pool } from '../db/pool'
import { getStorageClient } from '../config/storage'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()
const thumbnailBucket = 'project-thumbnails'
const thumbnailContentTypes = ['image/jpeg', 'image/png', 'image/webp']
const parseThumbnail = express.raw({ type: thumbnailContentTypes, limit: '5mb' })
const maxFeaturedProjects = 4

async function hasFeaturedProjectSlot(client: PoolClient, excludingProjectId?: number) {
  await client.query('SELECT pg_advisory_xact_lock(64217, 4)')
  const result = await client.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM projects
     WHERE is_featured = TRUE
       AND ($1::integer IS NULL OR id <> $1)`,
    [excludingProjectId ?? null]
  )

  return result.rows[0].count < maxFeaturedProjects
}

function isValidLiveUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    return false
  }

  try {
    const url = new URL(value.trim())
    return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password
  } catch {
    return false
  }
}

router.get('/', async (request, response) => {
  const result = request.query.featured === 'true'
    ? await pool.query('SELECT * FROM projects WHERE is_featured = TRUE ORDER BY id LIMIT 4')
    : await pool.query('SELECT * FROM projects ORDER BY id')
  response.json(result.rows)
})

router.post('/:id/thumbnail', requireAdmin, parseThumbnail, async (request, response) => {
  const projectId = Number(request.params.id)
  const contentType = request.get('content-type')?.split(';')[0].trim().toLowerCase()

  if (!Number.isInteger(projectId) || projectId <= 0) {
    response.status(400).json({ error: 'Project id must be a positive integer' })
    return
  }

  if (!contentType || !thumbnailContentTypes.includes(contentType) || !Buffer.isBuffer(request.body) || request.body.length === 0) {
    response.status(400).json({ error: 'Upload a JPEG, PNG, or WebP thumbnail' })
    return
  }

  const project = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId])
  if (project.rowCount === 0) {
    response.status(404).json({ error: 'Project not found' })
    return
  }

  const storage = getStorageClient()
  if (!storage) {
    response.status(503).json({ error: 'Thumbnail storage is not configured on the server' })
    return
  }

  const objectPath = `${projectId}/thumbnail`
  const { error: uploadError } = await storage.storage.from(thumbnailBucket).upload(objectPath, request.body, {
    cacheControl: '60',
    contentType,
    upsert: true,
  })

  if (uploadError) {
    response.status(502).json({ error: 'Could not upload the thumbnail to storage' })
    return
  }

  const { data } = storage.storage.from(thumbnailBucket).getPublicUrl(objectPath)
  const result = await pool.query(
    'UPDATE projects SET thumbnail_url = $1 WHERE id = $2 RETURNING *',
    [data.publicUrl, projectId]
  )

  response.json(result.rows[0])
})


router.post('/', requireAdmin, async (request, response) => {
  const {
    title,
    category,
      short_description,
    description,
    stack,
    live_url,
    is_featured
  } = request.body

  if (
    typeof title !== 'string' ||
    typeof category !== 'string' ||
      typeof short_description !== 'string' || short_description.trim() === '' ||
    typeof description !== 'string' ||
    !Array.isArray(stack) ||
    !stack.every((item: unknown) => typeof item === 'string') ||
    (live_url !== undefined && live_url !== null && !isValidLiveUrl(live_url)) ||
    (is_featured !== undefined && typeof is_featured !== 'boolean')
  ) {
    response.status(400).json({ error: 'Invalid project data' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(64217, 3)')
    if (is_featured === true && !(await hasFeaturedProjectSlot(client))) {
      await client.query('ROLLBACK')
      response.status(409).json({ error: 'At most 4 projects can be pinned to the homepage.' })
      return
    }

    const nextNumber = await client.query<{ next_number: number }>(
      'SELECT COUNT(*)::int + 1 AS next_number FROM projects'
    )
    const projectNumber = String(nextNumber.rows[0].next_number).padStart(2, '0')
    const result = await client.query(
      `INSERT INTO projects (title, category, short_description, description, stack, project_number, live_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, category, short_description.trim(), description, stack, projectNumber, typeof live_url === 'string' ? live_url.trim() : null, is_featured ?? false]
    )
    await client.query('COMMIT')
    response.status(201).json(result.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

router.patch('/:id', requireAdmin, async (request, response) => {
  const projectId = Number(request.params.id)
  const {
  title,
  category,
  description,
  stack,
  live_url,
  short_description,
  is_featured
} = request.body ?? {}
  const hasLiveUrl = Object.prototype.hasOwnProperty.call(request.body ?? {}, 'live_url')

  if (!Number.isInteger(projectId) || projectId <= 0) {
    response.status(400).json({ error: 'Project id must be a positive integer' })
    return
  }
if (
  (title !== undefined && (typeof title !== 'string' || title.trim() === '')) ||
  (category !== undefined && (typeof category !== 'string' || category.trim() === '')) ||
      (short_description !== undefined && (typeof short_description !== 'string' || short_description.trim() === '')) ||
  (description !== undefined && (typeof description !== 'string' || description.trim() === '')) ||
  (stack !== undefined &&
    (!Array.isArray(stack) || !stack.every((item: unknown) => typeof item === 'string'))) ||
  (hasLiveUrl && live_url !== null && !isValidLiveUrl(live_url)) ||
  (is_featured !== undefined && typeof is_featured !== 'boolean')
) {
  response.status(400).json({ error: 'Invalid project data' })
  return
}

if (
  title === undefined &&
  category === undefined &&
  short_description === undefined &&
  description === undefined &&
  stack === undefined &&
  !hasLiveUrl &&
  is_featured === undefined
) {
  response.status(400).json({ error: 'Provide at least one field to update' })
  return
}

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (is_featured === true) {
      const project = await client.query('SELECT is_featured FROM projects WHERE id = $1', [projectId])
      if (project.rowCount === 0) {
        await client.query('ROLLBACK')
        response.status(404).json({ error: 'Project not found' })
        return
      }
      if (!project.rows[0].is_featured && !(await hasFeaturedProjectSlot(client, projectId))) {
        await client.query('ROLLBACK')
        response.status(409).json({ error: 'At most 4 projects can be pinned to the homepage.' })
        return
      }
    }

    const result = await client.query(
      `UPDATE projects
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           short_description = COALESCE($3, short_description),
           description = COALESCE($4, description),
           stack = COALESCE($5, stack),
             live_url = CASE WHEN $6 THEN $7 ELSE live_url END,
             is_featured = CASE WHEN $8 THEN $9 ELSE is_featured END
           WHERE id = $10
       RETURNING *`,
      [
        title?.trim() ?? null,
        category?.trim() ?? null,
        short_description?.trim() ?? null,
        description?.trim() ?? null,
        stack ?? null,
        hasLiveUrl,
        typeof live_url === 'string' ? live_url.trim() : null,
        is_featured !== undefined,
        is_featured ?? null,
        projectId
      ]
    )

    await client.query('COMMIT')
    if (result.rowCount === 0) {
      response.status(404).json({ error: 'Project not found' })
      return
    }

    response.json(result.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

router.delete('/:id', requireAdmin, async (request, response) => {
  const projectId = Number(request.params.id)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    response.status(400).json({ error: 'Project id must be a positive integer' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(64217, 3)')

    const deleted = await client.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id, title',
      [projectId]
    )
    if (deleted.rowCount === 0) {
      await client.query('ROLLBACK')
      response.status(404).json({ error: 'Project not found' })
      return
    }

    const remaining = await client.query<{ id: number }>('SELECT id FROM projects ORDER BY id')
    const projectIds = remaining.rows.map((project) => project.id)
    if (projectIds.length > 0) {
      const temporaryNumbers = projectIds.map(() => `__renumber_${randomUUID()}__`)
      await client.query(
        `UPDATE projects AS project
         SET project_number = replacements.number
         FROM unnest($1::integer[], $2::text[]) AS replacements(id, number)
         WHERE project.id = replacements.id`,
        [projectIds, temporaryNumbers]
      )

      const sequentialNumbers = projectIds.map((_, index) => String(index + 1).padStart(2, '0'))
      await client.query(
        `UPDATE projects AS project
         SET project_number = replacements.number
         FROM unnest($1::integer[], $2::text[]) AS replacements(id, number)
         WHERE project.id = replacements.id`,
        [projectIds, sequentialNumbers]
      )
    }

    const projects = await client.query('SELECT * FROM projects ORDER BY id')
    await client.query('COMMIT')
    response.json({ deleted: deleted.rows[0], projects: projects.rows })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
export default router