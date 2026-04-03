import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    createContent,
    deleteContent,
    getAdminContent,
    updateContent,
} from "../services/content.service.js";
import {
    getAdminBookings,
    reviewBooking,
} from "../services/booking.service.js";
import {
    createSlot,
    deleteSlot,
    getAdminSlots,
    updateSlot,
} from "../services/slot.service.js";

export const adminCreateSlot = asyncHandler(async (req, res) => {
    const slot = await createSlot({
        adminId: req.user._id,
        payload: req.body,
    });

    res.status(201).json(new ApiResponse(201, { slot }, "Slot created successfully"));
});

export const adminListSlots = asyncHandler(async (req, res) => {
    const slots = await getAdminSlots(req.query);

    res.status(200).json(new ApiResponse(200, slots, "Slots fetched successfully"));
});

export const adminUpdateSlot = asyncHandler(async (req, res) => {
    const slot = await updateSlot({
        slotId: req.params.id,
        payload: req.body,
    });

    res.status(200).json(new ApiResponse(200, { slot }, "Slot updated successfully"));
});

export const adminDeleteSlot = asyncHandler(async (req, res) => {
    await deleteSlot(req.params.id);

    res.status(200).json(new ApiResponse(200, null, "Slot deleted successfully"));
});

export const adminListBookings = asyncHandler(async (req, res) => {
    const bookings = await getAdminBookings(req.query);

    res.status(200).json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
});

export const adminReviewBooking = asyncHandler(async (req, res) => {
    const booking = await reviewBooking({
        bookingId: req.params.id,
        action: req.body.action,
        notes: req.body.notes,
        adminId: req.user._id,
    });

    const actionLabel = req.body.action === "approve" ? "approved" : "rejected";
    res.status(200).json(new ApiResponse(200, { booking }, `Booking ${actionLabel} successfully`));
});

export const adminListContent = asyncHandler(async (req, res) => {
    const content = await getAdminContent(req.query);

    res.status(200).json(new ApiResponse(200, content, "Admin content fetched successfully"));
});

export const adminCreateContent = asyncHandler(async (req, res) => {
    const content = await createContent({
        payload: req.body,
        files: req.files?.images || [],
    });

    res.status(201).json(new ApiResponse(201, { content }, "Content created successfully"));
});

export const adminUpdateContent = asyncHandler(async (req, res) => {
    const content = await updateContent({
        contentId: req.params.id,
        payload: req.body,
        files: req.files?.images || [],
    });

    res.status(200).json(new ApiResponse(200, { content }, "Content updated successfully"));
});

export const adminDeleteContent = asyncHandler(async (req, res) => {
    await deleteContent(req.params.id);

    res.status(200).json(new ApiResponse(200, null, "Content deleted successfully"));
});
