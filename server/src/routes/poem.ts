import { Hono } from 'hono'
import type { PoemGenerateRequest, PoemFromImageRequest, PoemResult, ApiResponse } from '@moyun/core'
import { buildPoemPrompt, buildImagePoemPrompt } from '@moyun/core/poem'
import { callLLM, callVisionLLM } from '../lib/llm'

export const poemRoutes = new Hono()

/**
 * POST /api/poem/generate
 * 文字 → 诗词
 */
poemRoutes.post('/generate', async (c) => {
  try {
    const req = await c.req.json<PoemGenerateRequest>()

    if (!req.prompt?.trim()) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请输入创作主题' },
      }, 400)
    }

    const { system, user } = buildPoemPrompt(req)
    const raw = await callLLM(system, user)
    const poem = parsePoemResult(raw)

    return c.json<ApiResponse<PoemResult>>({
      success: true,
      data: poem,
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
 * POST /api/poem/from-image
 * 图片 + 文字 → 诗词（多模态）
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

    const { system, user } = buildImagePoemPrompt(req)
    const raw = await callVisionLLM(system, user, req.imageUrls)
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

/**
 * 解析 LLM 返回的 JSON 字符串为 PoemResult
 */
function parsePoemResult(raw: string): PoemResult {
  const cleaned = raw
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()
  return JSON.parse(cleaned)
}
