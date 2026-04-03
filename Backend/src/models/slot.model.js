import mongoose from "mongoose";
import { SLOT_STATUS } from "../constants/index.js";
import { combineDateAndTime, isValidTimeString } from "../utils/dateTime.js";

const slotSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, "Slot date is required"],
        },
        startTime: {
            type: String,
            required: [true, "Slot start time is required"],
            trim: true,
        },
        endTime: {
            type: String,
            required: [true, "Slot end time is required"],
            trim: true,
        },
        startsAt: {
            type: Date,
            required: true,
            index: true,
        },
        endsAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(SLOT_STATUS),
            default: SLOT_STATUS.AVAILABLE,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

slotSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true });
slotSchema.index({ status: 1, startsAt: 1 });

slotSchema.pre("validate", function (next) {
    try {
        if (!this.date || !this.startTime || !this.endTime) {
            next();
            return;
        }

        if (!isValidTimeString(this.startTime) || !isValidTimeString(this.endTime)) {
            next(new Error("Time must be in HH:mm format"));
            return;
        }

        const normalizedDate = new Date(this.date);
        normalizedDate.setHours(0, 0, 0, 0);
        this.date = normalizedDate;
        this.startsAt = combineDateAndTime(normalizedDate, this.startTime);
        this.endsAt = combineDateAndTime(normalizedDate, this.endTime);

        if (this.endsAt <= this.startsAt) {
            next(new Error("End time must be after start time"));
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
