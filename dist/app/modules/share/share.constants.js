"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.shareSearchableFields = exports.shareFilterables = void 0;
// Filterable fields for Share
exports.shareFilterables = ['caption'];
// Searchable fields for Share
exports.shareSearchableFields = ['caption'];
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
