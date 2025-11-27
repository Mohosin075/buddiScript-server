"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = require("../app/modules/user/user.route");
const auth_route_1 = require("../app/modules/auth/auth.route");
const express_1 = __importDefault(require("express"));
const notifications_route_1 = require("../app/modules/notifications/notifications.route");
const public_route_1 = require("../app/modules/public/public.route");
const support_route_1 = require("../app/modules/support/support.route");
const post_route_1 = require("../app/modules/post/post.route");
const upload_route_1 = require("../app/modules/upload/upload.route");
const like_route_1 = require("../app/modules/like/like.route");
const comment_route_1 = require("../app/modules/comment/comment.route");
const share_route_1 = require("../app/modules/share/share.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: '/user', route: user_route_1.UserRoutes },
    { path: '/auth', route: auth_route_1.AuthRoutes },
    { path: '/notifications', route: notifications_route_1.NotificationRoutes },
    { path: '/public', route: public_route_1.PublicRoutes },
    { path: '/support', route: support_route_1.SupportRoutes },
    { path: '/post', route: post_route_1.PostRoutes },
    { path: '/upload', route: upload_route_1.UploadRoutes },
    { path: '/like', route: like_route_1.LikeRoutes },
    { path: '/comment', route: comment_route_1.CommentRoutes },
    { path: '/share', route: share_route_1.ShareRoutes },
];
apiRoutes.forEach(route => {
    router.use(route.path, route.route);
});
exports.default = router;
