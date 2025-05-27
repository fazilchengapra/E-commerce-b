require("dotenv").config();
const mongoose = require("mongoose");

const connectDb = async () => {
  const mongoURI = process.env.DB_URL;

  try {
    // Connect to MongoDB Atlas using Mongoose
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");

    // Handle connection events using promises
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1); // Exit the process if connection fails
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      process.exit(1); // Exit the process if disconnected
    });

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process if the initial connection fails
  }
};

// Export mongoose so that other files can use it
module.exports = connectDb;