import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    clearAuthCookies,
    setAuthCookies,
} from "../services/token.service.js";
import {
    changePassword as changePasswordService,
    createUserSession,
    getCurrentUserProfile,
    forgotPassword as forgotPasswordService,
    loginUser,
    loginWithGoogle,
    logoutUser,
    resetPassword as resetPasswordService,
    refreshUserSession,
    registerUser,
    updateProfile,
    verifyEmail as verifyEmailService,
} from "../services/auth.service.js";
import {
    dispatchPasswordResetEmail,
} from "../services/notification.service.js";

export const signup = asyncHandler(async (req, res) => {
    const { user } = await registerUser(req.body);

    res.status(201).json(
        new ApiResponse(
            201,
            { user: user.toSafeObject() },
            "User registered successfully."
        )
    );
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

export const verifyEmail = asyncHandler(async (req, res) => {
    await verifyEmailService(req.body.token);

    res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { user, resetToken } = await forgotPasswordService(req.body.email);
    dispatchPasswordResetEmail(user, resetToken);

    res.status(200).json(
        new ApiResponse(200, null, "If the account exists and supports password login, a reset email has been sent")
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    await resetPasswordService(req.params.token, req.body.newPassword);

    res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
    await changePasswordService({
        userId: req.user._id,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
    });

    res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});
