"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateExpirationDate = exports.afterOneHour = exports.tenMinutesAgo = exports.threeMinutesAgo = exports.ThirtyDaysFromNow = exports.AfterFortyFiveMinutes = exports.generateUniqueCodes = exports.AppError = exports.getEnviourments = void 0;
const date_fns_1 = require("date-fns");
const uuid_1 = require("uuid");
const http_config_1 = require("../config/http.config");
// helper function for getEnviourments
const getEnviourments = (key, defaultValue) => {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error(`Enviourments variable ${key} does not exists.`);
    }
    return value;
};
exports.getEnviourments = getEnviourments;
// app error class for custom errors
class AppError extends Error {
    statusCode;
    errorCode;
    constructor(message, statusCode = http_config_1.HTTPSSTATUS.INTERNAL_SERVER_ERROR, errorCode = "INTERNAL_SERVER_ERROR" /* ErrorCode.INTERNAL_SERVER_ERROR */) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//unique codes for verification
const generateUniqueCodes = () => {
    return (0, uuid_1.v4)().replace(/-/g, "").substring(0, 25);
};
exports.generateUniqueCodes = generateUniqueCodes;
// after fortyfive minutes
const AfterFortyFiveMinutes = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    return now;
};
exports.AfterFortyFiveMinutes = AfterFortyFiveMinutes;
// thirty days from now
const ThirtyDaysFromNow = () => {
    const now = new Date();
    now.setDate(now.getDate() + 30);
    return now;
};
exports.ThirtyDaysFromNow = ThirtyDaysFromNow;
// three minute ago
const threeMinutesAgo = () => new Date(Date.now() - 3 * 60 * 1000);
exports.threeMinutesAgo = threeMinutesAgo;
// ten minutes ago
const tenMinutesAgo = () => new Date(Date.now() - 10 * 60 * 1000);
exports.tenMinutesAgo = tenMinutesAgo;
// after 1 hour
const afterOneHour = () => new Date(Date.now() + 60 * 60 * 1000);
exports.afterOneHour = afterOneHour;
// cookie expire calculation function
const calculateExpirationDate = (expires = "15m") => {
    // match number + unit (m = minutes, h=hours, d=days)
    const match = expires.match(/^(\d+)([mhd])$/);
    if (!match)
        throw new Error("Invalid format.Use '15m', '1h', or '2d'");
    const [, value, unit] = match; //value 15 + unit m
    const expirationDate = new Date();
    // Check the unit and apply accordingly
    switch (unit) {
        case "m": // minutes
            return (0, date_fns_1.add)(expirationDate, { minutes: parseInt(value) });
        case "h": // hours
            return (0, date_fns_1.add)(expirationDate, { hours: parseInt(value) });
        case "d": // days
            return (0, date_fns_1.add)(expirationDate, { days: parseInt(value) });
        default:
            throw new Error('Invalid unit. Use "m", "h", or "d".');
    }
};
exports.calculateExpirationDate = calculateExpirationDate;
