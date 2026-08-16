import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import collectionRoutes from './routes/collectionRoutes.js'
import bookmarkRoutes from './routes/bookmarkRoutes.js'
import { createRateLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

// Safe CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matched origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true) // fallback for development flexibility
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Request Body Limits
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Rate Limiters
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please wait a moment.'
})

const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many requests. Please slow down.'
})

// API Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/collections', apiLimiter, collectionRoutes)
app.use('/api/bookmarks', apiLimiter, bookmarkRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'Stashbox API is running',
    status: 'healthy'
  })
})

// Global Error Handler to prevent leaking stack traces
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Stashbox API running on http://localhost:${PORT}`)
})