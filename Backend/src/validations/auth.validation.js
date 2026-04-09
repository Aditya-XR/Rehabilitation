import {
    addError,
    isStrongPassword,
    isValidEmail,
    normalizeEmail,
    normalizeTrimmedString,
} from "./common.validation.js";

export const validateSignupBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "name");
    normalizeEmail(body, "email");
    normalizeTrimmedString(body, "password");

    if (!body.name) {
        addError(errors, "name", "Name is required");
    }

    if (!body.email) {
        addError(errors, "email", "Email is required");
    } else if (!isValidEmail(body.email)) {
        addError(errors, "email", "Email must be valid");
    }

    if (!body.password) {
        addError(errors, "password", "Password is required");
    } else if (!isStrongPassword(body.password)) {
        addError(
            errors,
            "password",
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
    }

    return errors;
};

export const validateLoginBody = (body) => {
    const errors = [];

    normalizeEmail(body, "email");
    normalizeTrimmedString(body, "password");

    if (!body.email) {
        addError(errors, "email", "Email is required");
    } else if (!isValidEmail(body.email)) {
        addError(errors, "email", "Email must be valid");
    }

    if (!body.password) {
        addError(errors, "password", "Password is required");
    }

    return errors;
};

export const validateGoogleBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "idToken");

    if (!body.idToken) {
        addError(errors, "idToken", "Google ID token is required");
    }

    return errors;
};

export const validateProfileBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "name");

    if (body.name !== undefined && !body.name) {
        addError(errors, "name", "Name cannot be empty");
    }

    return errors;
};

export const validateVerifyEmailBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "token");

    if (!body.token) {
        addError(errors, "token", "Verification token is required");
    }

    return errors;
};

export const validateForgotPasswordBody = (body) => {
    const errors = [];

    normalizeEmail(body, "email");

    if (!body.email) {
        addError(errors, "email", "Email is required");
    } else if (!isValidEmail(body.email)) {
        addError(errors, "email", "Email must be valid");
    }

    return errors;
};

export const validateResetPasswordParams = (params) => {
    const errors = [];

    if (!params.token || !String(params.token).trim()) {
        addError(errors, "token", "Reset token is required");
    }

    return errors;
};

export const validateResetPasswordBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "newPassword");

    if (!body.newPassword) {
        addError(errors, "newPassword", "New password is required");
    } else if (!isStrongPassword(body.newPassword)) {
        addError(
            errors,
            "newPassword",
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
    }

    return errors;
};

export const validateChangePasswordBody = (body) => {
    const errors = [];

    normalizeTrimmedString(body, "oldPassword");
    normalizeTrimmedString(body, "newPassword");

    if (!body.oldPassword) {
        addError(errors, "oldPassword", "Current password is required");
    }

    if (!body.newPassword) {
        addError(errors, "newPassword", "New password is required");
    } else if (!isStrongPassword(body.newPassword)) {
        addError(
            errors,
            "newPassword",
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
    }

    return errors;
};
