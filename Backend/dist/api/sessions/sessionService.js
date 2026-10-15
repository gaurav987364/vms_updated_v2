"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateSessionService = exports.DeleteSessionService = exports.GetCurrentSessionService = exports.GetAllSessionService = void 0;
const ErrorTypes_1 = require("../../utils/Errors/ErrorTypes");
const sessionModel_1 = __importDefault(require("./sessionModel"));
const GetAllSessionService = async (userId) => {
    const sessions = await sessionModel_1.default.find({
        userId,
        expiresAt: { $gt: Date.now() },
    }, {
        _id: 1,
        userId: 1,
        userAgent: 1,
        createdAt: 1,
        expiresAt: 1,
    }, {
        sort: {
            createdAt: -1,
        },
    });
    return {
        sessions,
    };
};
exports.GetAllSessionService = GetAllSessionService;
const GetCurrentSessionService = async (sessionId) => {
    const session = await sessionModel_1.default.findById(sessionId)
        .populate("userId")
        .select("-expiresAt");
    if (!session) {
        throw new ErrorTypes_1.NotFoundExeption("Session Not Found.");
    }
    const { userId: user } = session; // gives only user id, but we need whole document so we do poplutae and select
    return {
        user,
    };
};
exports.GetCurrentSessionService = GetCurrentSessionService;
const DeleteSessionService = async (sessionId, userId) => {
    const deleteSession = await sessionModel_1.default.findByIdAndDelete({
        _id: sessionId,
        userId: userId,
    });
    if (!deleteSession) {
        throw new ErrorTypes_1.NotFoundExeption("Session Not Found.");
    }
    return;
};
exports.DeleteSessionService = DeleteSessionService;
// Validate if session still exists (for polling from frontend)
const ValidateSessionService = async (sessionId) => {
    const session = await sessionModel_1.default.findOne({
        _id: sessionId,
        expiresAt: { $gt: new Date() },
    });
    return {
        isValid: !!session,
    };
};
exports.ValidateSessionService = ValidateSessionService;
