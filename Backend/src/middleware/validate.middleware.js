import { ApiError } from "../utils/ApiError.js";

export const validateRequest = ({ body, params, query }) => (req, _res, next) => {
    const errors = [];

    if (body) {
        errors.push(...body(req.body, req));
    }

    if (params) {
        errors.push(...params(req.params, req));
    }

    if (query) {
        errors.push(...query(req.query, req));
    }

    if (errors.length) {
        next(new ApiError(400, "Validation failed", errors));
        return;
    }

    next();
};
