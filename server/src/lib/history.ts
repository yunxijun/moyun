/**
 * 诗词生成历史 — 双存储后端
 * - Netlify 环境：使用 Netlify Blobs（持久化 KV）
 * - 本地开发：使用内存 + JSON 文件
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

const IS_NETLIFY = !!process.env.NETLIFY

/* ═══════════════════════════════════════════
 *  Netlify Blobs 存储
 *  Store "poems":        key=poemId   → PoemRecord
 *  Store "user-history": key=userId   → PoemRecord[]
 *  Store "featured":     key="list"   → PoemRecord[]
 * ═══════════════════════════════════════════ */

let _blobStores: { poems: any; userHistory: any; featured: any } | null = null

async function getBlobStores() {
  if (_blobStores) return _blobStores
  const { getStore } = await import('@netlify/blobs')
  _blobStores = {
    poems: getStore('poems'),
    userHistory: getStore('user-history'),
    featured: getStore('featured'),
  }
  return _blobStores
}

/* ═══════════════════════════════════════════
 *  本地文件存储（开发用）
 * ═══════════════════════════════════════════ */

const DATA_DIR = join(process.cwd(), '.data')
const HISTORY_FILE = join(DATA_DIR, 'history.json')
const FEATURED_FILE = join(DATA_DIR, 'featured.json')

const historyMap = new Map<string, PoemRecord[]>()
let featuredPoems: PoemRecord[] = []

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

if (!IS_NETLIFY) loadFromDisk()

/* ═══════════════════════════════════════════
 *  公共 API（自动切换存储后端）
 * ═══════════════════════════════════════════ */

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** 保存一条生成记录 */
export async function savePoem(userId: string, poem: PoemResult): Promise<PoemRecord> {
  const record: PoemRecord = {
    id: genId(),
    poem,
    createdAt: new Date().toISOString(),
  }

  if (IS_NETLIFY) {
    const stores = await getBlobStores()
    // 存单条诗词
    await stores.poems.setJSON(record.id, record)
    // 更新用户历史列表
    const list: PoemRecord[] = (await stores.userHistory.get(userId, { type: 'json' })) || []
    list.unshift(record)
    if (list.length > 100) list.pop()
    await stores.userHistory.setJSON(userId, list)
    // 随机加入精选
    if (Math.random() < 0.3) {
      const featured: PoemRecord[] = (await stores.featured.get('list', { type: 'json' })) || []
      if (featured.length < 50) {
        featured.unshift(record)
        await stores.featured.setJSON('list', featured)
      }
    }
  } else {
    const list = historyMap.get(userId) || []
    list.unshift(record)
    if (list.length > 100) list.pop()
    historyMap.set(userId, list)
    if (featuredPoems.length < 50 && Math.random() < 0.3) {
      featuredPoems.unshift(record)
    }
    saveToDisk()
  }

  return record
}

/** 按 ID 查询单条诗词 */
export async function getPoemById(id: string): Promise<PoemRecord | null> {
  if (IS_NETLIFY) {
    const stores = await getBlobStores()
    const record = await stores.poems.get(id, { type: 'json' })
    return record || null
  }

  for (const list of historyMap.values()) {
    const found = list.find(r => r.id === id)
    if (found) return found
  }
  return featuredPoems.find(r => r.id === id) || null
}

/** 查询用户历史 */
export async function getUserHistory(userId: string, page = 1, pageSize = 20): Promise<{
  items: PoemRecord[]
  total: number
}> {
  if (IS_NETLIFY) {
    const stores = await getBlobStores()
    const list: PoemRecord[] = (await stores.userHistory.get(userId, { type: 'json' })) || []
    const start = (page - 1) * pageSize
    return { items: list.slice(start, start + pageSize), total: list.length }
  }

  const list = historyMap.get(userId) || []
  const start = (page - 1) * pageSize
  return { items: list.slice(start, start + pageSize), total: list.length }
}

/** 获取精选作品 */
export async function getFeaturedPoems(page = 1, pageSize = 10): Promise<{
  items: PoemRecord[]
  total: number
}> {
  if (IS_NETLIFY) {
    const stores = await getBlobStores()
    const list: PoemRecord[] = (await stores.featured.get('list', { type: 'json' })) || []
    const start = (page - 1) * pageSize
    return { items: list.slice(start, start + pageSize), total: list.length }
  }

  const start = (page - 1) * pageSize
  return { items: featuredPoems.slice(start, start + pageSize), total: featuredPoems.length }
}

/** 获取用户统计 */
export async function getUserStats(userId: string): Promise<{
  totalPoems: number
  todayPoems: number
  favoriteGenre: string
}> {
  let list: PoemRecord[]

  if (IS_NETLIFY) {
    const stores = await getBlobStores()
    list = (await stores.userHistory.get(userId, { type: 'json' })) || []
  } else {
    list = historyMap.get(userId) || []
  }

  const today = new Date().toISOString().slice(0, 10)
  const todayPoems = list.filter(r => r.createdAt.startsWith(today)).length

  const genreCount: Record<string, number> = {}
  for (const r of list) {
    const g = r.poem.genre || '未知'
    genreCount[g] = (genreCount[g] || 0) + 1
  }
  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无'

  return { totalPoems: list.length, todayPoems, favoriteGenre }
}
