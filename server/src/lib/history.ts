/**
 * 诗词生成历史（JSON 文件持久化，正式上线迁移到数据库）
 */
import type { PoemResult } from '@moyun/core'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface PoemRecord {
  id: string
  poem: PoemResult
  createdAt: string
  font?: string
  background?: string
}

// 持久化路径
const DATA_DIR = join(process.cwd(), '.data')
const HISTORY_FILE = join(DATA_DIR, 'history.json')
const FEATURED_FILE = join(DATA_DIR, 'featured.json')

// 内存存储
const historyMap = new Map<string, PoemRecord[]>()

// 精选作品池（公开展示）
let featuredPoems: PoemRecord[] = []

// 启动时从文件加载
function loadFromDisk() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    if (existsSync(HISTORY_FILE)) {
      const raw = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'))
      for (const [k, v] of Object.entries(raw)) {
        historyMap.set(k, v as PoemRecord[])
      }
      console.log(`📜 已加载 ${historyMap.size} 位用户的历史记录`)
    }
    if (existsSync(FEATURED_FILE)) {
      featuredPoems = JSON.parse(readFileSync(FEATURED_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('加载历史数据失败:', e)
  }
}

function saveToDisk() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    const obj: Record<string, PoemRecord[]> = {}
    for (const [k, v] of historyMap.entries()) obj[k] = v
    writeFileSync(HISTORY_FILE, JSON.stringify(obj, null, 2), 'utf-8')
    writeFileSync(FEATURED_FILE, JSON.stringify(featuredPoems, null, 2), 'utf-8')
  } catch (e) {
    console.error('保存历史数据失败:', e)
  }
}

// 初始化加载
loadFromDisk()

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** 保存一条生成记录 */
export function savePoem(userId: string, poem: PoemResult): PoemRecord {
  const record: PoemRecord = {
    id: genId(),
    poem,
    createdAt: new Date().toISOString(),
  }

  const list = historyMap.get(userId) || []
  list.unshift(record)
  if (list.length > 100) list.pop()
  historyMap.set(userId, list)

  // 随机 30% 概率加入精选（模拟审核）
  if (featuredPoems.length < 50 && Math.random() < 0.3) {
    featuredPoems.unshift(record)
  }

  // 持久化到磁盘
  saveToDisk()

  return record
}

/** 按 ID 查询单条诗词（遍历所有用户） */
export function getPoemById(id: string): PoemRecord | null {
  for (const list of historyMap.values()) {
    const found = list.find(r => r.id === id)
    if (found) return found
  }
  const found = featuredPoems.find(r => r.id === id)
  return found || null
}

/** 查询用户历史 */
export function getUserHistory(userId: string, page = 1, pageSize = 20): {
  items: PoemRecord[]
  total: number
} {
  const list = historyMap.get(userId) || []
  const start = (page - 1) * pageSize
  return {
    items: list.slice(start, start + pageSize),
    total: list.length,
  }
}

/** 获取精选作品 */
export function getFeaturedPoems(page = 1, pageSize = 10): {
  items: PoemRecord[]
  total: number
} {
  const start = (page - 1) * pageSize
  return {
    items: featuredPoems.slice(start, start + pageSize),
    total: featuredPoems.length,
  }
}

/** 获取用户统计 */
export function getUserStats(userId: string): {
  totalPoems: number
  todayPoems: number
  favoriteGenre: string
} {
  const list = historyMap.get(userId) || []
  const today = new Date().toISOString().slice(0, 10)
  const todayPoems = list.filter(r => r.createdAt.startsWith(today)).length

  // 统计最常用体裁
  const genreCount: Record<string, number> = {}
  for (const r of list) {
    const g = r.poem.genre || '未知'
    genreCount[g] = (genreCount[g] || 0) + 1
  }
  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无'

  return { totalPoems: list.length, todayPoems, favoriteGenre }
}
