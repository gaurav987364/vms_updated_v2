"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = exports.deleteSession = exports.getSession = exports.getAllSessions = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const http_config_1 = require("../../config/http.config");
const zod_1 = require("zod");
const ErrorTypes_1 = require("../../utils/Errors/ErrorTypes");
const sessionService_1 = require("./sessionService");
const getAllSessions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessionId = req.sessionId;
    const userId = req.user?.id;
    const { sessions } = await (0, sessionService_1.GetAllSessionService)(userId);
    const modifySessions = sessions.map((session) => ({
        ...session.toObject(), //convert to plain-js object taki we do below stuff
        ...(session.id === sessionId && {
            isCurrent: true, //adding proprty to object;
        }),
    }));
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Retrieved All Session Succesfully.",
        sessions: modifySessions,
    });
});
exports.getAllSessions = getAllSessions;
//get current-active session
const getSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessionId = req.sessionId;
    if (!sessionId) {
        throw new ErrorTypes_1.NotFoundExeption("Invalid Session.");
    }
    const { user } = await (0, sessionService_1.GetCurrentSessionService)(sessionId);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Session Retrieved Successfully",
        user,
    });
});
exports.getSession = getSession;
//delete session
const deleteSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessionId = zod_1.z.string().parse(req.params.id);
    const userId = req.user?.id;
    if (!sessionId || !userId) {
        throw new ErrorTypes_1.NotFoundExeption("Resources Not Found.");
    }
    await (0, sessionService_1.DeleteSessionService)(sessionId, userId);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Session Deleted Successfully.",
    });
});
exports.deleteSession = deleteSession;
// validate session (for frontend polling)
const validateSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessionId = req.sessionId;
    if (!sessionId) {
        throw new ErrorTypes_1.NotFoundExeption("Session Not Found.");
    }
    const { isValid } = await (0, sessionService_1.ValidateSessionService)(sessionId);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Session Validated.",
        isValid,
    });
});
exports.validateSession = validateSession;
