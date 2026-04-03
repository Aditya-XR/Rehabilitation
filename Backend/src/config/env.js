import dotenv from "dotenv";

dotenv.config({ quiet: true });

const parseOrigins = (value) => {
    if (!value) {
        return [];
    }

    if (value.trim() === "*") {
        return ["*"];
    }

    return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
};

const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined) {
        return defaultValue;
    }

    return value === "true" || value === true;
};

const requiredEnv = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

const isProduction = process.env.NODE_ENV === "production";

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction,
    port: Number(process.env.PORT) || 6000,
    dbName: process.env.DB_NAME || "rehabilitation_db",
    mongoUri: process.env.MONGODB_URI,
    corsOrigins: parseOrigins(process.env.CORS_ORIGIN || process.env.CORS_ORIGINS),
    auth: {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1h",
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    },
    cookies: {
        domain: process.env.COOKIE_DOMAIN || undefined,
        secure: parseBoolean(process.env.COOKIE_SECURE, isProduction),
        sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax"),
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },
    mail: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: parseBoolean(process.env.SMTP_SECURE, false),
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.MAIL_FROM || "",
    },
};
