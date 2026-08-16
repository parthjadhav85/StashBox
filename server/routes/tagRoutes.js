import express from 'express'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getBookmarkTags,
  addTagToBookmark,
  removeTagFromBookmark
} from '../controllers/tagController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getTags)
router.post('/', createTag)
router.put('/:id', updateTag)
router.delete('/:id', deleteTag)

router.get('/bookmark/:bookmarkId', getBookmarkTags)
router.post('/bookmark/:bookmarkId', addTagToBookmark)
router.delete('/bookmark/:bookmarkId/:tagId', removeTagFromBookmark)

export default router
