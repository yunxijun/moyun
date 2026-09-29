import { Hono } from 'hono'
import type { CalligraphyRenderRequest, CalligraphyRenderResult, ApiResponse } from '@moyun/core'

const UNICALLI_API_URL = process.env.UNICALLI_API_URL || ''
const USE_MOCK = process.env.USE_MOCK === 'true' || !UNICALLI_API_URL

export const calligraphyRoutes = new Hono()

/**
 * POST /api/calligraphy/render
 * 书法渲染（字体模式 / UniCalli AI 模式）
 */
calligraphyRoutes.post('/render', async (c) => {
  try {
    const req = await c.req.json<CalligraphyRenderRequest>()

    if (!req.text?.length) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请提供要渲染的文字' },
      }, 400)
    }

    // 无书法家指定 → 字体渲染模式（前端 Canvas）
    if (!req.calligrapher) {
      return c.json<ApiResponse<CalligraphyRenderResult>>({
        success: true,
        data: { imageUrl: '', method: 'font' },
      })
    }

    // UniCalli 书法家模式
    if (USE_MOCK) {
      return c.json<ApiResponse<CalligraphyRenderResult>>({
        success: true,
        data: {
          imageUrl: '',
          method: 'unicalli',
          mock: true,
          calligrapher: req.calligrapher,
          script: req.script || '楷',
          message: '书法家 AI 渲染（Mock 模式）- 实际部署后将返回真实书法图',
        } as any,
      })
    }

    // 真实 UniCalli API 调用
    const resp = await fetch(UNICALLI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: req.text.join(''),
        author: req.calligrapher,
        script: req.script || '楷',
      }),
    })

    if (!resp.ok) {
      throw new Error(`UniCalli API 错误: ${resp.status}`)
    }

    const result = await resp.json() as { image_url?: string; image_base64?: string }

    return c.json<ApiResponse<CalligraphyRenderResult>>({
      success: true,
      data: {
        imageUrl: result.image_url || `data:image/png;base64,${result.image_base64}`,
        method: 'unicalli',
      },
    })
  } catch (err) {
    console.error('书法渲染失败:', err)
    return c.json<ApiResponse<never>>({
      success: false,
      error: { code: 'RENDER_FAILED', message: '书法渲染失败' },
    }, 500)
  }
})

/**
 * GET /api/calligraphy/masters
 * 获取支持的书法家列表
 */
calligraphyRoutes.get('/masters', async (c) => {
  const { CALLIGRAPHERS, CALLIGRAPHY_SCRIPTS } = await import('@moyun/core/calligraphy')
  return c.json({
    success: true,
    data: {
      calligraphers: CALLIGRAPHERS,
      scripts: CALLIGRAPHY_SCRIPTS,
      available: !USE_MOCK,
    },
  })
})
