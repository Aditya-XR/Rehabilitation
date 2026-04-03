import { CONTENT_TYPES } from "../constants/index.js";
import {
    addError,
    isValidEmail,
    validatePaginationQuery,
} from "./common.validation.js";

const validateContactInfo = (contactInfo, errors) => {
    if (!contactInfo || typeof contactInfo !== "object") {
        return;
    }

    if (contactInfo.email && !isValidEmail(contactInfo.email)) {
        addError(errors, "contactInfo.email", "Contact email must be valid");
    }
};

export const validatePublicContentQuery = (query) => {
    const errors = [];
    validatePaginationQuery(query, errors);

    if (query.type && !Object.values(CONTENT_TYPES).includes(query.type)) {
        addError(errors, "type", "type must be a valid content type");
    }

    return errors;
};

export const validateCreateContentBody = (body) => {
    const errors = [];

    if (!body.key || typeof body.key !== "string" || !body.key.trim()) {
        addError(errors, "key", "key is required");
    }

    if (body.type && !Object.values(CONTENT_TYPES).includes(body.type)) {
        addError(errors, "type", "type must be a valid content type");
    }

    validateContactInfo(body.contactInfo, errors);

    return errors;
};

export const validateUpdateContentBody = (body, req) => {
    const errors = [];
    const hasFiles = Boolean(req.files?.images?.length);

    if (!Object.keys(body || {}).length && !hasFiles) {
        addError(errors, "body", "At least one content field must be provided");
    }

    if (body.type && !Object.values(CONTENT_TYPES).includes(body.type)) {
        addError(errors, "type", "type must be a valid content type");
    }

    if (
        body.replaceImages !== undefined &&
        ![true, false, "true", "false"].includes(body.replaceImages)
    ) {
        addError(errors, "replaceImages", "replaceImages must be true or false");
    }

    validateContactInfo(body.contactInfo, errors);

    return errors;
};
