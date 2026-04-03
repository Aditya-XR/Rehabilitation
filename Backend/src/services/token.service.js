import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { TOKEN_COOKIE_NAMES } from "../constants/index.js";
import { durationToMs } from "../utils/duration.js";
import { getCookieOptions } from "../utils/cookieOptions.js";

const ACCESS_TOKEN_MAX_AGE = durationToMs(env.auth.accessTokenExpiry, 60 * 60 * 1000);
const REFRESH_TOKEN_MAX_AGE = durationToMs(env.auth.refreshTokenExpiry, 10 * 24 * 60 * 60 * 1000);

export const issueTokensForUser = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
    res.cookie(TOKEN_COOKIE_NAMES.ACCESS, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie(TOKEN_COOKIE_NAMES.REFRESH, refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE));
};

export const clearAuthCookies = (res) => {
    res.clearCookie(TOKEN_COOKIE_NAMES.ACCESS, getCookieOptions(0));
    res.clearCookie(TOKEN_COOKIE_NAMES.REFRESH, getCookieOptions(0));
};

export const verifyRefreshToken = (token) =>
    jwt.verify(token, env.auth.refreshTokenSecret);
