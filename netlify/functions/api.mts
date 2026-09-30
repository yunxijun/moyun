import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { poemRoutes } from '../../server/src/routes/poem'
import { calligraphyRoutes } from '../../server/src/routes/calligraphy'
import { userRoutes } from '../../server/src/routes/user'

const app = new Hono()

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*'
    return origin
  },
}))

app.get('/api', (c) => c.json({
  name: '墨韵 MoYun API',
  version: '0.1.0',
  runtime: 'netlify-functions',
}))

app.route('/api/poem', poemRoutes)
app.route('/api/calligraphy', calligraphyRoutes)
app.route('/api/user', userRoutes)

export default async (request: Request) => {
  return app.fetch(request)
}

export const config = {
  path: ['/api', '/api/*'],
}
