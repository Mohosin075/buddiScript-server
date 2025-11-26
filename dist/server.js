"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
// Check if running on Vercel serverless
const isServerless = !!process.env.VERCEL;
// --- Database Connection ---
let isDbConnected = false;
async function connectDb() {
    if (!isDbConnected) {
        await mongoose_1.default.connect(config_1.default.database_url);
        isDbConnected = true;
        console.log(colors_1.default.green('🚀 Database connected successfully'));
    }
}
// --- Main function for local server ---
let server;
async function main() {
    try {
        await connectDb();
        const port = typeof config_1.default.port === 'number' ? config_1.default.port : Number(config_1.default.port);
        server = app_1.default.listen(port, () => {
            console.log(colors_1.default.yellow(`♻️  Server running on port: ${config_1.default.port}`));
        });
    }
    catch (error) {
        console.error(colors_1.default.red('🤢 Failed to connect Database'));
        if (config_1.default.node_env === 'development')
            console.log(error);
    }
    // Handle unhandled promises
    process.on('unhandledRejection', error => {
        console.error('UnhandledRejection Detected', error);
        if (server)
            server.close(() => process.exit(1));
        else
            process.exit(1);
    });
    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
        console.error('UnhandledException Detected', error);
        process.exit(1);
    });
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received');
        if (server)
            server.close();
    });
}
// --- Run main only if not serverless ---
if (!isServerless)
    main();
// --- Export handler for Vercel serverless ---
exports.default = async (req, res) => {
    await connectDb();
    return (0, app_1.default)(req, res);
};
