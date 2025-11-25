"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const post_model_1 = require("./post.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const post_constants_1 = require("./post.constants");
const mongoose_1 = require("mongoose");
const createPost = async (user, payload) => {
    try {
        const result = await post_model_1.Post.create({ ...payload, userId: user.authId });
        if (!result) {
            // removeUploadedFiles(payload.images || payload.media);
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Post, please try again with valid data.');
        }
        return result;
    }
    catch (error) {
        // if (payload.images || payload.media) removeUploadedFiles(payload.images || payload.media);
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
};
const getAllPosts = async (user, filterables, pagination) => {
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: post_constants_1.postSearchableFields.map(field => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }
    // Filter functionality
    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        post_model_1.Post.find({ ...whereConditions, privacy: 'public' })
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({ path: 'userId', select: '-password -authentication -__v' }),
        post_model_1.Post.countDocuments(whereConditions),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const getMyPosts = async (user, filterables, pagination) => {
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: post_constants_1.postSearchableFields.map(field => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }
    // Filter functionality
    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        post_model_1.Post.find({ ...whereConditions, userId: user.authId })
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({ path: 'userId', select: '-password -authentication -__v' }),
        post_model_1.Post.countDocuments(whereConditions),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const getSinglePost = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    const result = await post_model_1.Post.findById(id).populate({
        path: 'userId',
        select: '-password -authentication -__v',
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested post not found, please try again with valid id');
    }
    return result;
};
const updatePost = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    const result = await post_model_1.Post.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        new: true,
        runValidators: true,
    }).populate({ path: 'userId', select: '-password -authentication -__v' });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested post not found, please try again with valid id');
    }
    return result;
};
const deletePost = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    const result = await post_model_1.Post.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting post, please try again with valid id.');
    }
    return result;
};
const getPostWithShares = async (postId) => {
    if (!mongoose_1.Types.ObjectId.isValid(postId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Post ID');
    }
    // Find post with initial population
    const post = await post_model_1.Post.findById(postId)
        .populate('userId', 'firstName lastName avatar')
        .populate('sharedPostId')
        .lean();
    if (!post) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    // If it's a shared post, populate the original post's author
    if (post.sharedPostId && typeof post.sharedPostId === 'object') {
        const sharedPost = await post_model_1.Post.findById(post.sharedPostId._id)
            .populate('userId', 'firstName lastName avatar')
            .lean();
        if (sharedPost) {
            ;
            post.sharedPostId = sharedPost;
        }
    }
    return post;
};
exports.PostServices = {
    createPost,
    getAllPosts,
    getMyPosts,
    getSinglePost,
    updatePost,
    deletePost,
    getPostWithShares,
};
