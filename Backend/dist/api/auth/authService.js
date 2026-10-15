"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordService = exports.UpdateProfileService = exports.LogoutService = exports.ResetPasswordService = exports.ForgotPasswordService = exports.RenewAccessTokenService = exports.LoginService = exports.RegisterService = void 0;
const app_config_1 = require("../../config/app.config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_config_1 = require("../../config/http.config");
const notification_service_1 = require("../../services/notification.service");
const ErrorTypes_1 = require("../../utils/Errors/ErrorTypes");
const helper_1 = require("../../utils/helper");
const jwt_1 = require("../../utils/jwt/jwt");
const template_1 = require("../../utils/templates/template");
const sessionModel_1 = __importDefault(require("../sessions/sessionModel"));
const verificationModel_1 = __importDefault(require("../sessions/verificationModel"));
const userModel_1 = __importDefault(require("./userModel"));
const RegisterService = async (body) => {
    const { name, email, username, password } = body;
    if (!name || !email || !username || !password) {
        throw new ErrorTypes_1.BadRequestException("All required fields must be provided.");
    }
    // Check if user already exists - run checks in parallel
    const [emailExists, usernameExists] = await Promise.all([
        userModel_1.default.exists({ email }),
        userModel_1.default.exists({ username })
    ]);
    if (emailExists) {
        throw new ErrorTypes_1.BadRequestException("User already exists with this email.", "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
    }
    if (usernameExists) {
        throw new ErrorTypes_1.BadRequestException("Username already taken.", "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
    }
    // Create new user
    try {
        const newUser = await userModel_1.default.create({
            name,
            email,
            username,
            password,
        });
        return {
            user: newUser,
        };
    }
    catch (error) {
        // Handle MongoDB duplicate key errors (race condition fallback)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            const value = error.keyValue?.[field];
            if (field === "email") {
                throw new ErrorTypes_1.BadRequestException(`Email "${value}" is already registered.`, "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
            }
            else if (field === "username") {
                throw new ErrorTypes_1.BadRequestException(`Username "${value}" is already taken.`, "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
            }
            else {
                throw new ErrorTypes_1.BadRequestException(`This ${field} is already in use.`, "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
            }
        }
        // Re-throw other errors
        throw error;
    }
};
exports.RegisterService = RegisterService;
//login
const LoginService = async (body) => {
    const { email, password, userAgent } = body;
    // Find user by email
    const user = await userModel_1.default.findOne({ email });
    if (!user) {
        throw new ErrorTypes_1.NotFoundExeption("User not found.", "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
    }
    // Verify password
    const isValidPassword = await user.comparePasswords(password);
    if (!isValidPassword) {
        throw new ErrorTypes_1.BadRequestException("Invalid email or password.", "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
    }
    // Delete all existing sessions for this user (single session enforcement)
    await sessionModel_1.default.deleteMany({
        userId: user._id,
    });
    // Create new session
    const session = await sessionModel_1.default.create({
        userId: user._id,
        userAgent,
    });
    // Create access token
    const accessToken = (0, jwt_1.signJwtToken)({
        userId: user._id,
        sessionId: session._id,
    });
    // Create refresh token
    const refreshToken = (0, jwt_1.signJwtToken)({
        sessionId: session._id,
    }, jwt_1.refreshTokenSignOptions);
    return {
        accessToken,
        refreshToken,
        user,
    };
};
exports.LoginService = LoginService;
//re-new access token using refresh token
const RenewAccessTokenService = async (refreshToken) => {
    //verify old token
    const { payload } = (0, jwt_1.verifyJwtToken)(refreshToken, {
        secret: jwt_1.refreshTokenSignOptions.secret,
    });
    if (!payload) {
        throw new ErrorTypes_1.UnAuthorizedexception("Invalid Refresh Token.");
    }
    //find session with payload.sessionId
    const session = await sessionModel_1.default.findById(payload.sessionId);
    if (!session) {
        throw new ErrorTypes_1.UnAuthorizedexception("Session Does Not Exists.");
    }
    //now (current date & time)
    const now = Date.now();
    // this code is checks for is the refresh token is valid or not or expires , if expires genertae new and set, if not require then it gives false;
    const sessionRequireRefresh = session.expiresAt.getTime() - now <= 24 * 60 * 60 * 1000; // 1 day in milliseconds
    if (sessionRequireRefresh) {
        //update the time of session
        session.expiresAt = (0, helper_1.calculateExpirationDate)(app_config_1.config.JWT.REFRESH_EXPIRES_IN);
        // save session details
        await session.save();
    }
    //make new refrsh token
    const newRefreshtoken = sessionRequireRefresh
        ? (0, jwt_1.signJwtToken)({
            sessionId: session._id,
        }, jwt_1.refreshTokenSignOptions)
        : undefined;
    //new access token
    const newAccessToken = (0, jwt_1.signJwtToken)({
        userId: session.userId,
        sessionId: session._id,
    });
    return {
        newAccessToken,
        newRefreshtoken,
    };
};
exports.RenewAccessTokenService = RenewAccessTokenService;
//forgot-password-service
const ForgotPasswordService = async (email) => {
    //first find user related to that mail
    const user = await userModel_1.default.findOne({ email: email });
    if (!user) {
        throw new ErrorTypes_1.NotFoundExeption("User Not Found.");
    }
    // check mail for rate limit 2 times only in 3 minutes;
    const timeAgo = (0, helper_1.threeMinutesAgo)();
    const maxAttempts = 2;
    // find count
    const count = await verificationModel_1.default.countDocuments({
        userId: user._id,
        type: "PASSWORD_RESET" /* VerificationTypes.PASSWORD_RESET */,
        createdAt: { $gt: timeAgo }, //counts only documen created after this
    });
    if (count >= maxAttempts) {
        throw new ErrorTypes_1.Httpsexception("Too Many Attempts, Try Again Later", http_config_1.HTTPSSTATUS.TOO_MANY_REQUESTS, "AUTH_TOO_MANY_ATTEMPTS" /* ErrorCode.AUTH_TOO_MANY_ATTEMPTS */);
    }
    // set expires
    const expiresAt = (0, helper_1.afterOneHour)();
    // now create an collection with code type password-reset
    const validCode = await verificationModel_1.default.create({
        userId: user._id,
        type: "PASSWORD_RESET" /* VerificationTypes.PASSWORD_RESET */,
        expiresAt, // setting to after 1 hour
    });
    // now we have to redirect user to reset-password page;
    const resetLink = `${app_config_1.config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;
    // our  email service to send password reset link email
    // 5. Generate email from template
    const { subject, html } = (0, template_1.passwordResetTemplate)(resetLink);
    // 6. Send via notification service
    const data = await (0, notification_service_1.sendNotification)({
        channel: "email",
        to: user.email,
        subject,
        html,
    });
    // console.log("📧 Email service returned to ForgotPasswordService:", data);
    // The Lambda returns { success: true, result: "message-id" }
    if (!data || data.success !== true) {
        throw new ErrorTypes_1.InternalServerException(`Failed to send password reset email: ${data?.message || "Unknown error"}`);
    }
    return {
        url: resetLink,
        emailId: data.result,
    };
};
exports.ForgotPasswordService = ForgotPasswordService;
//reset-password-service
const ResetPasswordService = async (body) => {
    const { password, verificationCode } = body;
    //find valid code or match user code
    const isValidCode = await verificationModel_1.default.findOne({
        code: verificationCode,
        type: "PASSWORD_RESET" /* VerificationTypes.PASSWORD_RESET */,
        expiresAt: { $gt: new Date() },
    });
    if (!isValidCode) {
        throw new ErrorTypes_1.NotFoundExeption("Invalid Code or Expired Code.");
    }
    //now hashing the user new password
    const salt = await bcrypt_1.default.genSalt(10);
    const hashPassword = await bcrypt_1.default.hash(password, salt);
    //find user
    const updatedUser = await userModel_1.default.findByIdAndUpdate(isValidCode.userId, {
        password: hashPassword,
    });
    if (!updatedUser) {
        throw new ErrorTypes_1.BadRequestException("Failed to reset password.");
    }
    //delete used code from collection
    await isValidCode.deleteOne();
    //delete all active session for the user whose passsword is updated;
    //doing this step is part of security best practice, as user update their password so he hase to login again mean we delete their all sesions;
    await sessionModel_1.default.deleteMany({
        userId: updatedUser._id,
    });
    return {
        user: updatedUser,
    };
};
exports.ResetPasswordService = ResetPasswordService;
//logout-service
const LogoutService = async (sessionId) => {
    return await sessionModel_1.default.findByIdAndDelete(sessionId);
};
exports.LogoutService = LogoutService;
const UpdateProfileService = async (userId, body) => {
    const { name, username, email } = body;
    // Find user
    const user = await userModel_1.default.findById(userId);
    if (!user) {
        throw new ErrorTypes_1.NotFoundExeption("User not found.");
    }
    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
        const usernameExists = await userModel_1.default.exists({ username, _id: { $ne: userId } });
        if (usernameExists) {
            throw new ErrorTypes_1.BadRequestException("Username is already taken.", "VALIDATION_ERROR" /* ErrorCode.VALIDATION_ERROR */);
        }
    }
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
        const emailExists = await userModel_1.default.exists({ email, _id: { $ne: userId } });
        if (emailExists) {
            throw new ErrorTypes_1.BadRequestException("Email is already registered.", "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
        }
    }
    // Update user fields
    if (name)
        user.name = name;
    if (username)
        user.username = username;
    if (email)
        user.email = email;
    await user.save();
    return {
        user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
};
exports.UpdateProfileService = UpdateProfileService;
const ChangePasswordService = async (userId, body) => {
    const { currentPassword, newPassword } = body;
    // Find user
    const user = await userModel_1.default.findById(userId).select("+password");
    if (!user) {
        throw new ErrorTypes_1.NotFoundExeption("User not found.");
    }
    // Verify current password
    const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isValidPassword) {
        throw new ErrorTypes_1.BadRequestException("Current password is incorrect.", "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
    }
    // Check if new password is different from current
    const isSamePassword = await bcrypt_1.default.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new ErrorTypes_1.BadRequestException("New password must be different from current password.");
    }
    // Validate new password strength (minimum 8 characters)
    if (newPassword.length < 8) {
        throw new ErrorTypes_1.BadRequestException("Password must be at least 8 characters long.");
    }
    // Update password
    user.password = newPassword;
    await user.save();
    // Delete all sessions except current one to force re-login on other devices
    await sessionModel_1.default.deleteMany({
        userId: user._id,
    });
    return {
        message: "Password changed successfully. Please login again on other devices.",
    };
};
exports.ChangePasswordService = ChangePasswordService;
