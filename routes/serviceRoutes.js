import express from "express";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { isAuthenticated, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllServices);

// Admin routes
router.post("/", isAuthenticated, isSuperAdmin, createService);
router.put("/:id", isAuthenticated, isSuperAdmin, updateService);
router.delete("/:id", isAuthenticated, isSuperAdmin, deleteService);

export default router;