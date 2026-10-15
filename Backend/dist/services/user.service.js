"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const userModel_1 = __importDefault(require("../api/auth/userModel"));
const ErrorTypes_1 = require("../utils/Errors/ErrorTypes");
const UserService = async (userId) => {
    try {
        const user = await userModel_1.default.findById(userId, {
            password: false,
        });
        return user || null;
    }
    catch (error) {
        throw new ErrorTypes_1.NotFoundExeption("User Not found.");
    }
};
exports.UserService = UserService;
