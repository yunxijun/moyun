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
  origin: [
    'http://localhost:5173',      // uni-app H5 dev
    'http://localhost:3000',      // Nuxt dev
    'https://moyun.art',          // 生产域名
    'https://www.moyun.art',
  ],
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
