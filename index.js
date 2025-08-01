import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Load environment variables
dotenv.config();

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import branchAdminRoutes from "./routes/branchAdminRoutes.js";

// Middleware Imports
import {
  isAuthenticated,
  isBranchAdmin,
  isSuperAdmin,
} from "./middleware/authMiddleware.js";

const app = express();

// ======================================
// MIDDLEWARE SETUP
// ======================================
app.use(morgan("dev"));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb+srv://ziadadel6060:Honda999@cluster0.ysigfwu.mongodb.net/italy?retryWrites=true&w=majority",
      collectionName: "sessions",
    }),
  })
);

// ======================================
// DATABASE CONNECTION
// ======================================
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb+srv://ziadadel6060:Honda999@cluster0.ysigfwu.mongodb.net/italy?retryWrites=true&w=majority"
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
connectDB();

// ======================================
// ROUTE DEFINITIONS
// ======================================
// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes); // Only GET is public
app.use("/api/packages", packageRoutes); // Only GET is public

// Authenticated user routes
app.use("/api/users", isAuthenticated, userRoutes);
app.use("/api/bookings", isAuthenticated, bookingRoutes);

// Admin routes
app.use("/api/admin", isAuthenticated,isSuperAdmin,  adminRoutes);
app.use("/api/branch-admin", isAuthenticated, isSuperAdmin, branchAdminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// ======================================
// ERROR HANDLING
// ======================================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

// ======================================
// SERVER STARTUP
// ======================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
