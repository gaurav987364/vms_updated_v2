"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passportJwt_service_1 = require("../services/passportJwt.service");
const initializePassport = () => {
    (0, passportJwt_service_1.setupJwtStrategy)(passport_1.default);
};
initializePassport();
exports.default = passport_1.default;
