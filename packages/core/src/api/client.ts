import type {
  ApiResponse,
  PoemResult,
  PoemGenerateRequest,
  PoemFromImageRequest,
  CalligraphyRenderRequest,
  CalligraphyRenderResult,
  UserProfile,
} from '../types'

export interface ApiClient {
  /** 文字生成诗词 */
  generatePoem(req: PoemGenerateRequest): Promise<ApiResponse<PoemResult>>
  /** 图片+文字生成诗词 */
  poemFromImage(req: PoemFromImageRequest): Promise<ApiResponse<PoemResult>>
  /** 识别经典诗词 */
  identifyPoem(text: string): Promise<ApiResponse<PoemResult>>
  /** 书法渲染 */
  renderCalligraphy(req: CalligraphyRenderRequest): Promise<ApiResponse<CalligraphyRenderResult>>
  /** 获取用户信息 */
  getUserProfile(): Promise<ApiResponse<UserProfile>>
}

/**
 * 创建 API 客户端
 * 所有平台（小程序/Web/App/桌面）使用同一套 API
 */
export function createApiClient(baseUrl: string, getToken?: () => string | null): ApiClient {
  async function request<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = getToken?.()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: body ? 'POST' : 'GET',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!res.ok) {
        return {
          success: false,
          error: { code: `HTTP_${res.status}`, message: res.statusText },
        }
      }

      return await res.json()
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : '网络请求失败',
        },
      }
    }
  }

  return {
    generatePoem: (req) => request('/api/poem/generate', req),
    poemFromImage: (req) => request('/api/poem/from-image', req),
    identifyPoem: (text) => request('/api/poem/identify', { text }),
    renderCalligraphy: (req) => request('/api/calligraphy/render', req),
    getUserProfile: () => request('/api/user/profile'),
  }
}
