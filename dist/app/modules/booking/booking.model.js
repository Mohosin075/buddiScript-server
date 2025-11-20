"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroceryChat = exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    service: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Service', required: true },
    staff: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    address: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0], // [longitude, latitude]
        },
    },
    serviceType: {
        title: { type: String, required: true },
        description: { type: String },
    },
    serviceDetails: [
        {
            name: { type: String, required: true },
            value: { type: mongoose_1.Schema.Types.Mixed }, // can be string | number | boolean
        },
    ],
    notes: { type: String },
    status: {
        type: String,
        enum: [
            'confirmed',
            'inProgress',
            'completed',
            'cancelled',
            'requested',
            'scheduled',
        ],
        default: 'requested',
    },
}, {
    timestamps: true,
});
exports.Booking = (0, mongoose_1.model)('Booking', bookingSchema);
// only for grocery booking
const groceryChatSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            name: { type: String },
            quantity: { type: String },
        },
    ],
    status: { type: String, enum: ['draft', 'confirmed'], default: 'draft' },
}, { timestamps: true });
exports.GroceryChat = (0, mongoose_1.model)('GroceryChat', groceryChatSchema);
