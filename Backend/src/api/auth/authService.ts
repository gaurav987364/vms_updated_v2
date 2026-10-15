import { config } from "../../config/app.config";
import bcrypt from "bcrypt";
import { HTTPSSTATUS } from "../../config/http.config";
import { sendNotification } from "../../services/notification.service";
import { ErrorCode, VerificationTypes } from "../../utils/constants/constant";
import {
  BadRequestException,
  Httpsexception,
  InternalServerException,
  NotFoundExeption,
  UnAuthorizedexception,
} from "../../utils/Errors/ErrorTypes";
import {
  afterOneHour,
  calculateExpirationDate,
  threeMinutesAgo,
} from "../../utils/helper";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
} from "../../utils/jwt/jwt";
import { passwordResetTemplate } from "../../utils/templates/template";
import SessionModel from "../sessions/sessionModel";
import VerificationModel from "../sessions/verificationModel";
import UserModel from "./userModel";

export interface RegisterDataProps {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDataProps {
  email: string;
  password: string;
  userAgent?: string;
}

export const RegisterService = async (body: RegisterDataProps) => {
  const { name, email, username, password } = body;

  if (!name || !email || !username || !password) {
    throw new BadRequestException("All required fields must be provided.");
  }

  // Check if user already exists - run checks in parallel
  const [emailExists, usernameExists] = await Promise.all([
    UserModel.exists({ email }),
    UserModel.exists({ username })
  ]);

  if (emailExists) {
    throw new BadRequestException(
      "User already exists with this email.",
      ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
    );
  }

  if (usernameExists) {
    throw new BadRequestException(
      "Username already taken.",
      ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
    );
  }

  // Create new user
  try {
    const newUser = await UserModel.create({
      name,
      email,
      username,
      password,
    });

    return {
      user: newUser,
    };
  } catch (error: any) {
    // Handle MongoDB duplicate key errors (race condition fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const value = error.keyValue?.[field];

      if (field === "email") {
        throw new BadRequestException(
          "This email is already registered. Please use a different email or try logging in.",
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else if (field === "username") {
        throw new BadRequestException(
          "This username is already taken. Please choose a different username.",
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else {
        // Generic fallback for any other unique constraint
        throw new BadRequestException(
          "An account with these credentials already exists. Please try different information.",
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      }
    }

    // Log unexpected errors for debugging
    console.error("Registration error:", error);

    // Re-throw other errors
    throw new InternalServerException(
      "Failed to create user account. Please try again.",
    );
  }
};

//login
export const LoginService = async (body: LoginDataProps) => {
  const { email, password, userAgent } = body;

  // Find user by email
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundExeption(
      "User not found.",
      ErrorCode.AUTH_USER_NOT_FOUND,
    );
  }

  // Verify password
  const isValidPassword = await user.comparePasswords(password);

  if (!isValidPassword) {
    throw new BadRequestException(
      "Invalid email or password.",
      ErrorCode.AUTH_USER_NOT_FOUND,
    );
  }

  // Delete all existing sessions for this user (single session enforcement)
  await SessionModel.deleteMany({
    userId: user._id,
  });

  // Create new session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent,
  });

  // Create access token
  const accessToken = signJwtToken({
    userId: user._id,
    sessionId: session._id,
  });

  // Create refresh token
  const refreshToken = signJwtToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions,
  );

  return {
    accessToken,
    refreshToken,
    user,
  };
};

//re-new access token using refresh token
export const RenewAccessTokenService = async (refreshToken: string) => {
  //verify old token
  const { payload } = verifyJwtToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  if (!payload) {
    throw new UnAuthorizedexception("Invalid Refresh Token.");
  }

  //find session with payload.sessionId
  const session = await SessionModel.findById(payload.sessionId);

  if (!session) {
    throw new UnAuthorizedexception("Session Does Not Exists.");
  }
  //now (current date & time)
  const now = Date.now();
  // this code is checks for is the refresh token is valid or not or expires , if expires genertae new and set, if not require then it gives false;
  const sessionRequireRefresh =
    session.expiresAt.getTime() - now <= 24 * 60 * 60 * 1000; // 1 day in milliseconds

  if (sessionRequireRefresh) {
    //update the time of session
    session.expiresAt = calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN);

    // save session details
    await session.save();
  }

  //make new refrsh token
  const newRefreshtoken = sessionRequireRefresh
    ? signJwtToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions,
      )
    : undefined;

  //new access token
  const newAccessToken = signJwtToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return {
    newAccessToken,
    newRefreshtoken,
  };
};

//forgot-password-service
export const ForgotPasswordService = async (email: string) => {
  //first find user related to that mail
  const user = await UserModel.findOne({ email: email });

  if (!user) {
    throw new NotFoundExeption("User Not Found.");
  }

  // check mail for rate limit 2 times only in 3 minutes;
  const timeAgo = threeMinutesAgo();
  const maxAttempts = 2;

  // find count
  const count = await VerificationModel.countDocuments({
    userId: user._id,
    type: VerificationTypes.PASSWORD_RESET,
    createdAt: { $gt: timeAgo }, //counts only documen created after this
  });

  if (count >= maxAttempts) {
    throw new Httpsexception(
      "Too Many Attempts, Try Again Later",
      HTTPSSTATUS.TOO_MANY_REQUESTS,
      ErrorCode.AUTH_TOO_MANY_ATTEMPTS,
    );
  }

  // set expires
  const expiresAt = afterOneHour();

  // now create an collection with code type password-reset
  const validCode = await VerificationModel.create({
    userId: user._id,
    type: VerificationTypes.PASSWORD_RESET,
    expiresAt, // setting to after 1 hour
  });

  // now we have to redirect user to reset-password page;
  const resetLink = `${config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

  // our  email service to send password reset link email
  // 5. Generate email from template
  const { subject, html } = passwordResetTemplate(resetLink);

  // 6. Send via notification service
  const data = await sendNotification({
    channel: "email",
    to: user.email,
    subject,
    html,
  });

  // console.log("📧 Email service returned to ForgotPasswordService:", data);

  // The Lambda returns { success: true, result: "message-id" }
  if (!data || data.success !== true) {
    throw new InternalServerException(
      `Failed to send password reset email: ${data?.message || "Unknown error"}`,
    );
  }

  return {
    url: resetLink,
    emailId: data.result,
  };
};

//reset-password-service
export const ResetPasswordService = async (body: any) => {
  const { password, verificationCode } = body;

  //find valid code or match user code
  const isValidCode = await VerificationModel.findOne({
    code: verificationCode,
    type: VerificationTypes.PASSWORD_RESET,
    expiresAt: { $gt: new Date() },
  });

  if (!isValidCode) {
    throw new NotFoundExeption("Invalid Code or Expired Code.");
  }

  //now hashing the user new password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  //find user
  const updatedUser = await UserModel.findByIdAndUpdate(isValidCode.userId, {
    password: hashPassword,
  });

  if (!updatedUser) {
    throw new BadRequestException("Failed to reset password.");
  }

  //delete used code from collection
  await isValidCode.deleteOne();

  //delete all active session for the user whose passsword is updated;
  //doing this step is part of security best practice, as user update their password so he hase to login again mean we delete their all sesions;
  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });

  return {
    user: updatedUser,
  };
};


//logout-service
export const LogoutService = async (sessionId: string) => {
  return await SessionModel.findByIdAndDelete(sessionId);
};

// Update user profile service
export interface UpdateProfileDataProps {
  name?: string;
  username?: string;
  email?: string;
}

export const UpdateProfileService = async (
  userId: string,
  body: UpdateProfileDataProps
) => {
  const { name, username, email } = body;

  // Find user
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundExeption("User not found.");
  }

  // Check if username is being changed and if it's already taken
  if (username && username !== user.username) {
    const usernameExists = await UserModel.exists({ username, _id: { $ne: userId } });
    if (usernameExists) {
      throw new BadRequestException(
        "Username is already taken.",
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await UserModel.exists({ email, _id: { $ne: userId } });
    if (emailExists) {
      throw new BadRequestException(
        "Email is already registered.",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }
  }

  // Update user fields
  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;

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

// Change password service
export interface ChangePasswordDataProps {
  currentPassword: string;
  newPassword: string;
}

export const ChangePasswordService = async (
  userId: string,
  body: ChangePasswordDataProps
) => {
  const { currentPassword, newPassword } = body;

  // Find user
  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new NotFoundExeption("User not found.");
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new BadRequestException(
      "Current password is incorrect.",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  // Check if new password is different from current
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new BadRequestException(
      "New password must be different from current password."
    );
  }

  // Validate new password strength (minimum 8 characters)
  if (newPassword.length < 8) {
    throw new BadRequestException(
      "Password must be at least 8 characters long."
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Delete all sessions except current one to force re-login on other devices
  await SessionModel.deleteMany({
    userId: user._id,
  });

  return {
    message: "Password changed successfully. Please login again on other devices.",
  };
};