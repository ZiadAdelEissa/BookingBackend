import express from 'express';
import { 
  createBooking, 
  completeBooking, 
  getCustomerBookings ,
  getBranches,
  getServices
} from '../controllers/bookingController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', isAuthenticated, createBooking);
router.patch('/:id/complete', isAuthenticated, completeBooking);
router.get('/my-bookings', isAuthenticated, getCustomerBookings);
router.get('/branches', isAuthenticated, getBranches);
router.get('/services', isAuthenticated, getServices);

export default router;