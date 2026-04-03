import connectDB from "./database/db.js";
import { env } from "./config/env.js";
import app from "./app.js";

connectDB()
    .then(() => {
        app.listen(env.port, () => {
            console.log(`Server is running on port ${env.port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    });

export default app;
