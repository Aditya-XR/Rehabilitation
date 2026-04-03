import { OAuth2Client } from "google-auth-library";
import User from "../models/user.models.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { issueTokensForUser, verifyRefreshToken } from "./token.service.js";
import { uploadImage } from "./media.service.js";

const googleClient = env.google.clientId ? new OAuth2Client(env.google.clientId) : null;

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
    // If user exists and has a password, it means they registered with email/password before
    if (existingUser && existingUser.password) {
        throw new ApiError(409, "User with this email already exists");
    }
    // If user exists but doesn't have a password, it means they registered with Google before. We can allow them to set a password now.
    if (existingUser && !existingUser.password) {
        existingUser.name = name || existingUser.name;
        existingUser.password = password;
        await existingUser.save();
        return existingUser;
    }

    return User.create({
        name,
        email,
        password,
    });
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
        });
        return user;
    }

    user.googleId = payload.sub;
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
