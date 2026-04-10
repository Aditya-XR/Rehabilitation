import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.models.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { issueTokensForUser, verifyRefreshToken } from "./token.service.js";
import { uploadImage } from "./media.service.js";

const googleClient = env.google.clientId ? new OAuth2Client(env.google.clientId) : null;
const EMAIL_VERIFICATION_WINDOW_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_WINDOW_MS = 15 * 60 * 1000;

const generateRawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const getFutureDate = (durationMs) => new Date(Date.now() + durationMs);

const getUserById = async (userId) => {
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
        throw new ApiError(401, "User account is not available");
    }

    return user;
};

const getGooglePayload = async (idToken) => {
    if (!googleClient || !env.google.clientId) {
        throw new ApiError(500, "Google authentication is not configured");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.google.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
        throw new ApiError(401, "Unable to verify Google account");
    }

    return payload;
};

export const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
    });

    return {
        user,
    };
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.password) {
        throw new ApiError(400, "This account uses Google sign-in. Please continue with Google.");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    return user;
};

export const loginWithGoogle = async ({ idToken }) => {
    const payload = await getGooglePayload(idToken);
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name: payload.name || email.split("@")[0],
            email,
            googleId: payload.sub,
            avatar: payload.picture || "",
            isEmailVerified: true,
        });
        return user;
    }

    user.googleId = payload.sub;
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
    }
    if (!user.name && payload.name) {
        user.name = payload.name;
    }

    await user.save({ validateBeforeSave: false });
    return user;
};

export const createUserSession = async (user) => {
    const safeUser = await getUserById(user._id);
    const tokens = await issueTokensForUser(safeUser);

    return {
        user: safeUser.toSafeObject(),
        tokens,
    };
};

export const refreshUserSession = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decoded?._id);

    if (!user || !user.isActive) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is no longer valid");
    }

    const tokens = await issueTokensForUser(user);

    return {
        user: user.toSafeObject(),
        tokens,
    };
};

export const verifyEmail = async (token) => {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired email verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save({ validateBeforeSave: false });

    return user.toSafeObject();
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.password) {
        throw new ApiError(400, "Password reset is not available for Google-only accounts");
    }

    const rawResetToken = generateRawToken();
    user.passwordResetToken = hashToken(rawResetToken);
    user.passwordResetExpiry = getFutureDate(PASSWORD_RESET_WINDOW_MS);
    await user.save({ validateBeforeSave: false });

    return {
        user: user.toSafeObject(),
        resetToken: rawResetToken,
    };
};

export const resetPassword = async (token, newPassword) => {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    return user.toSafeObject();
};

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
    const user = await User.findById(userId).select("+password");

    if (!user || !user.isActive) {
        throw new ApiError(401, "User account is not available");
    }

    if (!user.password) {
        throw new ApiError(400, "Password change is not available for Google-only accounts");
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return user.toSafeObject();
};

export const logoutUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        return;
    }

    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
};

export const updateProfile = async ({ userId, name, avatarFile }) => {
    const user = await getUserById(userId);

    if (name !== undefined) {
        user.name = name;
    }

    if (avatarFile) {
        const avatarAsset = await uploadImage(avatarFile, "rehabilitation/avatars");
        user.avatar = avatarAsset.url;
    }

    await user.save();
    return user.toSafeObject();
};

export const getCurrentUserProfile = async (userId) => {
    const user = await getUserById(userId);
    return user.toSafeObject();
};
