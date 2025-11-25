"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
// routes/comment.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const comment_validation_1 = require("./comment.validation");
const comment_controller_1 = require("./comment.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(comment_validation_1.CommentValidations.create), comment_controller_1.CommentController.createComment);
router.get('/post/:postId', (0, validateRequest_1.default)(comment_validation_1.CommentValidations.getComments), comment_controller_1.CommentController.getComments);
router.get('/replies/:commentId', (0, validateRequest_1.default)(comment_validation_1.CommentValidations.getReplies), comment_controller_1.CommentController.getReplies);
router.put('/:id', (0, auth_1.default)(), (0, validateRequest_1.default)(comment_validation_1.CommentValidations.update), comment_controller_1.CommentController.updateComment);
router.delete('/:id', (0, auth_1.default)(), (0, validateRequest_1.default)(comment_validation_1.CommentValidations.delete), comment_controller_1.CommentController.deleteComment);
exports.CommentRoutes = router;
