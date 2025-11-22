import { z } from 'zod'

export const CommentValidations = {
  create: z.object({
    userId: z.string(),
    postId: z.string(),
    parentCommentId: z.string(),
    content: z.string(),
    media: z.array(z.string()),
    isEdited: z.boolean(),
    editedAt: z.string().datetime(),
    isActive: z.boolean(),
    metadata: z.object({
      likeCount: z.number(),
    }),
  }),

  update: z.object({
    userId: z.string().optional(),
    postId: z.string().optional(),
    parentCommentId: z.string().optional(),
    content: z.string().optional(),
    media: z.array(z.string()).optional(),
    isEdited: z.boolean().optional(),
    editedAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
    metadata: z.object({
      likeCount: z.number().optional(),
    }),
  }),
}
