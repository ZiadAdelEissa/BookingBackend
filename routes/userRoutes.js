import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addFamilyMember,
  getUserPackages,
  getUserBookings
} from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// User Profile Management
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Family Management
router.post('/family', addFamilyMember);

// Package Management
router.get('/packages', getUserPackages);

// Booking History
router.get('/bookings', getUserBookings);

export default router;