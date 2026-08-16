import express from 'express'
import { signup, login, getMe, updateProfile, logout } from '../controllers/authController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', authenticateUser, logout)
router.get('/me', authenticateUser, getMe)
router.put('/profile', authenticateUser, updateProfile)

export default router