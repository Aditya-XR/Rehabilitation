import nodemailer from "nodemailer";
import { env } from "./env.js";

export const isMailConfigured = Boolean(
    env.mail.host &&
        env.mail.port &&
        env.mail.user &&
        env.mail.pass &&
        env.mail.from
);

let transporter = null;

if (isMailConfigured) {
    transporter = nodemailer.createTransport({
        host: env.mail.host,
        port: env.mail.port,
        secure: env.mail.secure,
        auth: {
            user: env.mail.user,
            pass: env.mail.pass,
        },
    });
}

export { transporter };
