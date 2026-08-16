import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import collectionRoutes from './routes/collectionRoutes.js'
import bookmarkRoutes from './routes/bookmarkRoutes.js'
import tagRoutes from './routes/tagRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/collections', collectionRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/tags', tagRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'Stashbox API is running'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Stashbox API running on http://localhost:${PORT}`)
})

