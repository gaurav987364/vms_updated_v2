"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.logout = exports.resetPassword = exports.forgotPassword = exports.renewAccessToken = exports.loginUser = exports.registerUser = void 0;
const http_config_1 = require("../../config/http.config");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const authValidators_1 = require("./authValidators");
const authService_1 = require("./authService");
const setCookies_1 = require("../../utils/cookies/setCookies");
const ErrorTypes_1 = require("../../utils/Errors/ErrorTypes");
const registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = authValidators_1.registerSchema.parse({
        ...req.body,
    });
    const { user } = await (0, authService_1.RegisterService)(body);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "User Registered Successfully.",
        user: user,
    });
});
exports.registerUser = registerUser;
const loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    //check for user-agent
    const userAgent = req.headers["user-agent"];
    const body = authValidators_1.loginSchema.parse({
        ...req.body,
        userAgent,
    });
    const { accessToken, refreshToken, user } = await (0, authService_1.LoginService)(body);
    // set the access & refresh token to cookie
    return (0, setCookies_1.setAuthtenticationCookies)({
        res,
        accessToken,
        refreshToken,
    })
        .status(http_config_1.HTTPSSTATUS.OK)
        .json({
        message: "User Logged in Successfully.",
        user,
    });
});
exports.loginUser = loginUser;
//refresh-token=> renew access token again
const renewAccessToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const myRefreshToken = req.cookies.refreshToken;
    if (!myRefreshToken) {
        throw new ErrorTypes_1.UnAuthorizedexception("User Not Authenticated.");
    }
    const { newAccessToken, newRefreshtoken } = await (0, authService_1.RenewAccessTokenService)(myRefreshToken);
    if (newRefreshtoken) {
        res.cookie("refreshToken", newRefreshtoken, (0, setCookies_1.getRefreshTokenCookiesOptions)());
    }
    return res
        .status(http_config_1.HTTPSSTATUS.OK)
        .cookie("accessToken", newAccessToken, (0, setCookies_1.getAccessTokenCookiesOptions)())
        .json({
        message: "Refresh Access-Token Successfully.",
        accessToken: newAccessToken, // Add token to response body for frontend
    });
});
exports.renewAccessToken = renewAccessToken;
//forgot-password
const forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const email = authValidators_1.emailSchema.parse(req.body.email);
    await (0, authService_1.ForgotPasswordService)(email);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Please Check Your E-mail.",
    });
});
exports.forgotPassword = forgotPassword;
//reset-password
const resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = authValidators_1.resetPasswordSchema.parse(req.body);
    await (0, authService_1.ResetPasswordService)(body);
    //we have to clear all cookies so that user ka session khatam homjaye or vi logout ho jaye
    return (0, setCookies_1.clearAuthenticationCookies)(res).status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Password Reset Successfully.",
    });
});
exports.resetPassword = resetPassword;
//logout
const logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessionId = req.sessionId;
    if (!sessionId) {
        throw new ErrorTypes_1.NotFoundExeption("Session/id not found.");
    }
    await (0, authService_1.LogoutService)(sessionId);
    return (0, setCookies_1.clearAuthenticationCookies)(res).status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Logged Out Successfully.",
    });
});
exports.logout = logout;
// Update user profile
const updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        throw new ErrorTypes_1.UnAuthorizedexception("User not authenticated.");
    }
    const body = authValidators_1.updateProfileSchema.parse(req.body);
    const { user } = await (0, authService_1.UpdateProfileService)(userId, body);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Profile updated successfully.",
        user,
    });
});
exports.updateProfile = updateProfile;
// Change password
const changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        throw new ErrorTypes_1.UnAuthorizedexception("User not authenticated.");
    }
    const body = authValidators_1.changePasswordSchema.parse(req.body);
    const result = await (0, authService_1.ChangePasswordService)(userId, body);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: result.message,
    });
});
exports.changePassword = changePassword;
