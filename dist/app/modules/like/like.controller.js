"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const like_service_1 = require("./like.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const toggleLike = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const { targetId, targetType } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.authId;
    const result = await like_service_1.LikeServices.toggleLike(userId, targetId, targetType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.liked ? 'Liked successfully' : 'Unliked successfully',
        data: result,
    });
});
const getLikes = (0, catchAsync_1.default)(async (req, res) => {
    const { targetId, targetType } = req.params;
    const result = await like_service_1.LikeServices.getLikes(targetId, targetType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Likes retrieved successfully',
        data: result,
    });
});
const checkLikeStatus = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const { targetId, targetType } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.authId;
    const result = await like_service_1.LikeServices.checkLikeStatus(userId, targetId, targetType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Like status retrieved successfully',
        data: result,
    });
});
exports.LikeController = {
    toggleLike,
    getLikes,
    checkLikeStatus,
};
