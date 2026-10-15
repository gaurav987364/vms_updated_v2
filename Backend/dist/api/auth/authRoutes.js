"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("./authController");
const passportJwt_service_1 = require("../../services/passportJwt.service");
const authRoute = (0, express_1.Router)();
//register
authRoute.post("/register", authController_1.registerUser);
//login
authRoute.post("/login", authController_1.loginUser);
//refresh token to get new access token;
authRoute.get("/refresh", authController_1.renewAccessToken);
//password-forgot
authRoute.post("/password/forgot", authController_1.forgotPassword);
//reset-password
authRoute.post("/password/reset", authController_1.resetPassword);
//logout
authRoute.post("/logout", passportJwt_service_1.authenticateJWT, authController_1.logout);
//update profile (requires authentication)
authRoute.put("/profile", passportJwt_service_1.authenticateJWT, authController_1.updateProfile);
//change password (requires authentication)
authRoute.put("/password/change", passportJwt_service_1.authenticateJWT, authController_1.changePassword);
exports.default = authRoute;
