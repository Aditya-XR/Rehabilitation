import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import { env } from "../config/env.js";

export const requireAuth = asyncHandler(async (req, _, next) => {
    try {
        // Get token from cookie OR Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, env.auth.accessTokenSecret);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user || !user.isActive) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Admin Check Middleware
export const requireRole = (...roles) => {
    return (req, _, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Role: ${req.user.role} is not allowed to access this resource`);
        }
        next();
    };
};

export const verifyJWT = requireAuth;
export const authorizeRoles = requireRole;
