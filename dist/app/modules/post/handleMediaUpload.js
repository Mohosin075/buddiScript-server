"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMediaUpload = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const s3helper_1 = require("../../../helpers/image/s3helper");
const handleMediaUpload = async (req, res, next) => {
    var _a, _b;
    try {
        const payload = req.body;
        if (!payload.data) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Data is required');
        }
        // Parse JSON payload
        payload.data = JSON.parse(payload.data);
        // Files
        const imageFiles = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image;
        const videoFiles = (_b = req.files) === null || _b === void 0 ? void 0 : _b.media;
        // Media items array following your MediaItem schema
        let mediaItems = [];
        // ===============================
        // Upload videos
        // ===============================
        if ((videoFiles === null || videoFiles === void 0 ? void 0 : videoFiles.length) > 0) {
            if (payload.data.contentType === 'carousel') {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Carousel posts support images only. Videos are not allowed. Please upload images instead.');
            }
            const uploadedVideoUrls = await s3helper_1.S3Helper.uploadMultipleVideosToS3(videoFiles, 'videos');
            if (uploadedVideoUrls.length === 0) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload video files. Please try again.');
            }
            // Create video media items
            uploadedVideoUrls.forEach((url, index) => {
                var _a;
                mediaItems.push({
                    url,
                    type: 'video',
                    size: (_a = videoFiles[index]) === null || _a === void 0 ? void 0 : _a.size,
                    // Note: You might want to extract duration and generate thumbnails here
                    // duration: getVideoDuration(videoFiles[index]),
                    // thumbnail: generateVideoThumbnail(videoFiles[index]),
                });
            });
        }
        // ===============================
        // Upload images
        // ===============================
        if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.length) > 0) {
            const uploadedImageUrls = await s3helper_1.S3Helper.uploadMultipleFilesToS3(imageFiles, 'image');
            //   console.log({uploadedImageUrls})
            if (uploadedImageUrls.length === 0) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload image files. Please try again.');
            }
            // Create image media items
            uploadedImageUrls.forEach((url, index) => {
                var _a;
                mediaItems.push({
                    url,
                    type: 'image',
                    size: (_a = imageFiles[index]) === null || _a === void 0 ? void 0 : _a.size,
                    // altText: payload.data.altText?.[index] // You can add altText in your payload if needed
                });
            });
        }
        // ===============================
        // Final body - structure according to your Post model
        // ===============================
        req.body = {
            ...payload.data,
            media_source: mediaItems,
        };
        next();
    }
    catch (error) {
        console.error('❌ Error in handleMediaUpload:', error);
        next(error);
    }
};
exports.handleMediaUpload = handleMediaUpload;
