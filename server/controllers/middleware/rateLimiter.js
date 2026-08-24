/**
 * Lightweight, in-memory sliding window rate limiter
 * Protects against brute-force and request flooding without external dependencies.
 */

const hitMap = new Map()

// Periodically clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of hitMap.entries()) {
    if (now > record.resetTime) {
      hitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export const createRateLimiter = ({
  windowMs = 60 * 1000, // 1 minute window
  max = 60,              // 60 requests per minute by default
  message = 'Too many requests, please try again later.'
} = {}) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    const key = `${req.baseUrl || req.path}:${ip}`
    const now = Date.now()

    let record = hitMap.get(key)

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      }
      hitMap.set(key, record)
      return next()
    }

    record.count++

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000)
      res.setHeader('Retry-After', retryAfterSeconds)
      return res.status(429).json({
        message,
        retryAfter: retryAfterSeconds
      })
    }

    next()
  }
}
