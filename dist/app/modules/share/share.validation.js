"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareValidations = void 0;
const zod_1 = __importDefault(require("zod"));
exports.ShareValidations = {
    create: zod_1.default.object({
        body: zod_1.default.object({
            postId: zod_1.default.string(),
            caption: zod_1.default.string().max(500).optional(),
        }),
    }),
};
