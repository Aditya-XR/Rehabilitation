import { SLOT_STATUS } from "../constants.js";
import {
    addError,
    isValidDateValue,
    validateDateRangeQuery,
    validatePaginationQuery,
    validateTimeString,
} from "./common.validation.js";

const allowedAdminStatuses = [SLOT_STATUS.AVAILABLE, SLOT_STATUS.CANCELLED];

export const validateAvailableSlotsQuery = (query) => {
    const errors = [];
    validatePaginationQuery(query, errors);
    validateDateRangeQuery(query, errors);
    return errors;
};

export const validateAdminSlotsQuery = (query) => {
    const errors = [];
    validatePaginationQuery(query, errors);
    validateDateRangeQuery(query, errors);

    if (query.status && !Object.values(SLOT_STATUS).includes(query.status)) {
        addError(errors, "status", "Status must be a valid slot status");
    }

    return errors;
};

export const validateCreateSlotBody = (body) => {
    const errors = [];

    if (!body.date) {
        addError(errors, "date", "Date is required");
    } else if (!isValidDateValue(body.date)) {
        addError(errors, "date", "Date must be a valid date");
    }

    if (!body.startTime) {
        addError(errors, "startTime", "Start time is required");
    } else if (!validateTimeString(body.startTime)) {
        addError(errors, "startTime", "Start time must be in HH:mm format");
    }

    if (!body.endTime) {
        addError(errors, "endTime", "End time is required");
    } else if (!validateTimeString(body.endTime)) {
        addError(errors, "endTime", "End time must be in HH:mm format");
    }

    if (body.status && !allowedAdminStatuses.includes(body.status)) {
        addError(errors, "status", "New slots may only start as available or cancelled");
    }

    return errors;
};

export const validateUpdateSlotBody = (body) => {
    const errors = [];

    if (!Object.keys(body || {}).length) {
        addError(errors, "body", "At least one slot field must be provided");
    }

    if (body.date !== undefined && !isValidDateValue(body.date)) {
        addError(errors, "date", "Date must be a valid date");
    }

    if (body.startTime !== undefined && !validateTimeString(body.startTime)) {
        addError(errors, "startTime", "Start time must be in HH:mm format");
    }

    if (body.endTime !== undefined && !validateTimeString(body.endTime)) {
        addError(errors, "endTime", "End time must be in HH:mm format");
    }

    if (body.status !== undefined && !allowedAdminStatuses.includes(body.status)) {
        addError(errors, "status", "Slot status must be available or cancelled");
    }

    return errors;
};
