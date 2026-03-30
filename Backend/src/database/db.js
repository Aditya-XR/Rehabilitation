import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB connected!!  connection host: ${connectionInstance.connection.host} //db.js`);
    } catch (error) {
        console.log("Error connecting to the database -> ", error);
        console.log("Check your MongoDB Atlas URI, database user/password, IP access list, and cluster availability.");
        process.exit(1);
    }
}

export default connectDB;
