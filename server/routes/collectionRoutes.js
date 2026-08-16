import express from 'express'
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection
} from '../controllers/collectionController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateUser)

router.post('/', createCollection)
router.get('/', getCollections)
router.get('/:id', getCollectionById)
router.put('/:id', updateCollection)
router.delete('/:id', deleteCollection)

export default router
