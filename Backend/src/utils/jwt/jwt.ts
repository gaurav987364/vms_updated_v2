import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { config } from "../../config/app.config";
import { SessionDocument } from "../../api/sessions/sessionModel";
import { UserDocument } from "../../api/auth/userModel";

// access token data types
export interface AccessTokenPayload {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
}

// refresh token data types
export interface RefreshTokenPayload {
  sessionId: SessionDocument["_id"];
}

// or custom type, sign options with secret key
type SignOptsAndSecretKey = SignOptions & { secret: string };

// make defaults object (Determines who can use the tokens for eg:user)
const defaults = {
  audience: "user",
};

// access token sign options
export const accessTokenSignOptions: SignOptsAndSecretKey = {
  expiresIn: 15 * 60, //15m
  // expiresIn: 15, //15sec
  secret: config.JWT.SECRET,
};

// refresh token sign options
export const refreshTokenSignOptions: SignOptsAndSecretKey = {
  expiresIn: 30 * 24 * 60 * 60, //30d
  // expiresIn: 120, //120sec
  secret: config.JWT.REFRESH_SECRET,
};

// make sign jwt function
export const signJwtToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptsAndSecretKey,
) => {
  const { secret, ...opts } = options || accessTokenSignOptions; // we use options here for accesss by default
  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });
};

//verify jwt ;
export const verifyJwtToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret: string },
) => {
  try {
    const { secret = config.JWT.SECRET, ...opts } = options || {};

    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...opts,
    }) as TPayload;

    return { payload };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
