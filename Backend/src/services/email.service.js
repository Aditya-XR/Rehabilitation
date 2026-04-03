import { transporter, isMailConfigured } from "../config/mail.js";
import { env } from "../config/env.js";

export const sendMail = async ({ to, subject, html, text }) => {
    if (!isMailConfigured || !transporter) {
        console.warn("Mail transport is not configured. Email skipped.");
        return { skipped: true };
    }

    return transporter.sendMail({
        from: `"Rehabilitation Booking" <${env.mail.from}>`,
        to,
        subject,
        html,
        text,
    });
};
