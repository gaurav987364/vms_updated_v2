import passport from "passport";
import { setupJwtStrategy } from "../services/passportJwt.service";

const initializePassport = () => {
  setupJwtStrategy(passport);
};

initializePassport();
export default passport;
