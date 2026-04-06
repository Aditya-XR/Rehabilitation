import mongoose from "mongoose";
import { BOOKING_STATUS } from "../constants.js";

const statusHistorySchema = new mongoose.Schema(
    {
        from: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            default: undefined,
        },
        to: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            required: true,
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Slot",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            default: BOOKING_STATUS.PENDING,
            index: true,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ slot: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
