"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const post_service_1 = require("./post.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const post_constants_1 = require("./post.constants");
const pagination_1 = require("../../../interfaces/pagination");
const createPost = (0, catchAsync_1.default)(async (req, res) => {
    const postData = req.body;
    const result = await post_service_1.PostServices.createPost(req.user, postData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Post created successfully',
        data: result,
    });
});
const updatePost = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const postData = req.body;
    const result = await post_service_1.PostServices.updatePost(id, postData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post updated successfully',
        data: result,
    });
});
const getSinglePost = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await post_service_1.PostServices.getPostWithShares(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post retrieved successfully',
        data: result,
    });
});
const getAllPosts = (0, catchAsync_1.default)(async (req, res) => {
    const filterables = (0, pick_1.default)(req.query, post_constants_1.postFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await post_service_1.PostServices.getAllPosts(req.user, filterables, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Posts retrieved successfully',
        data: result,
    });
});
const getMyPosts = (0, catchAsync_1.default)(async (req, res) => {
    const filterables = (0, pick_1.default)(req.query, post_constants_1.postFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await post_service_1.PostServices.getMyPosts(req.user, filterables, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Posts retrieved successfully',
        data: result,
    });
});
const deletePost = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await post_service_1.PostServices.deletePost(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result,
    });
});
exports.PostController = {
    createPost,
    updatePost,
    getSinglePost,
    getAllPosts,
    getMyPosts,
    deletePost,
};
