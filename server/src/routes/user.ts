import { Hono } from 'hono'
import type { ApiResponse } from '@moyun/core'
import { getUserHistory, getUserStats, getFeaturedPoems } from '../lib/history'
import { getQuotaInfo } from '../lib/quota'

export const userRoutes = new Hono()

function getUserId(c: any): string {
  return c.req.header('x-visitor-id') || 'anonymous'
}

/** GET /api/user/profile — 用户信息 + 统计 */
userRoutes.get('/profile', async (c) => {
  const userId = getUserId(c)
  const stats = getUserStats(userId)
  const quota = getQuotaInfo(userId)

  return c.json({
    success: true,
    data: {
      id: userId,
      nickname: '墨客',
      membership: 'free',
      stats,
      quota,
    },
  })
})

/** GET /api/user/history — 生成历史 */
userRoutes.get('/history', async (c) => {
  const userId = getUserId(c)
  const page = Number(c.req.query('page')) || 1
  const result = getUserHistory(userId, page)

  return c.json({ success: true, data: result })
})

/** GET /api/user/featured — 精选作品（公开） */
userRoutes.get('/featured', async (c) => {
  const page = Number(c.req.query('page')) || 1
  const result = getFeaturedPoems(page)

  return c.json({ success: true, data: result })
})
