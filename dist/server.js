"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = void 0;
const colors_1 = __importDefault(require("colors"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const isServerless = !!process.env.VERCEL;
const socketHelper_1 = require("./helpers/socketHelper");
const user_service_1 = require("./app/modules/user/user.service");
// import { redisClient } from './helpers/redis'
// import { createAdapter } from "@socket.io/redis-adapter";
// import { emailWorker, notificationWorker } from './helpers/bull-mq-worker'
//uncaught exception
process.on('uncaughtException', error => {
    console.error('UnhandledException Detected', error);
    process.exit(1);
});
exports.onlineUsers = new Map();
let server;
let isDbConnected = false;
async function connectDb() {
    if (!isDbConnected) {
        await mongoose_1.default.connect(config_1.default.database_url);
        isDbConnected = true;
        console.log(colors_1.default.green('🚀 Database connected successfully'));
    }
}
async function main() {
    try {
        await connectDb();
        const port = typeof config_1.default.port === 'number' ? config_1.default.port : Number(config_1.default.port);
        server = app_1.default.listen(port, () => {
            console.log(colors_1.default.yellow(`♻️  Application listening on port:${config_1.default.port}`));
        });
        const io = new socket_io_1.Server(server, {
            pingTimeout: 60000,
            cors: {
                origin: '*',
            },
        });
        await user_service_1.UserServices.createAdmin();
        console.log(colors_1.default.green('🍁 Redis connected successfully'));
        socketHelper_1.socketHelper.socket(io);
        //@ts-ignore
        global.io = io;
    }
    catch (error) {
        console.error(colors_1.default.red('🤢 Failed to connect Database'));
        config_1.default.node_env === 'development' && console.log(error);
    }
    process.on('unhandledRejection', error => {
        if (server) {
            server.close(() => {
                console.error('UnhandledRejection Detected', error);
                process.exit(1);
            });
        }
        else {
            process.exit(1);
        }
    });
}
if (!isServerless) {
    main();
}
//SIGTERM
process.on('SIGTERM', async () => {
    console.log('SIGTERM IS RECEIVE');
    if (server) {
        server.close();
    }
});
exports.default = async (req, res) => {
    await connectDb();
    return app_1.default(req, res);
};
