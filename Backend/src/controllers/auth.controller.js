import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    clearAuthCookies,
    setAuthCookies,
} from "../services/token.service.js";
import {
    createUserSession,
    getCurrentUserProfile,
    loginUser,
    loginWithGoogle,
    logoutUser,
    refreshUserSession,
    registerUser,
    updateProfile,
} from "../services/auth.service.js";

export const signup = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    const session = await createUserSession(user);

    setAuthCookies(res, session.tokens);

    res.status(201).json(new ApiResponse(201, { user: session.user }, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
    const user = await loginUser(req.body);
    const session = await createUserSession(user);

    setAuthCookies(res, session.tokens);

    res.status(200).json(new ApiResponse(200, { user: session.user }, "Login successful"));
});

export const googleLogin = asyncHandler(async (req, res) => {
    const user = await loginWithGoogle(req.body);
    const session = await createUserSession(user);

    setAuthCookies(res, session.tokens);

    res.status(200).json(new ApiResponse(200, { user: session.user }, "Google login successful"));
});

export const refreshToken = asyncHandler(async (req, res) => {
    const session = await refreshUserSession(req.cookies?.refreshToken);

    setAuthCookies(res, session.tokens);

    res.status(200).json(new ApiResponse(200, { user: session.user }, "Session refreshed successfully"));
});

export const logout = asyncHandler(async (req, res) => {
    await logoutUser(req.user._id);
    clearAuthCookies(res);

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await getCurrentUserProfile(req.user._id);

    res.status(200).json(new ApiResponse(200, { user }, "Current user fetched successfully"));
});

export const patchProfile = asyncHandler(async (req, res) => {
    const user = await updateProfile({
        userId: req.user._id,
        name: req.body.name,
        avatarFile: req.file,
    });

    res.status(200).json(new ApiResponse(200, { user }, "Profile updated successfully"));
});
