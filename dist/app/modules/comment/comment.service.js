"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentServices = void 0;
// services/comment.service.ts
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const post_model_1 = require("../post/post.model");
const comment_model_1 = require("./comment.model");
const createComment = async (userId, commentData) => {
    const { postId, content, parentCommentId } = commentData;
    if (!mongoose_1.Types.ObjectId.isValid(postId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    // Check if post exists
    const post = await post_model_1.Post.findById(postId);
    if (!post) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    // If it's a reply, check if parent comment exists
    if (parentCommentId) {
        if (!mongoose_1.Types.ObjectId.isValid(parentCommentId)) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Parent Comment ID');
        }
        const parentComment = await comment_model_1.Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parent comment not found');
        }
    }
    const comment = await comment_model_1.Comment.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        postId: new mongoose_1.Types.ObjectId(postId),
        content,
        parentCommentId: parentCommentId
            ? new mongoose_1.Types.ObjectId(parentCommentId)
            : null,
    });
    // Update comment count in post
    await comment_model_1.Comment.updateCommentCounts(new mongoose_1.Types.ObjectId(postId));
    const populatedComment = await comment_model_1.Comment.findById(comment._id)
        .populate('userId', 'firstName lastName avatar')
        .lean();
    return populatedComment;
};
const getComments = async (postId, page = 1, limit = 10) => {
    if (!mongoose_1.Types.ObjectId.isValid(postId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    const post = await post_model_1.Post.findById(postId);
    if (!post) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    const comments = await comment_model_1.Comment.getCommentsByPost(new mongoose_1.Types.ObjectId(postId), page, limit);
    // Add like status for each comment if user is authenticated
    const commentsWithLikeStatus = await Promise.all(comments.map(async (comment) => {
        const hasLiked = false; // You can add user ID here if needed
        return {
            ...comment,
            hasLiked,
        };
    }));
    const total = post.metadata.commentCount;
    const totalPages = Math.ceil(total / limit);
    return {
        comments: commentsWithLikeStatus,
        total,
        page,
        totalPages,
    };
};
const getReplies = async (commentId) => {
    if (!mongoose_1.Types.ObjectId.isValid(commentId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Comment ID');
    }
    const comment = await comment_model_1.Comment.findById(commentId);
    if (!comment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found');
    }
    const replies = await comment_model_1.Comment.getReplies(new mongoose_1.Types.ObjectId(commentId));
    // Add like status for each reply
    const repliesWithLikeStatus = await Promise.all(replies.map(async (reply) => {
        const hasLiked = false; // You can add user ID here if needed
        return {
            ...reply,
            hasLiked,
        };
    }));
    return repliesWithLikeStatus;
};
const updateComment = async (commentId, userId, updateData) => {
    if (!mongoose_1.Types.ObjectId.isValid(commentId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Comment ID');
    }
    const comment = await comment_model_1.Comment.findOne({
        _id: commentId,
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    if (!comment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found or you are not authorized to update it');
    }
    const updatedComment = await comment_model_1.Comment.findByIdAndUpdate(commentId, {
        content: updateData.content,
        isEdited: true,
        editedAt: new Date(),
    }, { new: true, runValidators: true }).populate('userId', 'firstName lastName avatar');
    if (!updatedComment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found after update');
    }
    return updatedComment;
};
const deleteComment = async (commentId, userId) => {
    if (!mongoose_1.Types.ObjectId.isValid(commentId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Comment ID');
    }
    const comment = await comment_model_1.Comment.findOne({
        _id: commentId,
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    if (!comment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found or you are not authorized to delete it');
    }
    // Soft delete by setting isActive to false
    const deletedComment = await comment_model_1.Comment.findByIdAndUpdate(commentId, { isActive: false }, { new: true });
    if (!deletedComment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found after deletion');
    }
    // Update comment count in post
    await comment_model_1.Comment.updateCommentCounts(comment.postId);
    return deletedComment;
};
exports.CommentServices = {
    createComment,
    getComments,
    getReplies,
    updateComment,
    deleteComment,
};
