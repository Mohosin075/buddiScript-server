"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Share = void 0;
// models/Share.model.ts
const mongoose_1 = require("mongoose");
const ShareSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    caption: {
        type: String,
        maxlength: 500,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Ensure one share per user per post
ShareSchema.index({ userId: 1, postId: 1 }, { unique: true });
ShareSchema.index({ postId: 1, createdAt: -1 });
exports.Share = (0, mongoose_1.model)('Share', ShareSchema);
