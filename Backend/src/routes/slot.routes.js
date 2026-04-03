import { Router } from "express";
import { listAvailableSlots } from "../controllers/slot.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { validateAvailableSlotsQuery } from "../validations/slot.validation.js";

const router = Router();

router.get("/available", validateRequest({ query: validateAvailableSlotsQuery }), listAvailableSlots);

export default router;
