"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = exports.signJwtToken = exports.refreshTokenSignOptions = exports.accessTokenSignOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../../config/app.config");
// make defaults object (Determines who can use the tokens for eg:user)
const defaults = {
    audience: "user",
};
// access token sign options
exports.accessTokenSignOptions = {
    expiresIn: 15 * 60, //15m
    // expiresIn: 15, //15sec
    secret: app_config_1.config.JWT.SECRET,
};
// refresh token sign options
exports.refreshTokenSignOptions = {
    expiresIn: 30 * 24 * 60 * 60, //30d
    // expiresIn: 120, //120sec
    secret: app_config_1.config.JWT.REFRESH_SECRET,
};
// make sign jwt function
const signJwtToken = (payload, options) => {
    const { secret, ...opts } = options || exports.accessTokenSignOptions; // we use options here for accesss by default
    return jsonwebtoken_1.default.sign(payload, secret, {
        ...defaults,
        ...opts,
    });
};
exports.signJwtToken = signJwtToken;
//verify jwt ;
const verifyJwtToken = (token, options) => {
    try {
        const { secret = app_config_1.config.JWT.SECRET, ...opts } = options || {};
        const payload = jsonwebtoken_1.default.verify(token, secret, {
            ...defaults,
            ...opts,
        });
        return { payload };
    }
    catch (error) {
        return {
            error: error.message,
        };
    }
};
exports.verifyJwtToken = verifyJwtToken;
