"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = exports.setupJwtStrategy = void 0;
const app_config_1 = require("../config/app.config");
const passport_jwt_1 = require("passport-jwt");
const passport_1 = __importDefault(require("passport"));
const user_service_1 = require("./user.service");
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
        // Try Authorization header first (Bearer token)
        passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Fallback to cookie
        (req) => {
            return req.cookies?.accessToken || null;
        },
    ]),
    secretOrKey: app_config_1.config.JWT.SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
    passReqToCallback: true,
};
const setupJwtStrategy = (passport) => {
    passport.use(new passport_jwt_1.Strategy(options, async (req, payload, done) => {
        try {
            console.log("🔐 JWT Strategy - Token payload:", payload);
            const user = await (0, user_service_1.UserService)(payload.userId);
            if (!user) {
                console.log("❌ JWT Strategy - User not found for ID:", payload.userId);
                return done(null, false);
            }
            console.log("✅ JWT Strategy - User authenticated:", user.email, "userId:", user._id);
            req.sessionId = payload.sessionId;
            // Attach user with explicit userId field
            // Convert to plain object if it's a Mongoose document
            const userObj = user.toObject ? user.toObject() : user;
            const userWithId = {
                ...userObj,
                userId: user._id?.toString() || user._id,
            };
            console.log("🔑 User object being attached to req:", {
                userId: userWithId.userId,
                email: userWithId.email
            });
            return done(null, userWithId);
        }
        catch (error) {
            console.error("❌ JWT Strategy - Error:", error);
            return done(error, false);
        }
    }));
};
exports.setupJwtStrategy = setupJwtStrategy;
// for protected routes use this just like verifyToken thing
exports.authenticateJWT = passport_1.default.authenticate("jwt", { session: false });
