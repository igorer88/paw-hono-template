import { Hono } from 'hono'

const healthRouter = new Hono()

healthRouter.get('/', (c) => {
  return c.json({
    success: true,
    description: 'Health check passed',
    data: { message: 'Hello Hono!' }
  })
})

export { healthRouter }





