import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logout,
  registerUser,
  renewAccessToken,
  resetPassword,
  checkSupplierStatus,
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

//check supplier paid status
authRoute.post("/supplier/check-status", checkSupplierStatus);

//logout
authRoute.post("/logout", authenticateJWT, logout);

export default authRoute;
