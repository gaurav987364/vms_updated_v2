"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Httpsexception = exports.InternalServerException = exports.UnAuthorizedexception = exports.BadRequestException = exports.NotFoundExeption = void 0;
const http_config_1 = require("../../config/http.config");
const helper_1 = require("../helper");
// Not found
class NotFoundExeption extends helper_1.AppError {
    constructor(message = "Resources Not Found", errorcode) {
        super(message, http_config_1.HTTPSSTATUS.NOT_FOUND, errorcode || "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
    }
}
exports.NotFoundExeption = NotFoundExeption;
// bad request
class BadRequestException extends helper_1.AppError {
    constructor(message = "Bad Request", errorCode) {
        super(message, http_config_1.HTTPSSTATUS.BAD_REQUEST, errorCode);
    }
}
exports.BadRequestException = BadRequestException;
// unauthorized
class UnAuthorizedexception extends helper_1.AppError {
    constructor(message = "Unauthorized Access", errorCode) {
        super(message, http_config_1.HTTPSSTATUS.UNAUTHORIZED, errorCode || "ACCESS_UNAUTHORIZED" /* ErrorCode.ACCESS_UNAUTHORIZED */);
    }
}
exports.UnAuthorizedexception = UnAuthorizedexception;
// internal server
class InternalServerException extends helper_1.AppError {
    constructor(message = "Internal Server Error.", errorCode) {
        super(message, http_config_1.HTTPSSTATUS.INTERNAL_SERVER_ERROR, errorCode || "INTERNAL_SERVER_ERROR" /* ErrorCode.INTERNAL_SERVER_ERROR */);
    }
}
exports.InternalServerException = InternalServerException;
// https => this exception is different from above ones; we have to pass status code also to contructor
class Httpsexception extends helper_1.AppError {
    constructor(message = "HTTP Server Error.", statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
exports.Httpsexception = Httpsexception;
