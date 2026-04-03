import { Router } from "express";
import { createBookingRequest, listMyBookings } from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    validateBookingRequestBody,
    validateUserBookingsQuery,
} from "../validations/booking.validation.js";

const router = Router();

router.use(requireAuth);

router.post("/request", validateRequest({ body: validateBookingRequestBody }), createBookingRequest);
router.get("/my", validateRequest({ query: validateUserBookingsQuery }), listMyBookings);

export default router;
