"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = exports.getProfile = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("./user.model");
const user_1 = require("../../../enum/user");
const logger_1 = require("../../../shared/logger");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const s3helper_1 = require("../../../helpers/image/s3helper");
const config_1 = __importDefault(require("../../../config"));
const user_constants_1 = require("./user.constants");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const updateProfile = async (user, payload) => {
    console.log({ payload });
    const isUserExist = await user_model_1.User.findOne({
        _id: user.authId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    if (isUserExist.profile) {
        const url = new URL(isUserExist.profile);
        const key = url.pathname.substring(1);
        await s3helper_1.S3Helper.deleteFromS3(key);
    }
    const updatedProfile = await user_model_1.User.findOneAndUpdate({ _id: user.authId, status: { $nin: [user_1.USER_STATUS.DELETED] } }, {
        $set: payload,
    }, { new: true });
    if (!updatedProfile) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update profile.');
    }
    return 'Profile updated successfully.';
};
const createAdmin = async () => {
    const admin = {
        email: config_1.default.super_admin.email,
        name: config_1.default.super_admin.name,
        password: config_1.default.super_admin.password,
        role: user_1.USER_ROLES.ADMIN,
        status: user_1.USER_STATUS.ACTIVE,
        verified: true,
        authentication: {
            oneTimeCode: null,
            restrictionLeftAt: null,
            expiresAt: null,
            latestRequestAt: new Date(),
            authType: 'createAccount',
        },
    };
    const isAdminExist = await user_model_1.User.findOne({
        email: admin.email,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (isAdminExist) {
        logger_1.logger.log('info', 'Admin account already exist, skipping creation.🦥');
        return isAdminExist;
    }
    const result = await user_model_1.User.create([admin]);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create admin');
    }
    return result[0];
};
const createStaff = async (user, payload) => {
    try {
        const tempPassword = Math.floor(10000000 + Math.random() * 90000000).toString();
        const result = await user_model_1.User.create({
            ...payload,
            password: tempPassword,
            verified: true,
            role: user_1.USER_ROLES.STAFF,
            createdBy: user.authId,
        });
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Staff, please try again with valid data.');
        }
        // send account verification email
        if (result.email) {
            const emailContent = (0, emailTemplate_1.staffCreateTemplate)({
                email: result.email,
                name: result.name,
                role: user_1.USER_ROLES.STAFF,
                otp: tempPassword,
            });
            await emailHelper_1.emailHelper.sendEmail(emailContent);
            // emailQueue.add('emails', createStaffEmailTemplate) // optional queue
        }
        return result;
    }
    catch (error) {
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
};
const getAllUsers = async (paginationOptions, filterables = {}) => {
    const { searchTerm, ...otherFilters } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const andConditions = [];
    // 🔍 Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: user_constants_1.userFilterableFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' },
            })),
        });
    }
    // 🎯 Dynamic filters (role, verified, etc.)
    if (Object.keys(otherFilters).length) {
        for (const [key, value] of Object.entries(otherFilters)) {
            andConditions.push({ [key]: value });
        }
    }
    // 🛑 Always exclude deleted users
    andConditions.push({
        status: { $nin: [user_1.USER_STATUS.DELETED, null] },
    });
    // 💡 Final query object
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        user_model_1.User.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort(sortBy ? { [sortBy]: sortOrder } : { createdAt: -1 })
            .select('-password -authentication -__v'),
        user_model_1.User.countDocuments(whereConditions),
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
const deleteUser = async (userId) => {
    const isUserExist = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    const deletedUser = await user_model_1.User.findOneAndUpdate({ _id: userId, status: { $nin: [user_1.USER_STATUS.DELETED] } }, { $set: { status: user_1.USER_STATUS.DELETED } }, { new: true });
    if (!deletedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete user.');
    }
    return 'User deleted successfully.';
};
const deleteProfile = async (userId, password) => {
    const isUserExist = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    }).select('+password');
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    const isPasswordMatched = await user_model_1.User.isPasswordMatched(password, isUserExist.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Password is incorrect.');
    }
    const deletedUser = await user_model_1.User.findOneAndUpdate({ _id: userId, status: { $nin: [user_1.USER_STATUS.DELETED] } }, { $set: { status: user_1.USER_STATUS.DELETED } }, { new: true });
    if (!deletedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete user.');
    }
    return 'User deleted successfully.';
};
const getUserById = async (userId) => {
    const isUserExist = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    const user = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    }).select('-password -authentication -__v');
    return user;
};
const updateUserStatus = async (userId, status) => {
    const isUserExist = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    const updatedUser = await user_model_1.User.findOneAndUpdate({ _id: userId, status: { $nin: [user_1.USER_STATUS.DELETED] } }, { $set: { status } }, { new: true });
    if (!updatedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update user status.');
    }
    return 'User status updated successfully.';
};
const getProfile = async (user) => {
    // --- Fetch user ---
    const isUserExist = await user_model_1.User.findOne({
        _id: user.authId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    }).select('-authentication -password -__v');
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    return isUserExist;
};
exports.getProfile = getProfile;
const getAllStaff = async (paginationOptions, filterables = {}) => {
    console.log('hit');
    const { searchTerm, ...otherFilters } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const andConditions = [];
    andConditions.push({ role: user_1.USER_ROLES.STAFF });
    // 🔍 Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: user_constants_1.userFilterableFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' },
            })),
        });
    }
    // 🎯 Dynamic filters (role, verified, etc.)
    if (Object.keys(otherFilters).length) {
        for (const [key, value] of Object.entries(otherFilters)) {
            andConditions.push({ [key]: value });
        }
    }
    // 🛑 Always exclude deleted users
    andConditions.push({
        status: { $nin: [user_1.USER_STATUS.DELETED, null] },
    });
    // 💡 Final query object
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        user_model_1.User.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort(sortBy ? { [sortBy]: sortOrder } : { createdAt: -1 })
            .select('-password -authentication -__v'),
        user_model_1.User.countDocuments(whereConditions),
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
const getStaffById = async (userId) => {
    const isUserExist = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    const user = await user_model_1.User.findOne({
        _id: userId,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    }).select('-password -authentication -__v');
    return user;
};
exports.UserServices = {
    updateProfile,
    createAdmin,
    createStaff,
    getAllUsers,
    deleteUser,
    getUserById,
    updateUserStatus,
    getProfile: exports.getProfile,
    deleteProfile,
    getAllStaff,
    getStaffById,
};
