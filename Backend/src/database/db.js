import mongoose from "mongoose";
import { env } from "../config/env.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(env.mongoUri, {
            dbName: env.dbName,
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB connected!!  connection host: ${connectionInstance.connection.host} //db.js`);
    } catch (error) {
        console.log("Error connecting to the database -> ", error);
        console.log("Check your MongoDB Atlas URI, database user/password, IP access list, and cluster availability.");
        process.exit(1);
    }
};

export default connectDB;
