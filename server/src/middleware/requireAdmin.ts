import type { NextFunction, Request, Response } from 'express'
import { adminUserId, supabase } from '../config/supabase'

export async function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Authentication required' })
    return
  }

  const token = authorization.slice('Bearer '.length)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    response.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  if (data.user.id !== adminUserId) {
    response.status(403).json({ error: 'Admin access required' })
    return
  }

  next()
}