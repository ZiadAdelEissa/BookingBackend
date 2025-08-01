/*
=============================================================================
                        DEPLOYMENT INSTRUCTIONS
=============================================================================

FOR RENDER DEPLOYMENT:
1. Push code to GitHub repository
2. Create new Web Service on Render
3. Connect GitHub repo, set Root Directory to "Backend"
4. Set Build Command: "npm install"
5. Set Start Command: "npm start"
6. Add Environment Variables in Render Dashboard:
   - NODE_ENV=production
   - SESSION_SECRET=asyote666
   - MONGODB_URI=mongodb+srv://ziadadel6060:Honda999@cluster0.ysigfwu.mongodb.net/italy?retryWrites=true&w=majority
   - FRONTEND_URL=https://your-deployed-frontend-url.com
   - PORT=5000

7. BEFORE DEPLOYMENT: Switch session cookie config below to production mode:
   - Uncomment the environment-based secure and sameSite settings
   - Comment out the current localhost settings

FOR LOCALHOST DEVELOPMENT:
- Use NODE_ENV=development in .env file
- Keep current session cookie settings (secure: false, sameSite: "lax")

=============================================================================
*/

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
    origin: [
      "http://localhost:5173",
      "http://localhost:5174", 
      "http://localhost:3000",
      process.env.FRONTEND_URL
    ].filter(Boolean), // Remove any undefined values
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
    saveUninitialized: true,
    name: 'carwash.sid', // Custom session name
        rolling: true, // Reset expiration on activity

    cookie: {
      // DEPLOYMENT CONFIG: For production deployment, use environment-based settings:
      secure: process.env.NODE_ENV === "production", 
      httpOnly:true,// HTTPS required in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-origin cookies in production
      path: '/', // Ensure cookie is available for all paths
            domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain

      // LOCALHOST CONFIG: Current settings for local development:
      // secure: false, // Allows HTTP (localhost)
      // httpOnly: false, // Allow client-side access for debugging (change to true for production)
      // sameSite: "lax", // Same-origin requests
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb+srv://ziadadel6060:Honda999@cluster0.ysigfwu.mongodb.net/italy?retryWrites=true&w=majority",
      collectionName: "sessions",
      touchAfter: 24 * 3600 ,// lazy session update
       stringify: false, // Store objects as-is
      autoRemove: 'native' // Let MongoDB handle expired session cleanup
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
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Car Wash Backend API", 
    status: "running",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      admin: "/api/admin",
      user: "/api/user"
    }
  });
});

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
