import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const corsOptions = {
    origin(origin, callback) {
        if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes("*")) {
            callback(null, true);
            return;
        }

        if (env.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new ApiError(403, "Origin not allowed by CORS"));
    },
    credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
