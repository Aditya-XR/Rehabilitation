import mongoose from "mongoose";
import { SLOT_STATUS } from "../constants.js";
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

// Rule violations use this.invalidate() so they surface as a Mongoose ValidationError,
// which the error handler returns as a 400 with field-level errors (a plain Error became a 500).
slotSchema.pre("validate", function () {
    if (!this.date || !this.startTime || !this.endTime) {
        return;
    }

    const invalidTimePaths = ["startTime", "endTime"].filter((path) => !isValidTimeString(this[path]));

    if (invalidTimePaths.length) {
        invalidTimePaths.forEach((path) => this.invalidate(path, "Time must be in HH:mm format", this[path]));
        return;
    }

    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
    this.startsAt = combineDateAndTime(normalizedDate, this.startTime);
    this.endsAt = combineDateAndTime(normalizedDate, this.endTime);

    if (this.endsAt <= this.startsAt) {
        this.invalidate("endTime", "End time must be after start time", this.endTime);
    }
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
