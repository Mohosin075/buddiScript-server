"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidations = void 0;
// validations/comment.validation.ts
const zod_1 = require("zod");
// Comment Media Schema
const commentMediaSchema = zod_1.z.object({
    url: zod_1.z.string(),
    type: zod_1.z.enum(['image', 'video']),
    thumbnail: zod_1.z.string().optional(),
    altText: zod_1.z.string().optional(),
});
// Comment Metadata Schema
const commentMetadataSchema = zod_1.z.object({
    likeCount: zod_1.z.number().default(0),
    replyCount: zod_1.z.number().default(0),
});
exports.CommentValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            postId: zod_1.z.string(),
            content: zod_1.z.string(),
            parentCommentId: zod_1.z.string().optional(),
            media: zod_1.z.array(commentMediaSchema).default([]),
            isEdited: zod_1.z.boolean().default(false),
            editedAt: zod_1.z.string().datetime().optional(),
            metadata: commentMetadataSchema.optional(),
            isActive: zod_1.z.boolean().default(true),
            createdAt: zod_1.z.string().datetime().optional(),
            updatedAt: zod_1.z.string().datetime().optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            content: zod_1.z.string(),
        }),
    }),
    getComments: zod_1.z.object({
        params: zod_1.z.object({
            postId: zod_1.z.string(),
        }),
        query: zod_1.z.object({
            page: zod_1.z.string().optional(),
            limit: zod_1.z.string().optional(),
        }),
    }),
    getReplies: zod_1.z.object({
        params: zod_1.z.object({
            commentId: zod_1.z.string(),
        }),
    }),
    delete: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string(),
        }),
    }),
};
