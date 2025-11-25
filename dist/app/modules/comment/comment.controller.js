"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const comment_service_1 = require("./comment.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const createComment = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const commentData = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.authId;
    const result = await comment_service_1.CommentServices.createComment(userId, commentData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Comment created successfully',
        data: result,
    });
});
const getComments = (0, catchAsync_1.default)(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await comment_service_1.CommentServices.getComments(postId, Number(page), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
    });
});
const getReplies = (0, catchAsync_1.default)(async (req, res) => {
    const { commentId } = req.params;
    const result = await comment_service_1.CommentServices.getReplies(commentId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Replies retrieved successfully',
        data: result,
    });
});
const updateComment = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const { id } = req.params;
    const updateData = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.authId;
    const result = await comment_service_1.CommentServices.updateComment(id, userId, updateData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comment updated successfully',
        data: result,
    });
});
const deleteComment = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.authId;
    const result = await comment_service_1.CommentServices.deleteComment(id, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: result,
    });
});
exports.CommentController = {
    createComment,
    getComments,
    getReplies,
    updateComment,
    deleteComment,
};
