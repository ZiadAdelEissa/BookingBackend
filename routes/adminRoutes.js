import express from "express";
import {
  getAllBookings,
  updateBookingStatus,
  getSystemStats,
  createBranch,
  getAllBranches,
  updateBranch,
  getBranchStats,
  deleteBooking,
  updateBranchBookingStatus,
  getAllUserPackages,
  deleteUserPackage
} from "../controllers/adminController.js";
import {
  isAuthenticated,
  isBranchAdmin,
  isSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Booking management
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/:status", isAuthenticated, updateBookingStatus);
router.patch(
  "/bookings/:id/branch",
  isAuthenticated,
  updateBranchBookingStatus
);
router.delete("/bookings/:id", isAuthenticated, deleteBooking);

// Branch management
router.get("/branches", isAuthenticated, isSuperAdmin, getAllBranches);
router.get("/allbranches", isAuthenticated, getAllBranches);
router.post("/branches", isAuthenticated, isSuperAdmin, createBranch);
router.put("/branches/:id", isAuthenticated, isSuperAdmin, updateBranch);

// Stats
router.get("/stats", isAuthenticated, isBranchAdmin, getSystemStats);
router.get("/branches/:id/:stats", getBranchStats);
// User Packages Management
router.get("/user-packages", isAuthenticated, isSuperAdmin, getAllUserPackages);
router.delete("/user-packages/:id", isAuthenticated, isSuperAdmin, deleteUserPackage);

// Notifications
//
export default router;
