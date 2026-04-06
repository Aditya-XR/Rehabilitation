import mongoose from "mongoose";
import { CONTENT_TYPES } from "../constants.js";

const mediaSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true },
        resourceType: { type: String, trim: true, default: "image" },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        format: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const contactInfoSchema = new mongoose.Schema(
    {
        email: { type: String, trim: true, lowercase: true, default: "" },
        phone: { type: String, trim: true, default: "" },
        address: { type: String, trim: true, default: "" },
        website: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const contentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: [true, "Content key is required"],
            trim: true,
            unique: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(CONTENT_TYPES),
            default: CONTENT_TYPES.GENERIC,
            index: true,
        },
        title: {
            type: String,
            trim: true,
            default: "",
        },
        body: {
            type: String,
            trim: true,
            default: "",
        },
        images: {
            type: [mediaSchema],
            default: [],
        },
        contactInfo: {
            type: contactInfoSchema,
            default: () => ({}),
        },
        isPublished: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

contentSchema.index({ type: 1, isPublished: 1, updatedAt: -1 });

const Content = mongoose.model("Content", contentSchema);

export default Content;
