import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Slot from "../models/slot.model.js";
import { ApiError } from "../utils/ApiError.js";
import { BOOKING_STATUS, SLOT_STATUS } from "../constants/index.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { dispatchBookingStatusEmail } from "./notification.service.js";

const populateBookingQuery = (query) =>
    query
        .populate("user", "name email avatar role")
        .populate("slot", "date startTime endTime startsAt endsAt status");

export const requestBooking = async ({ userId, slotId, notes }) => {
    const session = await mongoose.startSession();
    let createdBookingId = null;

    try {
        await session.withTransaction(async () => {
            const slot = await Slot.findOneAndUpdate(
                {
                    _id: slotId,
                    status: SLOT_STATUS.AVAILABLE,
                    startsAt: { $gt: new Date() },
                },
                {
                    $set: {
                        status: SLOT_STATUS.PENDING,
                    },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!slot) {
                throw new ApiError(409, "Slot is no longer available");
            }

            const [booking] = await Booking.create(
                [
                    {
                        user: userId,
                        slot: slot._id,
                        status: BOOKING_STATUS.PENDING,
                        notes: notes || "",
                        statusHistory: [
                            {
                                to: BOOKING_STATUS.PENDING,
                                actor: userId,
                                note: notes || "",
                            },
                        ],
                    },
                ],
                { session }
            );

            createdBookingId = booking._id;
        });
    } finally {
        await session.endSession();
    }

    return populateBookingQuery(Booking.findById(createdBookingId));
};

export const getMyBookings = async ({ userId, query }) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { user: userId };

    if (query.status) {
        filter.status = query.status;
    }

    const [items, total] = await Promise.all([
        populateBookingQuery(
            Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ),
        Booking.countDocuments(filter),
    ]);

    return {
        items,
        pagination: buildPaginationMeta({ page, limit, total }),
    };
};

export const getAdminBookings = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.status) {
        filter.status = query.status;
    }

    const [items, total] = await Promise.all([
        populateBookingQuery(
            Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ),
        Booking.countDocuments(filter),
    ]);

    return {
        items,
        pagination: buildPaginationMeta({ page, limit, total }),
    };
};

export const reviewBooking = async ({ bookingId, action, notes, adminId }) => {
    const session = await mongoose.startSession();
    const nextBookingStatus =
        action === "approve" ? BOOKING_STATUS.APPROVED : BOOKING_STATUS.REJECTED;
    const nextSlotStatus =
        action === "approve" ? SLOT_STATUS.CONFIRMED : SLOT_STATUS.AVAILABLE;
    const reviewNote = notes || "";

    try {
        await session.withTransaction(async () => {
            const booking = await Booking.findById(bookingId).session(session);

            if (!booking) {
                throw new ApiError(404, "Booking not found");
            }

            if (booking.status !== BOOKING_STATUS.PENDING) {
                throw new ApiError(409, "Only pending bookings can be reviewed");
            }

            const updatedSlot = await Slot.findOneAndUpdate(
                {
                    _id: booking.slot,
                    status: SLOT_STATUS.PENDING,
                },
                {
                    $set: {
                        status: nextSlotStatus,
                    },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!updatedSlot) {
                throw new ApiError(409, "Booking slot is no longer in a reviewable state");
            }

            booking.statusHistory.push({
                from: booking.status,
                to: nextBookingStatus,
                actor: adminId,
                note: reviewNote,
            });
            booking.status = nextBookingStatus;
            booking.reviewedBy = adminId;
            booking.reviewedAt = new Date();
            await booking.save({ session });
        });
    } finally {
        await session.endSession();
    }

    const populatedBooking = await populateBookingQuery(Booking.findById(bookingId));

    dispatchBookingStatusEmail({
        booking: {
            ...populatedBooking.toObject(),
            notes: reviewNote,
        },
        user: populatedBooking.user,
        slot: populatedBooking.slot,
    });

    return populatedBooking;
};
