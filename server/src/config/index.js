const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/taskflow",
    jwtSecret: process.env.JWT_SECRET || "fallback_dev_secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

async function connectDB() {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`DB connection failed: ${err.message}`);
        process.exit(1);
    }
}

module.exports = { config, connectDB };
