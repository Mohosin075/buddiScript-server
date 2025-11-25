"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidations = void 0;
const zod_1 = require("zod");
// Media Item Schema
const mediaItemSchema = zod_1.z.object({
    url: zod_1.z.string(),
    type: zod_1.z.enum(['image', 'video']),
    thumbnail: zod_1.z.string().optional(),
    duration: zod_1.z.number().optional(),
    size: zod_1.z.number().optional(),
    altText: zod_1.z.string().optional(),
});
// Metadata Schema
const metadataSchema = zod_1.z.object({
    likeCount: zod_1.z.number().default(0),
    commentCount: zod_1.z.number().default(0),
    viewCount: zod_1.z.number().default(0),
});
// MAIN — Post Validations
exports.PostValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            userId: zod_1.z.string().optional(),
            content: zod_1.z.string().optional(),
            media_source: zod_1.z.array(mediaItemSchema).default([]),
            privacy: zod_1.z.enum(['public', 'private']).default('public'),
            tags: zod_1.z.array(zod_1.z.string()).default([]),
            isEdited: zod_1.z.boolean().default(false),
            editedAt: zod_1.z.string().datetime().optional(),
            metadata: metadataSchema.optional(),
            createdAt: zod_1.z.string().datetime().optional(),
            updatedAt: zod_1.z.string().datetime().optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z
            .object({
            content: zod_1.z.string().optional(),
            media: zod_1.z.array(mediaItemSchema).optional(),
            privacy: zod_1.z.enum(['public', 'private']).optional(),
            tags: zod_1.z.array(zod_1.z.string()).optional(),
        })
            .strict(),
    }),
};
