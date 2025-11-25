"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.commentSearchableFields = exports.commentFilterables = void 0;
// Filterable fields for Comment
exports.commentFilterables = ['content'];
// Searchable fields for Comment
exports.commentSearchableFields = ['content'];
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
