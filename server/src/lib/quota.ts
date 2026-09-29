/**
 * 用户配额管理（轻量版，基于内存 + 访客ID）
 * 正式上线后可迁移到 Redis / 数据库
 */

interface UserQuota {
  count: number
  date: string  // YYYY-MM-DD
}

const FREE_DAILY_LIMIT = 10  // 每日免费生成次数

// 内存存储（开发阶段，重启后重置）
const quotaMap = new Map<string, UserQuota>()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 检查用户是否还有免费额度
 */
export function checkQuota(userId: string): { allowed: boolean; remaining: number; limit: number } {
  const d = today()
  const q = quotaMap.get(userId)

  if (!q || q.date !== d) {
    return { allowed: true, remaining: FREE_DAILY_LIMIT, limit: FREE_DAILY_LIMIT }
  }

  const remaining = Math.max(0, FREE_DAILY_LIMIT - q.count)
  return { allowed: remaining > 0, remaining, limit: FREE_DAILY_LIMIT }
}

/**
 * 消耗一次额度
 */
export function consumeQuota(userId: string): void {
  const d = today()
  const q = quotaMap.get(userId)

  if (!q || q.date !== d) {
    quotaMap.set(userId, { count: 1, date: d })
  } else {
    q.count++
  }
}

/**
 * 获取用户统计
 */
export function getQuotaInfo(userId: string): { used: number; remaining: number; limit: number } {
  const d = today()
  const q = quotaMap.get(userId)
  const used = (q && q.date === d) ? q.count : 0
  return { used, remaining: FREE_DAILY_LIMIT - used, limit: FREE_DAILY_LIMIT }
}
