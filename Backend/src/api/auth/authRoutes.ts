import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logout,
  registerUser,
  renewAccessToken,
  resetPassword,
  updateProfile,
  changePassword,
} from "./authController";
import { authenticateJWT } from "../../services/passportJwt.service";

const authRoute = Router();

//register
authRoute.post("/register", registerUser);

//login
authRoute.post("/login", loginUser);

//refresh token to get new access token;
authRoute.get("/refresh", renewAccessToken);

//password-forgot
authRoute.post("/password/forgot", forgotPassword);

//reset-password
authRoute.post("/password/reset", resetPassword);

//logout
authRoute.post("/logout", authenticateJWT, logout);

//update profile (requires authentication)
authRoute.put("/profile", authenticateJWT, updateProfile);

//change password (requires authentication)
authRoute.put("/password/change", authenticateJWT, changePassword);

export default authRoute;
