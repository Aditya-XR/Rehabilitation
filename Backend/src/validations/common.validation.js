import mongoose from "mongoose";
import { PAGINATION } from "../constants.js";
import { isValidTimeString } from "../utils/dateTime.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const addError = (errors, field, message) => {
    errors.push({ field, message });
};

export const normalizeTrimmedString = (object, key) => {
    if (typeof object?.[key] === "string") {
        object[key] = object[key].trim();
    }
};

export const normalizeEmail = (object, key) => {
    normalizeTrimmedString(object, key);

    if (typeof object?.[key] === "string") {
        object[key] = object[key].toLowerCase();
    }
};

export const isValidEmail = (value) => EMAIL_PATTERN.test(value || "");
export const isStrongPassword = (value) => PASSWORD_PATTERN.test(value || "");
export const isValidDateValue = (value) => !Number.isNaN(new Date(value).getTime());
export const isValidMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

export const validatePaginationQuery = (query, errors) => {
    if (query.page !== undefined && (!Number.isInteger(Number(query.page)) || Number(query.page) < 1)) {
        addError(errors, "page", "Page must be a positive integer");
    }

    if (
        query.limit !== undefined &&
        (!Number.isInteger(Number(query.limit)) ||
            Number(query.limit) < 1 ||
            Number(query.limit) > PAGINATION.MAX_LIMIT)
    ) {
        addError(errors, "limit", `Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`);
    }
};

export const validateDateRangeQuery = (query, errors) => {
    if (query.dateFrom !== undefined && !isValidDateValue(query.dateFrom)) {
        addError(errors, "dateFrom", "dateFrom must be a valid date");
    }

    if (query.dateTo !== undefined && !isValidDateValue(query.dateTo)) {
        addError(errors, "dateTo", "dateTo must be a valid date");
    }
};

export const validateObjectIdParam = (fieldName = "id") => (params) => {
    const errors = [];

    if (!isValidMongoId(params[fieldName])) {
        addError(errors, fieldName, `${fieldName} must be a valid id`);
    }

    return errors;
};

export const validateTimeString = (value) => isValidTimeString(value);
