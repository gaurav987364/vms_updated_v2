"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthenticationCookies = exports.setAuthtenticationCookies = exports.getAccessTokenCookiesOptions = exports.getRefreshTokenCookiesOptions = exports.REFRESH_PATH = void 0;
const app_config_1 = require("../../config/app.config");
const helper_1 = require("../helper");
// cookie path => path for getting new access token
exports.REFRESH_PATH = `${app_config_1.config.BASE_PATH}/auth/refresh`;
// default options for setting cookies
const defaults = {
    httpOnly: true,
    secure: app_config_1.config.NODE_ENV === "production" ? true : false,
    sameSite: app_config_1.config.NODE_ENV === "production" ? "strict" : "lax",
};
// get refresh token cookies option function (option setter funtion for cookie)
const getRefreshTokenCookiesOptions = () => {
    const expiresIn = app_config_1.config.JWT.REFRESH_EXPIRES_IN;
    const expires = (0, helper_1.calculateExpirationDate)(expiresIn);
    return {
        ...defaults, // adding the defaults option as well
        expires,
        path: exports.REFRESH_PATH,
    };
};
exports.getRefreshTokenCookiesOptions = getRefreshTokenCookiesOptions;
// get access token cookies option function (option setter funtion for cookie)
const getAccessTokenCookiesOptions = () => {
    const expiresIn = app_config_1.config.JWT.EXPIRES_IN;
    const expires = (0, helper_1.calculateExpirationDate)(expiresIn);
    return {
        ...defaults, // adding the defaults option as well
        expires,
        path: "/",
    };
};
exports.getAccessTokenCookiesOptions = getAccessTokenCookiesOptions;
// set authentication cookies :-
const setAuthtenticationCookies = ({ res, accessToken, refreshToken, }) => {
    return res
        .cookie("accessToken", accessToken, (0, exports.getAccessTokenCookiesOptions)())
        .cookie("refreshToken", refreshToken, (0, exports.getRefreshTokenCookiesOptions)());
};
exports.setAuthtenticationCookies = setAuthtenticationCookies;
// means just like normally , set the cookies to user now we have to set cookies in best practice
//clear cookies function
const clearAuthenticationCookies = (res) => {
    return res.clearCookie("accessToken").clearCookie("refreshToken", {
        path: exports.REFRESH_PATH, //read below
    });
};
exports.clearAuthenticationCookies = clearAuthenticationCookies;
//clearing the refreshToken with a specific path (like REFESH_PATH) ensures that any path-specif token cant be reused to generate new acces token
