import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { poemRoutes } from './routes/poem'
import { calligraphyRoutes } from './routes/calligraphy'
import { userRoutes } from './routes/user'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'http://localhost:5173'
    // 本地开发：允许所有 localhost 端口
    if (origin.startsWith('http://localhost:')) return origin
    // 生产域名
    if (origin.endsWith('moyun.art')) return origin
    return 'http://localhost:5173'
  },
}))

app.get('/', (c) => c.json({
  name: '墨韵 MoYun API',
  version: '0.1.0',
  endpoints: [
    'POST /api/poem/generate',
    'POST /api/poem/from-image',
    'POST /api/calligraphy/render',
    'GET  /api/user/profile',
  ],
}))

app.route('/api/poem', poemRoutes)
app.route('/api/calligraphy', calligraphyRoutes)
app.route('/api/user', userRoutes)

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`🖌️  墨韵 API 已启动: http://localhost:${port}`)
})

export default app
