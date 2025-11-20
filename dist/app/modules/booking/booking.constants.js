"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemExtractionSchema = exports.isSetEqual = exports.bookingSearchableFields = exports.bookingFilterables = void 0;
// Filterable fields for Booking
exports.bookingFilterables = [
    'startTime',
    'endTime',
    'address',
    'notes',
    'status',
];
// Searchable fields for Booking
exports.bookingSearchableFields = [
    'startTime',
    'endTime',
    'address',
    'notes',
];
// Helper function for set comparison
const isSetEqual = (setA, setB) => {
    if (setA.size !== setB.size)
        return false;
    for (const item of setA) {
        if (!setB.has(item))
            return false;
    }
    return true;
};
exports.isSetEqual = isSetEqual;
// only for grocery booking
exports.itemExtractionSchema = {
    name: 'extract_grocery_item',
    description: 'Extract item name and quantity from user message',
    parameters: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            quantity: { type: 'string' },
        },
        required: ['name', 'quantity'],
    },
};
