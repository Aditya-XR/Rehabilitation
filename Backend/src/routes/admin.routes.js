import { Router } from "express";
import {
    adminCreateContent,
    adminCreateSlot,
    adminDeleteContent,
    adminDeleteSlot,
    adminListBookings,
    adminListContent,
    adminListSlots,
    adminReviewBooking,
    adminUpdateContent,
    adminUpdateSlot,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateObjectIdParam } from "../validations/common.validation.js";
import {
    validateAdminBookingsQuery,
    validateAdminReviewBody,
} from "../validations/booking.validation.js";
import {
    validateCreateContentBody,
    validatePublicContentQuery,
    validateUpdateContentBody,
} from "../validations/content.validation.js";
import {
    validateAdminSlotsQuery,
    validateCreateSlotBody,
    validateUpdateSlotBody,
} from "../validations/slot.validation.js";

const router = Router();

router.use(requireAuth, requireRole(USER_ROLES.ADMIN));

router.get("/slots", validateRequest({ query: validateAdminSlotsQuery }), adminListSlots);
router.post("/slots", validateRequest({ body: validateCreateSlotBody }), adminCreateSlot);
router.put(
    "/slots/:id",
    validateRequest({ params: validateObjectIdParam(), body: validateUpdateSlotBody }),
    adminUpdateSlot
);
router.delete("/slots/:id", validateRequest({ params: validateObjectIdParam() }), adminDeleteSlot);

router.get("/bookings", validateRequest({ query: validateAdminBookingsQuery }), adminListBookings);
router.put(
    "/bookings/:id",
    validateRequest({ params: validateObjectIdParam(), body: validateAdminReviewBody }),
    adminReviewBooking
);

router.get("/content", validateRequest({ query: validatePublicContentQuery }), adminListContent);
router.post(
    "/content",
    upload.fields([{ name: "images", maxCount: 10 }]),
    validateRequest({ body: validateCreateContentBody }),
    adminCreateContent
);
router.put(
    "/content/:id",
    upload.fields([{ name: "images", maxCount: 10 }]),
    validateRequest({ params: validateObjectIdParam(), body: validateUpdateContentBody }),
    adminUpdateContent
);
router.delete("/content/:id", validateRequest({ params: validateObjectIdParam() }), adminDeleteContent);

export default router;
