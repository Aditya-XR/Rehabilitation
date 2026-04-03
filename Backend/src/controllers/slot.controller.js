import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAvailableSlots } from "../services/slot.service.js";

export const listAvailableSlots = asyncHandler(async (req, res) => {
    const slots = await getAvailableSlots(req.query);

    res.status(200).json(new ApiResponse(200, slots, "Available slots fetched successfully"));
});
