import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { PoemGenerateRequest, PoemFromImageRequest, PoemResult, ApiResponse } from '@moyun/core'
import { buildPoemPrompt, buildImagePoemPrompt } from '@moyun/core/poem'
import { callLLM, callLLMStream, callVisionLLM } from '../lib/llm'
import { mockGeneratePoem, mockPoemFromImage } from '../lib/mock'
import { checkQuota, consumeQuota, getQuotaInfo } from '../lib/quota'
import { savePoem } from '../lib/history'

const USE_MOCK = process.env.USE_MOCK === 'true'

/** 从请求中获取用户ID（访客模式用 header 传递） */
function getUserId(c: any): string {
  return c.req.header('x-visitor-id') || 'anonymous'
}

export const poemRoutes = new Hono()

/**
 * POST /api/poem/generate
 * 文字 → 诗词（非流式，保留兼容）
 */
poemRoutes.post('/generate', async (c) => {
  try {
    const userId = getUserId(c)
    const quota = checkQuota(userId)
    if (!quota.allowed) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: { code: 'QUOTA_EXCEEDED', message: `今日免费次数已用完（${quota.limit}次/天），明天再来或开通会员` },
      }, 429)
    }

    const req = await c.req.json<PoemGenerateRequest>()

    if (!req.prompt?.trim()) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请输入创作主题' },
      }, 400)
    }

    let raw: string
    if (USE_MOCK) {
      raw = await mockGeneratePoem(req.prompt)
    } else {
      const { system, user } = buildPoemPrompt(req)
      raw = await callLLM(system, user)
    }
    const poem = parsePoemResult(raw)
    consumeQuota(userId)
    savePoem(userId, poem)

    return c.json<ApiResponse<PoemResult>>({
      success: true,
      data: poem,
      meta: { quota: getQuotaInfo(userId) } as any,
    })
  } catch (err) {
    console.error('诗词生成失败:', err)
    return c.json<ApiResponse<never>>({
      success: false,
      error: { code: 'GENERATION_FAILED', message: '诗词生成失败，请重试' },
    }, 500)
  }
})

/**
 * POST /api/poem/generate-stream
 * 文字 → 诗词（SSE 流式输出，实时展示生成过程）
 */
poemRoutes.post('/generate-stream', async (c) => {
  const userId = getUserId(c)
  const quota = checkQuota(userId)
  if (!quota.allowed) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: { code: 'QUOTA_EXCEEDED', message: `今日免费次数已用完（${quota.limit}次/天），明天再来或开通会员` },
    }, 429)
  }

  const req = await c.req.json<PoemGenerateRequest>()

  if (!req.prompt?.trim()) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: { code: 'INVALID_INPUT', message: '请输入创作主题' },
    }, 400)
  }

  if (USE_MOCK) {
    consumeQuota(userId)
    const raw = await mockGeneratePoem(req.prompt)
    const poem = parsePoemResult(raw)
    return c.json<ApiResponse<PoemResult>>({ success: true, data: poem })
  }

  return streamSSE(c, async (stream) => {
    try {
      const { system, user } = buildPoemPrompt(req)

      const raw = await callLLMStream(system, user, (token) => {
        stream.writeSSE({ data: JSON.stringify({ type: 'token', content: token }) })
      })

      consumeQuota(userId)
      const poem = parsePoemResult(raw)
      savePoem(userId, poem)
      const info = getQuotaInfo(userId)
      await stream.writeSSE({ data: JSON.stringify({ type: 'done', poem, quota: info }) })
    } catch (err) {
      console.error('流式生成失败:', err)
      await stream.writeSSE({
        data: JSON.stringify({ type: 'error', message: '生成失败，请重试' }),
      })
    }
  })
})

/**
 * POST /api/poem/from-image
 */
poemRoutes.post('/from-image', async (c) => {
  try {
    const req = await c.req.json<PoemFromImageRequest>()

    if (!req.imageUrls?.length) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请上传至少一张图片' },
      }, 400)
    }

    let raw: string
    if (USE_MOCK) {
      raw = await mockPoemFromImage()
    } else {
      try {
        const { system, user } = buildImagePoemPrompt(req)
        raw = await callVisionLLM(system, user, req.imageUrls)
      } catch (visionErr: any) {
        console.error('VLM 调用失败，尝试纯文字降级:', visionErr?.message)
        // 降级：忽略图片，用文字描述生成
        const fallbackPrompt = req.text || '请根据一幅美景图写一首诗'
        const { system, user } = buildPoemPrompt({ prompt: fallbackPrompt, genre: req.genre, style: req.style })
        raw = await callLLM(system, user)
      }
    }
    const poem = parsePoemResult(raw)

    return c.json<ApiResponse<PoemResult>>({
      success: true,
      data: poem,
    })
  } catch (err) {
    console.error('图片作诗失败:', err)
    return c.json<ApiResponse<never>>({
      success: false,
      error: { code: 'GENERATION_FAILED', message: '图片作诗失败，请重试' },
    }, 500)
  }
})

/** GET /api/poem/quota — 查询当前剩余次数 */
poemRoutes.get('/quota', async (c) => {
  const userId = getUserId(c)
  return c.json({ success: true, data: getQuotaInfo(userId) })
})

function parsePoemResult(raw: string): PoemResult {
  const cleaned = raw
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()
  return JSON.parse(cleaned)
}
