// routes/comment.routes.ts
import express from 'express'
import auth from '../../middleware/auth'
import { CommentController } from './comment.controller'

const router = express.Router()

router.post('/', auth(), CommentController.createComment)
router.get('/post/:postId', CommentController.getComments)
router.get('/replies/:commentId', CommentController.getReplies)
router.put('/:id', auth(), CommentController.updateComment)
router.delete('/:id', auth(), CommentController.deleteComment)

export const CommentRoutes = router
