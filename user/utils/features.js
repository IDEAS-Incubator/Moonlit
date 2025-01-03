import mongoose from "mongoose";

export const connectDB = async (MongoDB_URL) => {
    try {
        // Establish connection to MongoDB
        await mongoose.connect(MongoDB_URL, {
            dbName: 'Moonlit',
            useNewUrlParser: true, // Ensure use of the new MongoDB URL parser
            useUnifiedTopology: true, // Enable the unified topology for server discovery and monitoring
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
        });
        console.log("Connected to Database");
    } catch (error) {
        // Log detailed error message
        console.error("Error connecting to database:", error.message);
    }

    // Optional: Handle other database connection events
    mongoose.connection.on("connected", () => {
        console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
        console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Mongoose disconnected from DB");
    });
};
