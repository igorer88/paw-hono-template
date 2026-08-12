import { Hono } from 'hono'
import type { AppInstance } from '@/types'

const healthRouter = new Hono<AppInstance>()

healthRouter.get('/', c => {
  return c.json({
    success: true,
    description: 'Health check passed',
    data: { message: 'Hello Hono!' }
  })
})

export { healthRouter }
