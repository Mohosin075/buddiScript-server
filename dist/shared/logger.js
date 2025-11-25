"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.logger = void 0;
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const fs_1 = __importDefault(require("fs"));
// Check if we're running in Vercel environment
const isVercel = process.env.VERCEL || !fs_1.default.existsSync('/var/task');
// Custom log format
const { combine, timestamp, label, printf } = winston_1.format;
const myFormat = printf((info) => {
    const { level, message, label, timestamp } = info;
    const date = new Date(timestamp);
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `{${date.toDateString()} ${hour}:${minutes}:${seconds}} [${label}] ${level}: ${message}`;
});
// Common transport configuration
const getTransportConfig = (type) => {
    const baseTransports = [new winston_1.transports.Console()];
    if (isVercel) {
        return baseTransports;
    }
    // Only add file transport if not in Vercel
    const filename = type === 'success'
        ? path_1.default.join(process.cwd(), 'logs', 'winston', 'successes', 'sg-%DATE%-success.log')
        : path_1.default.join(process.cwd(), 'logs', 'winston', 'errors', 'sg-%DATE%-error.log');
    return [
        ...baseTransports,
        new winston_daily_rotate_file_1.default({
            filename,
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        })
    ];
};
// Success logger
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(label({ label: 'buddiScript 🚀' }), timestamp(), myFormat),
    transports: getTransportConfig('success'),
});
exports.logger = logger;
// Error logger
const errorLogger = (0, winston_1.createLogger)({
    level: 'error',
    format: combine(label({ label: 'buddiScript 🐞' }), timestamp(), myFormat),
    transports: getTransportConfig('error'),
});
exports.errorLogger = errorLogger;
