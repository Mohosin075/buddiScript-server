"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.postSearchableFields = exports.postFilterables = void 0;
// Filterable fields for Post
exports.postFilterables = ['content'];
// Searchable fields for Post
exports.postSearchableFields = ['content'];
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
