"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
// MediaItem Sub Schema
const MediaItemSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    thumbnail: { type: String },
    duration: { type: Number },
    size: { type: Number },
    altText: { type: String },
}, { _id: false });
// Main Post Schema
const PostSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    media_source: {
        type: [MediaItemSchema],
        default: [],
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    tags: {
        type: [String],
        default: [],
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
    editedAt: {
        type: Date,
    },
    // Share system fields
    sharedPostId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        default: null,
    },
    isShared: {
        type: Boolean,
        default: false,
    },
    shareCaption: {
        type: String,
        maxlength: 500,
    },
    metadata: {
        likeCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
    },
}, {
    timestamps: true, // auto adds createdAt & updatedAt
    versionKey: false,
});
// Indexes
PostSchema.index({ createdAt: -1, userId: 1 });
PostSchema.index({ sharedPostId: 1 });
PostSchema.index({ isShared: 1 });
// Virtual for shared post
PostSchema.virtual('sharedPost', {
    ref: 'Post',
    localField: 'sharedPostId',
    foreignField: '_id',
    justOne: true,
});
// Ensure virtuals are included in toJSON and toObject
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });
exports.Post = (0, mongoose_1.model)('Post', PostSchema);
