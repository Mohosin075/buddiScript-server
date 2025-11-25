"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareServices = void 0;
// services/share.service.ts
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const post_model_1 = require("../post/post.model");
const sharePost = async (userId, postId, caption) => {
    if (!mongoose_1.Types.ObjectId.isValid(postId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    // Find original post
    const originalPost = await post_model_1.Post.findById(postId);
    if (!originalPost) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    // Check if post is private
    if (originalPost.privacy === 'private') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Cannot share private post');
    }
    // Create shared post
    const sharedPost = await post_model_1.Post.create({
        userId,
        content: caption || '', // Share caption
        sharedPostId: originalPost._id,
        isShared: true,
        shareCaption: caption,
        privacy: 'public', // Shared posts are always public
        // You can copy other fields if needed
        tags: originalPost.tags,
        media_source: originalPost.media_source,
    });
    // Update share count on original post
    await post_model_1.Post.findByIdAndUpdate(postId, {
        $inc: { 'metadata.shareCount': 1 },
    });
    // Populate and return
    const populatedPost = await post_model_1.Post.findById(sharedPost._id)
        .populate('userId', 'firstName lastName avatar')
        .populate('sharedPostId')
        .lean();
    return populatedPost;
};
const getSharedPosts = async (postId, page = 1, limit = 10) => {
    if (!mongoose_1.Types.ObjectId.isValid(postId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    const skip = (page - 1) * limit;
    const shares = await post_model_1.Post.find({
        sharedPostId: new mongoose_1.Types.ObjectId(postId),
        isShared: true,
    })
        .populate('userId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await post_model_1.Post.countDocuments({
        sharedPostId: new mongoose_1.Types.ObjectId(postId),
        isShared: true,
    });
    return {
        shares: shares,
        total,
    };
};
exports.ShareServices = {
    sharePost,
    getSharedPosts,
};
