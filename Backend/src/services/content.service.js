import Content from "../models/content.model.js";
import { ApiError } from "../utils/ApiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { uploadImages } from "./media.service.js";

const parseBoolean = (value, fallback) => {
    if (value === undefined) {
        return fallback;
    }

    if (typeof value === "boolean") {
        return value;
    }

    return value === "true";
};

const parseContactInfo = (value) => {
    if (!value) {
        return undefined;
    }

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            throw new ApiError(400, "contactInfo must be a valid JSON object");
        }
    }

    return value;
};

const normalizeContentPayload = (payload = {}) => ({
    ...(payload.key !== undefined ? { key: String(payload.key).trim() } : {}),
    ...(payload.type !== undefined ? { type: payload.type } : {}),
    ...(payload.title !== undefined ? { title: String(payload.title).trim() } : {}),
    ...(payload.body !== undefined ? { body: String(payload.body).trim() } : {}),
    ...(payload.contactInfo !== undefined ? { contactInfo: parseContactInfo(payload.contactInfo) } : {}),
    ...(payload.isPublished !== undefined
        ? { isPublished: parseBoolean(payload.isPublished, true) }
        : {}),
});

export const getPublicContent = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { isPublished: true };

    if (query.type) {
        filter.type = query.type;
    }

    const [items, total] = await Promise.all([
        Content.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
        Content.countDocuments(filter),
    ]);

    return {
        items,
        pagination: buildPaginationMeta({ page, limit, total }),
    };
};

export const getPublicContentByKey = async (key) => {
    const content = await Content.findOne({ key, isPublished: true });

    if (!content) {
        throw new ApiError(404, "Content not found");
    }

    return content;
};

export const getAdminContent = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.type) {
        filter.type = query.type;
    }

    if (query.isPublished !== undefined) {
        filter.isPublished = query.isPublished === "true";
    }

    const [items, total] = await Promise.all([
        Content.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
        Content.countDocuments(filter),
    ]);

    return {
        items,
        pagination: buildPaginationMeta({ page, limit, total }),
    };
};

export const createContent = async ({ payload, files }) => {
    const normalizedPayload = normalizeContentPayload(payload);
    const images = await uploadImages(files, "rehabilitation/content");

    return Content.create({
        ...normalizedPayload,
        images,
    });
};

export const updateContent = async ({ contentId, payload, files }) => {
    const content = await Content.findById(contentId);

    if (!content) {
        throw new ApiError(404, "Content not found");
    }

    const normalizedPayload = normalizeContentPayload(payload);
    const replaceImages = parseBoolean(payload.replaceImages, false);
    const uploadedImages = await uploadImages(files, "rehabilitation/content");

    Object.assign(content, normalizedPayload);

    if (replaceImages) {
        content.images = uploadedImages;
    } else if (uploadedImages.length) {
        content.images.push(...uploadedImages);
    }

    await content.save();
    return content;
};

export const deleteContent = async (contentId) => {
    const content = await Content.findById(contentId);

    if (!content) {
        throw new ApiError(404, "Content not found");
    }

    await content.deleteOne();
};
