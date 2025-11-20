"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const booking_validation_1 = require("./booking.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const gorceryChat_1 = require("./gorceryChat");
const router = express_1.default.Router();
// Base route: /bookings
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.CLIENT, user_1.USER_ROLES.STAFF), booking_controller_1.BookingController.getAllBookings)
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.CLIENT), (0, validateRequest_1.default)(booking_validation_1.BookingValidations.create), booking_controller_1.BookingController.createBooking);
// My services route: /bookings/my-services
router
    .route('/my-services')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.CLIENT, user_1.USER_ROLES.STAFF), booking_controller_1.BookingController.myServices);
// Scheduled bookings route: /bookings/scheduled
router
    .route('/scheduled')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.CLIENT, user_1.USER_ROLES.STAFF), booking_controller_1.BookingController.getBookingsByDate);
// Update booking status route: /bookings/:id/status
router
    .route('/:id/status')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.STAFF), booking_controller_1.BookingController.updateBookingStatus);
router
    .route('/weekly')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), booking_controller_1.BookingController.getWeeklyBookingsByUser);
// Single booking routes: /bookings/:id
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.CLIENT, user_1.USER_ROLES.STAFF), booking_controller_1.BookingController.getSingleBooking)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), booking_controller_1.BookingController.updateBooking)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), booking_controller_1.BookingController.deleteBooking);
router.post('/chat/send', (0, auth_1.default)(user_1.USER_ROLES.CLIENT), gorceryChat_1.sendMessageToGroceryBot);
router.post('/chat/confirm', (0, auth_1.default)(user_1.USER_ROLES.CLIENT), gorceryChat_1.confirmGroceryOrder);
exports.BookingRoutes = router;
