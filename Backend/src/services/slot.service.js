import Slot from "../models/slot.model.js";
import Booking from "../models/booking.model.js";
import { SLOT_STATUS } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const buildStartsAtFilter = ({ dateFrom, dateTo, futureOnly = false }) => {
    const startsAt = {};

    if (futureOnly) {
        startsAt.$gt = new Date();
    }

    if (dateFrom) {
        startsAt.$gte = new Date(dateFrom);
    }

    if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        startsAt.$lte = endOfDay;
    }

    return startsAt;
};

export const getAvailableSlots = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const startsAtFilter = buildStartsAtFilter({ ...query, futureOnly: true });
    const filter = {
        status: SLOT_STATUS.AVAILABLE,
        startsAt: startsAtFilter,
    };

    const [items, total] = await Promise.all([
        Slot.find(filter).sort({ startsAt: 1 }).skip(skip).limit(limit),
        Slot.countDocuments(filter),
    ]);

    return {
        items,
        pagination: buildPaginationMeta({ page, limit, total }),
    };
};

export const getAdminSlots = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    const startsAtFilter = buildStartsAtFilter(query);

    if (query.status) {
        filter.status = query.status;
    }

    if (Object.keys(startsAtFilter).length) {
        filter.startsAt = startsAtFilter;
    }

    const [items, total] = await Promise.all([
        Slot.find(filter).sort({ startsAt: 1 }).skip(skip).limit(limit).populate("createdBy", "name email"),
        Slot.countDocuments(filter),
    ]);

    return {
        items,
        pagination: buildPaginationMeta({ page, limit, total }),
    };
};

export const createSlot = async ({ adminId, payload }) => {
    const slot = await Slot.create({
        ...payload,
        status: payload.status || SLOT_STATUS.AVAILABLE,
        createdBy: adminId,
    });

    return slot;
};

export const updateSlot = async ({ slotId, payload }) => {
    const slot = await Slot.findById(slotId);

    if (!slot) {
        throw new ApiError(404, "Slot not found");
    }

    if ([SLOT_STATUS.PENDING, SLOT_STATUS.CONFIRMED].includes(slot.status)) {
        throw new ApiError(409, "Pending or confirmed slots cannot be updated");
    }

    Object.assign(slot, payload);
    await slot.save();

    return slot;
};

export const deleteSlot = async (slotId) => {
    const slot = await Slot.findById(slotId);

    if (!slot) {
        throw new ApiError(404, "Slot not found");
    }

    if ([SLOT_STATUS.PENDING, SLOT_STATUS.CONFIRMED].includes(slot.status)) {
        throw new ApiError(409, "Pending or confirmed slots cannot be deleted");
    }

    const existingBooking = await Booking.exists({ slot: slotId });

    if (existingBooking) {
        throw new ApiError(409, "Slots with booking history cannot be deleted");
    }

    await slot.deleteOne();
};
