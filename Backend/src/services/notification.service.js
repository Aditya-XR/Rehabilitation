import { BOOKING_STATUS } from "../constants.js";
import { env } from "../config/env.js";
import { formatDateTime } from "../utils/dateTime.js";
import { sendMail } from "./email.service.js";

const getStatusLabel = (status) =>
    status === BOOKING_STATUS.APPROVED ? "approved" : "rejected";

export const sendBookingStatusEmail = async ({ booking, user, slot }) => {
    if (!user?.email || !slot?.startsAt) {
        return;
    }

    const statusLabel = getStatusLabel(booking.status);
    const slotDateTime = formatDateTime(new Date(slot.startsAt));
    const subject = `Your rehabilitation booking was ${statusLabel}`;
    const noteText = booking.notes ? `<p>Note: ${booking.notes}</p>` : "";
    const html = `
        <p>Hello ${user.name || "there"},</p>
        <p>Your rehabilitation booking for <strong>${slotDateTime}</strong> was <strong>${statusLabel}</strong>.</p>
        ${noteText}
        <p>Thank you.</p>
    `;

    const text = `Hello ${user.name || "there"}, your rehabilitation booking for ${slotDateTime} was ${statusLabel}.${booking.notes ? ` Note: ${booking.notes}` : ""}`;

    await sendMail({
        to: user.email,
        subject,
        html,
        text,
    });
};

export const dispatchBookingStatusEmail = (payload) => {
    Promise.resolve(sendBookingStatusEmail(payload)).catch((error) => {
        console.error("Failed to send booking notification email", error);
    });
};

export const sendVerificationEmail = async (user, rawToken) => {
    if (!user?.email || !rawToken || !env.frontendUrl) {
        return;
    }

    const verificationLink = `${env.frontendUrl}/verify-email?token=${rawToken}`;
    const subject = "Verify your email address";
    const html = `
        <p>Hello ${user.name || "there"},</p>
        <p>Welcome to Rehabilitation Backend. Please verify your email address to activate your account.</p>
        <p><a href="${verificationLink}">Verify Email</a></p>
        <p>If the button does not work, use this link:</p>
        <p>${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
    `;
    const text = `Hello ${user.name || "there"}, verify your email by visiting ${verificationLink}. This link expires in 24 hours.`;

    await sendMail({
        to: user.email,
        subject,
        html,
        text,
    });
};

export const dispatchVerificationEmail = (user, rawToken) => {
    Promise.resolve(sendVerificationEmail(user, rawToken)).catch((error) => {
        console.error("Failed to send verification email", error);
    });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
    if (!user?.email || !rawToken || !env.frontendUrl) {
        return;
    }

    const resetLink = `${env.frontendUrl}/reset-password/${rawToken}`;
    const subject = "Reset your password";
    const html = `
        <p>Hello ${user.name || "there"},</p>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If the button does not work, use this link:</p>
        <p>${resetLink}</p>
        <p>This link expires in 15 minutes.</p>
    `;
    const text = `Hello ${user.name || "there"}, reset your password by visiting ${resetLink}. This link expires in 15 minutes.`;

    await sendMail({
        to: user.email,
        subject,
        html,
        text,
    });
};

export const dispatchPasswordResetEmail = (user, rawToken) => {
    Promise.resolve(sendPasswordResetEmail(user, rawToken)).catch((error) => {
        console.error("Failed to send password reset email", error);
    });
};
