import { z } from 'zod';

export const LikeValidations = {
  create: z.object({
    userId: z.string(),
    targetType: z.string(),
    targetId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),

  update: z.object({
    userId: z.string().optional(),
    targetType: z.string().optional(),
    targetId: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  }),
};
