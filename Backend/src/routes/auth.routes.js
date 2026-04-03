import { Router } from "express";
import {
    getMe,
    googleLogin,
    login,
    logout,
    patchProfile,
    refreshToken,
    signup,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    validateGoogleBody,
    validateLoginBody,
    validateProfileBody,
    validateSignupBody,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/signup", authRateLimiter, validateRequest({ body: validateSignupBody }), signup);
router.post("/login", authRateLimiter, validateRequest({ body: validateLoginBody }), login);
router.post("/google", authRateLimiter, validateRequest({ body: validateGoogleBody }), googleLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);
router.patch(
    "/profile",
    requireAuth,
    upload.single("avatar"),
    validateRequest({ body: validateProfileBody }),
    patchProfile
);

export default router;
