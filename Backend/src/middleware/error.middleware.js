import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler = (req, _res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let errors = err.errors || [];

    if (err.code === 11000) {
        statusCode = 409;
        const duplicateField = Object.keys(err.keyValue || {})[0];
        message = duplicateField
            ? `${duplicateField} already exists`
            : "Duplicate value found";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
        errors = Object.values(err.errors).map(({ path, message: fieldMessage }) => ({
            field: path,
            message: fieldMessage,
        }));
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        message = err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token";
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "Uploaded file is too large";
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(env.isProduction ? {} : { stack: err.stack }),
    });
};
