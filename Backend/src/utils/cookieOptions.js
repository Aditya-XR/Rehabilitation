import { env } from "../config/env.js";

export const getCookieOptions = (maxAge) => {
    const options = {
        httpOnly: true,
        secure: env.cookies.secure,
        sameSite: env.cookies.sameSite,
        maxAge,
        path: "/",
    };

    if (env.cookies.domain) {
        options.domain = env.cookies.domain;
    }

    return options;
};
