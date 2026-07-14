import { Request, Response } from "express";
import { HTTPSSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./authValidators";
import {
  ForgotPasswordService,
  LoginService,
  LogoutService,
  RegisterService,
  RenewAccessTokenService,
  ResetPasswordService,
} from "./authService";
import {
  clearAuthenticationCookies,
  getAccessTokenCookiesOptions,
  getRefreshTokenCookiesOptions,
  setAuthtenticationCookies,
} from "../../utils/cookies/setCookies";
import {
  NotFoundExeption,
  UnAuthorizedexception,
} from "../../utils/Errors/ErrorTypes";
import UserModel from "./userModel";

const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const body = registerSchema.parse({
      ...req.body,
    });

    const { user } = await RegisterService(body);

    return res.status(HTTPSSTATUS.OK).json({
      message: "User Registered Successfully.",
      user: user,
    });
  },
);

const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    //check for user-agent
    const userAgent = req.headers["user-agent"];
    const body = loginSchema.parse({
      ...req.body,
      userAgent,
    });

    const { accessToken, refreshToken, user } = await LoginService(body);

    // set the access & refresh token to cookie
    return setAuthtenticationCookies({
      res,
      accessToken,
      refreshToken,
    })
      .status(HTTPSSTATUS.OK)
      .json({
        message: "User Logged in Successfully.",
        user,
      });
  },
);

//refresh-token=> renew access token again
const renewAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const myRefreshToken = req.cookies.refreshToken as string | undefined;

    if (!myRefreshToken) {
      throw new UnAuthorizedexception("User Not Authenticated.");
    }
    const { newAccessToken, newRefreshtoken } =
      await RenewAccessTokenService(myRefreshToken);

    if (newRefreshtoken) {
      res.cookie(
        "refreshToken",
        newRefreshtoken,
        getRefreshTokenCookiesOptions(),
      );
    }

    return res
      .status(HTTPSSTATUS.OK)
      .cookie("accessToken", newAccessToken, getAccessTokenCookiesOptions())
      .json({
        message: "Refresh Access-Token Successfully.",
        accessToken: newAccessToken, // Add token to response body for frontend
      });
  },
);

//forgot-password
const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const email = emailSchema.parse(req.body.email);

    await ForgotPasswordService(email);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Please Check Your E-mail.",
    });
  },
);

//reset-password
const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const body = resetPasswordSchema.parse(req.body);

    await ResetPasswordService(body);

    //we have to clear all cookies so that user ka session khatam homjaye or vi logout ho jaye
    return clearAuthenticationCookies(res).status(HTTPSSTATUS.OK).json({
      message: "Password Reset Successfully.",
    });
  },
);

//logout
const logout = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const sessionId = req.sessionId;

    if (!sessionId) {
      throw new NotFoundExeption("Session/id not found.");
    }

    await LogoutService(sessionId);
    return clearAuthenticationCookies(res).status(HTTPSSTATUS.OK).json({
      message: "Logged Out Successfully.",
    });
  },
);

// Check supplier paid status
const checkSupplierStatus = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { identifier } = req.body; // email or supplierCode

    // console.log("🔍 [checkSupplierStatus] Received identifier:", identifier);

    if (!identifier) {
      // console.log("⚠️ [checkSupplierStatus] No identifier provided");
      return res.status(HTTPSSTATUS.OK).json({
        isPaid: false,
      });
    }

    // Find supplier by email or supplierCode
    const supplier = await UserModel.findOne({
      $or: [
        { email: identifier, userType: "supplier" },
        { supplierCode: identifier, userType: "supplier" }
      ]
    }).select("isPaid");

    // console.log("✅ [checkSupplierStatus] Found supplier:", supplier ? `Yes (isPaid: ${supplier.isPaid})` : "No");

    return res.status(HTTPSSTATUS.OK).json({
      isPaid: supplier?.isPaid || false,
    });
  },
);

export {
  registerUser,
  loginUser,
  renewAccessToken,
  forgotPassword,
  resetPassword,
  logout,
  checkSupplierStatus,
};
