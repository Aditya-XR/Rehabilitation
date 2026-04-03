import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getMyBookings, requestBooking } from "../services/booking.service.js";

export const createBookingRequest = asyncHandler(async (req, res) => {
    const booking = await requestBooking({
        userId: req.user._id,
        slotId: req.body.slotId,
        notes: req.body.notes,
    });

    res.status(201).json(new ApiResponse(201, { booking }, "Slot booked and sent for admin review"));
});

export const listMyBookings = asyncHandler(async (req, res) => {
    const bookings = await getMyBookings({
        userId: req.user._id,
        query: req.query,
    });

    res.status(200).json(new ApiResponse(200, bookings, "Your bookings fetched successfully"));
});
