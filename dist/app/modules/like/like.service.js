"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeServices = void 0;
// services/like.service.ts
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const post_model_1 = require("../post/post.model");
const like_model_1 = require("./like.model");
const comment_model_1 = require("../comment/comment.model");
const toggleLike = async (userId, targetId, targetType) => {
    if (!mongoose_1.Types.ObjectId.isValid(targetId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid ${targetType} ID`);
    }
    // Check if target exists
    if (targetType === 'post') {
        const post = await post_model_1.Post.findById(targetId);
        if (!post) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
        }
    }
    else {
        const comment = await comment_model_1.Comment.findById(targetId);
        if (!comment) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found');
        }
    }
    const result = await like_model_1.Like.toggleLike(userId, new mongoose_1.Types.ObjectId(targetId), targetType);
    // Update like count in target document
    if (targetType === 'post') {
        await post_model_1.Post.findByIdAndUpdate(targetId, {
            'metadata.likeCount': await like_model_1.Like.getLikesCount(new mongoose_1.Types.ObjectId(targetId), targetType),
        });
    }
    else {
        await comment_model_1.Comment.findByIdAndUpdate(targetId, {
            'metadata.likeCount': await like_model_1.Like.getLikesCount(new mongoose_1.Types.ObjectId(targetId), targetType),
        });
    }
    return result;
};
const getLikes = async (targetId, targetType) => {
    if (!mongoose_1.Types.ObjectId.isValid(targetId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid ${targetType} ID`);
    }
    const likes = await like_model_1.Like.find({
        targetId: new mongoose_1.Types.ObjectId(targetId),
        targetType,
    })
        .populate({
        path: 'userId',
        select: 'profile', // add whatever fields you need
    })
        .sort({ createdAt: -1 });
    const total = await like_model_1.Like.getLikesCount(new mongoose_1.Types.ObjectId(targetId), targetType);
    return {
        likes,
        total,
    };
};
const checkLikeStatus = async (userId, targetId, targetType) => {
    if (!mongoose_1.Types.ObjectId.isValid(targetId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid ${targetType} ID`);
    }
    const isLiked = await like_model_1.Like.isLiked(userId, new mongoose_1.Types.ObjectId(targetId), targetType);
    return { isLiked };
};
exports.LikeServices = {
    toggleLike,
    getLikes,
    checkLikeStatus,
};
