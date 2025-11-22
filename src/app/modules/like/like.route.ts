// routes/like.routes.ts
import express from 'express'
import auth from '../../middleware/auth'
import { LikeController } from './like.controller'

const router = express.Router()

router.post('/toggle', auth(), LikeController.toggleLike)
router.get('/:targetType/:targetId', LikeController.getLikes)
router.get(
  '/status/:targetType/:targetId',
  auth(),
  LikeController.checkLikeStatus,
)

export const LikeRoutes = router
