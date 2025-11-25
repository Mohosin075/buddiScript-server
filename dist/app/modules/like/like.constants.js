"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.likeSearchableFields = exports.likeFilterables = void 0;
// Filterable fields for Like
exports.likeFilterables = [];
// Searchable fields for Like
exports.likeSearchableFields = [];
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
