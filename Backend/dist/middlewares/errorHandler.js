"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const helper_1 = require("../utils/helper");
const http_config_1 = require("../config/http.config");
const setCookies_1 = require("../utils/cookies/setCookies");
const formatZodError = (res, error) => {
    const errors = error?.issues?.map((err) => {
        return {
            field: err.path.join(""),
            message: err.message,
        };
    });
    return res.status(http_config_1.HTTPSSTATUS.BAD_REQUEST).json({
        message: "Validation Error",
        errors,
    });
};
const errorHandler = (error, req, res, next) => {
    console.error(`Error Occured On Path : ${req.path}`, error);
    // if refresh path then clear cookies all
    if (req.path === setCookies_1.REFRESH_PATH) {
        (0, setCookies_1.clearAuthenticationCookies)(res);
    }
    // syntax errors for invalid json syntax
    if (error instanceof SyntaxError) {
        return res.status(http_config_1.HTTPSSTATUS.BAD_REQUEST).json({
            message: "Invalid, Json Syntax.",
            error: error?.message || "Unknown Error Occured.",
        });
    }
    //zod errors
    if (error instanceof zod_1.z.ZodError) {
        return formatZodError(res, error);
    }
    //app error class for custom errors like happeing in request of something so return proper code + message
    if (error instanceof helper_1.AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }
    return res.status(http_config_1.HTTPSSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error?.message || "Unknown Error Occured.",
    });
};
exports.errorHandler = errorHandler;
