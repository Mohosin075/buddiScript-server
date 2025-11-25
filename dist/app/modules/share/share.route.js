"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareRoutes = void 0;
// routes/share.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const share_validation_1 = require("./share.validation");
const share_controller_1 = require("./share.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(share_validation_1.ShareValidations.create), share_controller_1.ShareController.sharePost);
router.get('/:postId', share_controller_1.ShareController.getSharedPosts);
exports.ShareRoutes = router;
