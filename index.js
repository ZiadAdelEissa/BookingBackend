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
    'http://localhost:5173', // Keep your local dev environment
    'https://quickitt.netlify.app', // Add your Netlify domain
    // Add any other domains you need
  ],
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
      secure: true, // Allows HTTP (localhost)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax", // Same-origin requests
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb+srv://ziadadel6060:Honda999@cluster0.ysigfwu.mongodb.net/italy?retryWrites=true&w=majority",
      collectionName: "sessions",
    }),
    
    /* DEPLOYMENT SESSION CONFIG: Uncomment below for production deployment on Render:
    
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS required in production
      httpOnly: true, // Secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-origin cookies
      path: '/', // Available for all paths
    },
    
    */
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

// Root route for deployment testing
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
