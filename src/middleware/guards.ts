import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { timeout } from 'hono/timeout'
import type { Context, Next } from 'hono'
import type { AppInstance } from '@/types'

export const requestTimeout = async (c: Context<AppInstance>, next: Next) =>
  timeout(c.env.REQUEST_TIMEOUT_MS)(c, next)

export const bodyLimitGuard = async (c: Context<AppInstance>, next: Next) =>
  bodyLimit({
    maxSize: c.env.MAX_BODY_SIZE,
    onError: () => {
      throw new HTTPException(413, { message: 'Payload Too Large' })
    }
  })(c, next)
