import { Hono } from 'hono'
import type { UserProfile, ApiResponse } from '@moyun/core'

export const userRoutes = new Hono()

/**
 * GET /api/user/profile
 * 获取用户信息
 */
userRoutes.get('/profile', async (c) => {
  // TODO: 从数据库获取用户信息，根据 JWT token 鉴权
  const mockProfile: UserProfile = {
    id: 'guest',
    nickname: '墨客',
    membership: 'free',
    dailyUsed: 0,
    dailyLimit: 3,
    totalCreations: 0,
  }

  return c.json<ApiResponse<UserProfile>>({
    success: true,
    data: mockProfile,
  })
})
