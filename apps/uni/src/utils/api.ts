import { createApiClient } from '@moyun/core/api'

const API_BASE_URL = 'http://localhost:3001'

export const api = createApiClient(API_BASE_URL)
