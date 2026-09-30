import { createApiClient } from '@moyun/core/api'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = createApiClient(API_BASE_URL)
