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
    var _a, _b, _c;
    try {
        const payload = req.body;
        // console.log('Received payload:', payload)
        // Support both stringified `data` (multipart form) and direct JSON body
        if (payload.data) {
            // If payload.data is a string (form-data with `data`), parse it
            if (typeof payload.data === 'string') {
                try {
                    payload.data = JSON.parse(payload.data);
                }
                catch (err) {
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid JSON in data field');
                }
            }
        }
        else if (Object.keys(payload || {}).length === 0) {
            // empty body
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Data is required');
        }
        else {
            // No `data` wrapper present, use body as data directly (typical JSON requests)
            payload.data = payload;
        }
        // Files - ensure field names match frontend
        const imageFiles = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image;
        const videoFiles = (_b = req.files) === null || _b === void 0 ? void 0 : _b.media; // This should match your frontend "media" field
        console.log('Uploaded files:', {
            images: (imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.length) || 0,
            videos: (videoFiles === null || videoFiles === void 0 ? void 0 : videoFiles.length) || 0,
        });
        let mediaItems = [];
        // ===============================
        // Upload videos FIRST
        // ===============================
        if (videoFiles && videoFiles.length > 0) {
            console.log('Processing video files:', videoFiles.length);
            // For videos, we only allow one video per post (usually)
            const videoFile = videoFiles[0];
            try {
                const uploadedVideoUrls = await s3helper_1.S3Helper.uploadMultipleVideosToS3([videoFile], // Pass as array
                'videos');
                console.log('Uploaded video URLs:', uploadedVideoUrls);
                if (uploadedVideoUrls.length > 0) {
                    mediaItems.push({
                        url: uploadedVideoUrls[0],
                        type: 'video',
                        size: videoFile.size,
                        // Add duration extraction if available
                        // duration: await getVideoDuration(videoFile),
                    });
                    console.log('Video uploaded successfully:', uploadedVideoUrls[0]);
                }
            }
            catch (videoError) {
                console.error('Video upload failed:', videoError);
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Video upload failed: ${videoError.message}`);
            }
        }
        // ===============================
        // Upload images SECOND
        // ===============================
        if (imageFiles && imageFiles.length > 0) {
            console.log('Processing image files:', imageFiles.length);
            try {
                const uploadedImageUrls = await s3helper_1.S3Helper.uploadMultipleFilesToS3(imageFiles, 'images');
                console.log('Uploaded image URLs:', uploadedImageUrls);
                uploadedImageUrls.forEach((url, index) => {
                    var _a;
                    mediaItems.push({
                        url,
                        type: 'image',
                        size: (_a = imageFiles[index]) === null || _a === void 0 ? void 0 : _a.size,
                    });
                });
                console.log('Images uploaded successfully:', uploadedImageUrls.length);
            }
            catch (imageError) {
                console.error('Image upload failed:', imageError);
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Image upload failed: ${imageError.message}`);
            }
        }
        console.log('All media items prepared:', mediaItems);
        // ===============================
        // Final body structure
        // If caller already included `media_source` in payload.data (direct JSON), use it and append uploaded items
        // Otherwise, take uploaded items as `media_source`.
        const existingMediaSource = ((_c = payload === null || payload === void 0 ? void 0 : payload.data) === null || _c === void 0 ? void 0 : _c.media_source) || (payload === null || payload === void 0 ? void 0 : payload.media_source) || [];
        const mergedMediaSource = [...existingMediaSource, ...mediaItems];
        req.body = {
            ...payload.data,
            ...payload,
            media_source: mergedMediaSource,
        };
        console.log('Final media items:', mediaItems);
        next();
    }
    catch (error) {
        console.error('❌ Error in handleMediaUpload:', error);
        next(error);
    }
};
exports.handleMediaUpload = handleMediaUpload;
