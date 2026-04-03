import { BOOKING_STATUS } from "../constants/index.js";
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
