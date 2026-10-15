import { config } from "../config/app.config";
import { ErrorCode } from "../utils/constants/constant";
import { UnAuthorizedexception } from "../utils/Errors/ErrorTypes";
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from "passport-jwt";
import passport, { PassportStatic } from "passport";
import { UserService } from "./user.service";

// import { UserService } from "../modules/user/user.service";

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    // Try Authorization header first (Bearer token)
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Fallback to cookie
    (req) => {
      return req.cookies?.accessToken || null;
    },
  ]),
  secretOrKey: config.JWT.SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new Strategy(options, async (req, payload: JwtPayload, done) => {
      try {
        console.log("🔐 JWT Strategy - Token payload:", payload);
        const user = await UserService(payload.userId);

        if (!user) {
          console.log("❌ JWT Strategy - User not found for ID:", payload.userId);
          return done(null, false);
        }

        console.log("✅ JWT Strategy - User authenticated:", user.email, "userId:", user._id);
        req.sessionId = payload.sessionId;

        // Attach user with explicit userId field
        // Convert to plain object if it's a Mongoose document
        const userObj = user.toObject ? user.toObject() : user;
        const userWithId = {
          ...userObj,
          userId: user._id?.toString() || user._id,
        };

        console.log("🔑 User object being attached to req:", {
          userId: userWithId.userId,
          email: userWithId.email
        });

        return done(null, userWithId);
      } catch (error) {
        console.error("❌ JWT Strategy - Error:", error);
        return done(error, false);
      }
    }),
  );
};


// for protected routes use this just like verifyToken thing
export const authenticateJWT = passport.authenticate("jwt", { session: false });
