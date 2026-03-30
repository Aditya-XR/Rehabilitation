
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import helmet from "helmet"
import { ApiError } from "./utils/ApiError.js";


const app = express();
const PORT = process.env.PORT || 6000;
const corsOrigin = process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN;

app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));
app.use(cookieParser());


app.get("/api/v1/status", (req, res) => res.send("Server is running"));

app.use((err, req, res, next) => {
    console.error(err);

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
        message = err.name === "TokenExpiredError" ? "Access token has expired" : "Invalid access token";
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    });
    
export default app;
