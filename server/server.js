
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ewasteRoutes = require("./routes/ewasteRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const batchRoutes = require("./routes/batchRoutes");
const recyclerRoutes = require("./routes/recyclerRoutes");
const passportRoutes = require("./routes/passportRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GreenCycle API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ewaste", ewasteRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/recycler", recyclerRoutes);
app.use("/api/passport", passportRoutes);

// Error handling (keep these after all routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`GreenCycle server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start GreenCycle server:", error.message);
    process.exit(1);
  }
}

startServer();
