import express from 'express';
import { 
  getBranchBookings,
  updateBranchBooking
} from '../controllers/adminController.js';
import { isAuthenticated, isSuperAdmin,isBranchAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isBranchAdmin);

router.get('/branches/:id/bookings',isAuthenticated, isBranchAdmin, getBranchBookings);
router.patch('/branches/:id/bookings/:bookingId', isBranchAdmin,updateBranchBooking);

export default router;