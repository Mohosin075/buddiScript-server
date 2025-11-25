"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeValidations = void 0;
// validations/like.validation.ts
const zod_1 = require("zod");
exports.LikeValidations = {
    toggle: zod_1.z.object({
        body: zod_1.z.object({
            targetId: zod_1.z.string(),
            targetType: zod_1.z.enum(['post', 'comment']),
        }),
    }),
    getLikes: zod_1.z.object({
        params: zod_1.z.object({
            targetId: zod_1.z.string(),
            targetType: zod_1.z.enum(['post', 'comment']),
        }),
    }),
    checkStatus: zod_1.z.object({
        params: zod_1.z.object({
            targetId: zod_1.z.string(),
            targetType: zod_1.z.enum(['post', 'comment']),
        }),
    }),
};
