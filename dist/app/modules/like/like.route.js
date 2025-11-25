"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeRoutes = void 0;
// routes/like.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const like_validation_1 = require("./like.validation");
const like_controller_1 = require("./like.controller");
const router = express_1.default.Router();
router.post('/toggle', (0, auth_1.default)(), (0, validateRequest_1.default)(like_validation_1.LikeValidations.toggle), like_controller_1.LikeController.toggleLike);
router.get('/:targetType/:targetId', (0, validateRequest_1.default)(like_validation_1.LikeValidations.getLikes), like_controller_1.LikeController.getLikes);
router.get('/status/:targetType/:targetId', (0, auth_1.default)(), (0, validateRequest_1.default)(like_validation_1.LikeValidations.checkStatus), like_controller_1.LikeController.checkLikeStatus);
exports.LikeRoutes = router;
