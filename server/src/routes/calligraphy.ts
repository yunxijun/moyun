import { Hono } from 'hono'
import type { CalligraphyRenderRequest, CalligraphyRenderResult, ApiResponse } from '@moyun/core'

export const calligraphyRoutes = new Hono()

/**
 * POST /api/calligraphy/render
 * 书法渲染（MVP 阶段返回字体信息，V2 阶段调用 UniCalli）
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

    // MVP: 客户端本地使用 Google Fonts 渲染，此接口暂返回确认信息
    // V2: 调用 UniCalli 生成真实书法家风格图片
    if (req.calligrapher) {
      // TODO: V2 - 调用 UniCalli API
      return c.json<ApiResponse<CalligraphyRenderResult>>({
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: '书法家风格渲染即将上线' },
      }, 501)
    }

    // MVP: 返回字体渲染模式，前端使用 Canvas + 字体本地渲染
    return c.json<ApiResponse<CalligraphyRenderResult>>({
      success: true,
      data: {
        imageUrl: '',
        method: 'font',
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
