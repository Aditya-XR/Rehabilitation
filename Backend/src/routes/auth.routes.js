import { Router } from "express";
import {
    changePassword,
    forgotPassword,
    getMe,
    googleLogin,
    login,
    logout,
    patchProfile,
    resetPassword,
    refreshToken,
    signup,
    verifyEmail,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    validateChangePasswordBody,
    validateForgotPasswordBody,
    validateGoogleBody,
    validateLoginBody,
    validateProfileBody,
    validateResetPasswordBody,
    validateResetPasswordParams,
    validateSignupBody,
    validateVerifyEmailBody,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/signup", authRateLimiter, validateRequest({ body: validateSignupBody }), signup);
router.post("/login", authRateLimiter, validateRequest({ body: validateLoginBody }), login);
router.post("/google", authRateLimiter, validateRequest({ body: validateGoogleBody }), googleLogin);
router.post("/verify-email", authRateLimiter, validateRequest({ body: validateVerifyEmailBody }), verifyEmail);
router.post("/forgot-password", authRateLimiter, validateRequest({ body: validateForgotPasswordBody }), forgotPassword);
router.post(
    "/reset-password/:token",
    authRateLimiter,
    validateRequest({ params: validateResetPasswordParams, body: validateResetPasswordBody }),
    resetPassword
);
router.post("/refresh-token", refreshToken);
router.post("/logout", requireAuth, logout);
router.post("/change-password", requireAuth, validateRequest({ body: validateChangePasswordBody }), changePassword);
router.get("/me", requireAuth, getMe);
router.patch(
    "/profile",
    requireAuth,
    upload.single("avatar"),
    validateRequest({ body: validateProfileBody }),
    patchProfile
);

export default router;
