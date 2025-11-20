"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmGroceryOrder = exports.sendMessageToGroceryBot = void 0;
const openai_1 = __importDefault(require("openai"));
const booking_model_1 = require("./booking.model");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const booking_constants_1 = require("./booking.constants");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const client = new openai_1.default({ apiKey: config_1.default.openAi_api_key });
// =====================
// Grocery Bot Messaging
// =====================
exports.sendMessageToGroceryBot = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const { sessionId, message } = req.body;
    const user = req.user;
    let session = await booking_model_1.GroceryChat.findById(sessionId);
    if (!session) {
        session = await booking_model_1.GroceryChat.create({
            user: user.authId,
            items: [],
            status: 'draft',
        });
    }
    // -----------------------
    // AI: Extract Grocery Item
    // -----------------------
    const aiExtract = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a grocery assistant. Extract items strictly using function calls.',
            },
            { role: 'user', content: message },
        ],
        tools: [{ type: 'function', function: booking_constants_1.itemExtractionSchema }],
        tool_choice: 'auto',
    });
    const choice = aiExtract.choices[0];
    const toolCalls = choice.message.tool_calls;
    // If item extraction happened
    if (choice.finish_reason === 'tool_calls' && (toolCalls === null || toolCalls === void 0 ? void 0 : toolCalls.length)) {
        const firstToolCall = toolCalls[0];
        const extracted = JSON.parse(firstToolCall.function.arguments);
        // Save extracted data
        session.items.push({
            name: extracted.name,
            quantity: extracted.quantity,
        });
        await session.save();
        // AI Suggestion
        const suggestionAI = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Give a short recommendation about the grocery item. Keep it concise.',
                },
                {
                    role: 'user',
                    content: `Item: ${extracted.name}, Quantity: ${extracted.quantity}`,
                },
            ],
        });
        const suggestion = (_a = suggestionAI.choices[0].message.content) !== null && _a !== void 0 ? _a : 'Suggestion unavailable at the moment.';
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: `Item added successfully.`,
            data: {
                sessionId: session._id,
                item: extracted,
                suggestion,
                items: session.items,
            },
        });
    }
    // Fallback if AI gives normal text response
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: choice.message.content || 'Noted.',
        data: {
            sessionId: session._id,
            items: session.items,
        },
    });
});
// ==========================
// Confirm Grocery Order
// ==========================
exports.confirmGroceryOrder = (0, catchAsync_1.default)(async (req, res) => {
    const { sessionId } = req.body;
    const session = await booking_model_1.GroceryChat.findById(sessionId);
    if (!session) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
            success: false,
            message: 'Session not found',
            data: null,
        });
    }
    session.status = 'confirmed';
    await session.save();
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Order confirmed. Please provide delivery address & time.',
        data: {
            sessionId: session._id,
            items: session.items,
        },
    });
});
