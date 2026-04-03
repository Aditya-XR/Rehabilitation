import { BOOKING_STATUS } from "../constants/index.js";
import {
    addError,
    isValidMongoId,
    normalizeTrimmedString,
    validatePaginationQuery,
} from "./common.validation.js";

export const validateBookingRequestBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "slotId");
    normalizeTrimmedString(body, "notes");

    if (!body.slotId) {
        addError(errors, "slotId", "slotId is required");
    } else if (!isValidMongoId(body.slotId)) {
        addError(errors, "slotId", "slotId must be a valid id");
    }

    return errors;
};

export const validateUserBookingsQuery = (query) => {
    const errors = [];
    validatePaginationQuery(query, errors);

    if (query.status && !Object.values(BOOKING_STATUS).includes(query.status)) {
        addError(errors, "status", "Status must be a valid booking status");
    }

    return errors;
};

export const validateAdminBookingsQuery = (query) => validateUserBookingsQuery(query);

export const validateAdminReviewBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "action");
    normalizeTrimmedString(body, "notes");

    if (!body.action) {
        addError(errors, "action", "Action is required");
    } else if (!["approve", "reject"].includes(body.action)) {
        addError(errors, "action", "Action must be approve or reject");
    }

    return errors;
};
