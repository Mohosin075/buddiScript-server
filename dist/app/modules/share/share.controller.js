"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const share_service_1 = require("./share.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const sharePost = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const { postId, caption } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.authId;
    const result = await share_service_1.ShareServices.sharePost(userId, postId, caption);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Post shared successfully',
        data: result,
    });
});
const getSharedPosts = (0, catchAsync_1.default)(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await share_service_1.ShareServices.getSharedPosts(postId, Number(page), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Shared posts retrieved successfully',
        data: result,
    });
});
exports.ShareController = {
    sharePost,
    getSharedPosts,
};
