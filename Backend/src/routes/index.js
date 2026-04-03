import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import bookingRoutes from "./booking.routes.js";
import contentRoutes from "./content.routes.js";
import slotRoutes from "./slot.routes.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get("/status", (_req, res) => {
    res.status(200).json(new ApiResponse(200, null, "Server is running"));
});

router.use("/auth", authRoutes);
router.use("/slots", slotRoutes);
router.use("/bookings", bookingRoutes);
router.use("/content", contentRoutes);
router.use("/admin", adminRoutes);

export default router;
