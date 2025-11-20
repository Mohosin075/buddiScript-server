"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const booking_model_1 = require("./booking.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const booking_constants_1 = require("./booking.constants");
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enum/user");
const createBooking = async (user, payload) => {
    try {
        const result = await booking_model_1.Booking.create({ ...payload, user: user.authId });
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Booking, please try again with valid data.');
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
const getAllBookings = async (user, filterables, pagination) => {
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: booking_constants_1.bookingSearchableFields.map(field => ({
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
        booking_model_1.Booking.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({
            path: 'user',
            select: '-password -__v -createdAt -updatedAt -authentication',
        }),
        booking_model_1.Booking.countDocuments(whereConditions),
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
const getSingleBooking = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Booking ID');
    }
    const result = await booking_model_1.Booking.findById(id).populate({
        path: 'user',
        select: '-password -__v -createdAt -updatedAt -authentication',
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested booking not found, please try again with valid id');
    }
    return result;
};
const updateBooking = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Booking ID');
    }
    const result = await booking_model_1.Booking.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        new: true,
        runValidators: true,
    }).populate('user');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested booking not found, please try again with valid id');
    }
    return result;
};
const deleteBooking = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Booking ID');
    }
    const result = await booking_model_1.Booking.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting booking, please try again with valid id.');
    }
    return result;
};
// for staff to view their services
const myServices = async (user, filterables, pagination) => {
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: booking_constants_1.bookingSearchableFields.map(field => ({
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
        booking_model_1.Booking.find({ ...whereConditions, staff: user.authId })
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({
            path: 'user',
            select: '-password -__v -createdAt -updatedAt -authentication',
        }),
        booking_model_1.Booking.countDocuments(whereConditions),
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
// for staff to get bookings by date
const getBookingsByDate = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const bookings = await booking_model_1.Booking.find({
        date: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
    });
    return bookings;
};
const updateBookingStatus = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Booking ID');
    }
    const result = await booking_model_1.Booking.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: { status: payload } }, {
        new: true,
        runValidators: true,
    }).populate('user');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested booking not found, please try again with valid id');
    }
    return result;
};
const getWeeklyBookingsByUser = async (user, date) => {
    let baseDate = new Date();
    if (date === 'next') {
        // Move to next week
        baseDate.setDate(baseDate.getDate() + 7);
    }
    else if (date === 'prev') {
        // Move to previous week
        baseDate.setDate(baseDate.getDate() - 7);
    }
    else if (date) {
        // Use provided date
        baseDate = new Date(date);
    }
    // Calculate week range (Mon–Sun)
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    // Build filter
    const filter = {
        date: {
            $gte: startOfWeek,
            $lte: endOfWeek,
        },
    };
    if (user.role === user_1.USER_ROLES.CLIENT)
        filter.user = user.authId;
    if (user.role === user_1.USER_ROLES.STAFF)
        filter.staff = user.authId;
    const result = await booking_model_1.Booking.find(filter).sort({ date: 1 }).populate({
        path: 'user',
        select: '-password -__v -createdAt -updatedAt -authentication',
    });
    return {
        total: result.length,
        weekRange: {
            startOfWeek,
            endOfWeek,
        },
        data: result,
    };
};
exports.BookingServices = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    updateBooking,
    deleteBooking,
    myServices,
    getBookingsByDate,
    updateBookingStatus,
    getWeeklyBookingsByUser,
};
