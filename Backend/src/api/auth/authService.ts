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
  department?: string;
  role: string;
  plantCode?: string;
  userType: "user" | "supplier";
  supplierCode?: string;
  isPaid?: boolean;
}

export interface LoginDataProps {
  email?: string;
  supplierCode?: string;
  password: string;
  userAgent?: string;
  loginType: "user" | "supplier";
}

export const RegisterService = async (body: RegisterDataProps) => {
  const { name, email, username, password, department, role, plantCode, userType, supplierCode, isPaid } = body;

  if (!name || !email || !username || !password || !role) {
    throw new Error("All required credentials must be provided.");
  }

  // OPTIMIZATION: Run all validation checks in parallel
  const validationChecks = [
    UserModel.exists({ email }).then(exists => ({ field: 'email', exists, value: email })),
    UserModel.exists({ username }).then(exists => ({ field: 'username', exists, value: username }))
  ];

  // Add supplierCode check only if userType is supplier
  if (userType === "supplier" && supplierCode) {
    validationChecks.push(
      UserModel.exists({ supplierCode }).then(exists => ({ field: 'supplierCode', exists, value: supplierCode }))
    );
  }

  // Run all checks in parallel
  const results = await Promise.all(validationChecks);

  // Check for conflicts
  for (const result of results) {
    if (result.exists) {
      if (result.field === 'email') {
        throw new BadRequestException(
          "User Already Exists with this Email.",
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else if (result.field === 'username') {
        throw new BadRequestException(
          "Username already taken.",
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else if (result.field === 'supplierCode') {
        throw new BadRequestException(
          `Supplier code "${result.value}" is already in use.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      }
    }
  }

  // Create new user with proper error handling
  let newUser;
  try {
    newUser = await UserModel.create({
      name,
      email,
      username,
      password,
      department,
      role,
      plantCode,
      userType,
      supplierCode: userType === "supplier" ? supplierCode : undefined,
      isPaid: userType === "supplier" ? (isPaid || false) : undefined,
    });
  } catch (error: any) {
    // Handle MongoDB duplicate key errors (race condition fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const value = error.keyValue?.[field];

      if (field === "supplierCode") {
        throw new BadRequestException(
          `Supplier code "${value}" is already in use.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else if (field === "email") {
        throw new BadRequestException(
          `Email "${value}" is already registered.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else if (field === "username") {
        throw new BadRequestException(
          `Username "${value}" is already taken.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      } else {
        throw new BadRequestException(
          `This ${field} is already in use.`,
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        );
      }
    }

    // Re-throw other errors
    throw error;
  }

  // get user id
  const userId = newUser._id;

  //! we have to added the userType in model so we send from frontend and then store the type based on that type we do later things in our system. also there is no verification email sent thing to user coz we are creating the user from our side and give the account for login.

  //create verification code collection based on user id;
  //   const verificationCode = await VerificationModel.create({
  //     userId,
  //     type: VerificationTypes.EMAIL_VERIFICATION,
  //     expiresAt: AfterFortyFiveMinutes(),
  //   });

  //send code to user email
  //   const verificationURL = `${config.APP_ORIGIN}/confirm-account?code=${verificationCode.code}`;

  //using resend
  //   await sendEmail({
  //     to: newUser.email,
  //     ...verifyEmailTemplate(verificationURL),
  //   });

  return {
    user: newUser,
  };
};

//login
export const LoginService = async (body: LoginDataProps) => {
  const { email, supplierCode, password, userAgent, loginType } = body;

  let user;

  // For user login - find by email only
  if (loginType === "user") {
    if (!email) {
      throw new BadRequestException(
        "Email is required for user login.",
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }
    user = await UserModel.findOne({ email, userType: "user" });
  }
  // For supplier login - find by email OR supplierCode
  else if (loginType === "supplier") {
    if (supplierCode) {
      user = await UserModel.findOne({ supplierCode, userType: "supplier" });
    } else if (email) {
      user = await UserModel.findOne({ email, userType: "supplier" });
    } else {
      throw new BadRequestException(
        "Email or Supplier Code is required for supplier login.",
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }
  }

  //if there is no any user throw error
  if (!user) {
    throw new NotFoundExeption(
      "User Not Found.",
      ErrorCode.AUTH_USER_NOT_FOUND,
    );
  }

  // check and verify the password is corrent
  const isValidPassword = await user.comparePasswords(password);

  //if password is not match throw error
  if (!isValidPassword) {
    throw new BadRequestException(
      "Bad Credentials.",
      ErrorCode.AUTH_USER_NOT_FOUND,
    );
  }

  // DELETE ALL EXISTING SESSIONS FOR THIS USER (single session enforcement)
  // This ensures only one active session per user at any time
  await SessionModel.deleteMany({
    userId: user._id,
  });

  //if user is found and has valid password we have to create session collection
  const session = await SessionModel.create({
    userId: user._id,
    userAgent,
  });

  //after create session collection , create access token
  const accessToken = signJwtToken({
    userId: user._id,
    sessionId: session._id,
  });

  // after accestoken we create refresh token
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