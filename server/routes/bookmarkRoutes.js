import express from 'express'
import {
  createBookmark,
  getBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  toggleFavorite,
  toggleArchive,
  refreshBookmarkMetadata
} from '../controllers/bookmarkController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateUser)

router.post('/', createBookmark)
router.get('/', getBookmarks)
router.get('/:id', getBookmarkById)
router.put('/:id', updateBookmark)
router.delete('/:id', deleteBookmark)
router.patch('/:id/favorite', toggleFavorite)
router.patch('/:id/archive', toggleArchive)
router.post('/:id/refresh', refreshBookmarkMetadata)

export default router
