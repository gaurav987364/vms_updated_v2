import { Request, Response } from "express";
import { HTTPSSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./authValidators";
import {
  ForgotPasswordService,
  LoginService,
  LogoutService,
  RegisterService,
  RenewAccessTokenService,
  ResetPasswordService,
  UpdateProfileService,
  ChangePasswordService,
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

// Update user profile
const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;

    if (!userId) {
      throw new UnAuthorizedexception("User not authenticated.");
    }

    const body = updateProfileSchema.parse(req.body);

    const { user } = await UpdateProfileService(userId, body);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Profile updated successfully.",
      user,
    });
  },
);

// Change password
const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;

    if (!userId) {
      throw new UnAuthorizedexception("User not authenticated.");
    }

    const body = changePasswordSchema.parse(req.body);

    const result = await ChangePasswordService(userId, body);

    return res.status(HTTPSSTATUS.OK).json({
      message: result.message,
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
  updateProfile,
  changePassword,
};
