import Booking from '../models/Booking.js';
import UserPackage from '../models/UserPackage.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import Service from '../models/Service.js';
import moment from 'moment';
export const createBooking = async (req, res) => {
  try {
    const { branchId, bookingDate, bookingTime } = req.body;
    const userId = req.session.user._id;

    // Convert to moment object
    const bookingMoment = moment(`${bookingDate} ${bookingTime}`, 'YYYY-MM-DD HH:mm');
    
    // Get hour boundaries
    const hourStart = bookingMoment.clone().startOf('hour');
    const hourEnd = hourStart.clone().add(1, 'hour');

    // 1. Check existing bookings in this hour
    const bookingsInHour = await Booking.countDocuments({
      branchId,
      bookingDate,
      bookingTime: {
        $gte: hourStart.format('HH:mm'),
        $lt: hourEnd.format('HH:mm')
      },
      status: { $ne: 'completed' }
    });

    if (bookingsInHour >= 3) {
      return res.status(400).json({
        message: 'This hour has reached maximum capacity (3 bookings)'
      });
    }

    // 2. Check blocked hours from previous bookings
    const allBookings = await Booking.find({
      branchId,
      bookingDate,
      status: { $ne: 'completed' }
    });

    // Find all hours with 3+ bookings
    const hourCounts = {};
    allBookings.forEach(booking => {
      const hour = moment(booking.bookingTime, 'HH:mm').startOf('hour').format('H');
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Check if current time falls in any blocked period
    const currentHour = bookingMoment.hour();
    const isBlocked = Object.entries(hourCounts).some(([hour, count]) => {
      const blockedHour = parseInt(hour);
      return count >= 3 && 
        (currentHour === blockedHour || currentHour === blockedHour + 1);
    });

    if (isBlocked) {
      return res.status(400).json({
        message: 'This time slot is unavailable due to recent bookings'
      });
    }

    // Create booking
    const booking = new Booking({
      userId,
      branchId,
      ...req.body,
      bookingTime: bookingMoment.format('HH:mm'),
      status: 'pending'
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });

  } catch (error) {
    res.status(500).json({ message: 'Booking creation failed', error: error.message });
  }
};
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('userPackageId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // If package was used, decrement remaining washes
    if (booking.userPackageId) {
      const userPackage = await UserPackage.findById(booking.userPackageId);
      if (userPackage.remainingWashes > 0) {
        userPackage.remainingWashes -= 1;
        await userPackage.save();
        
        // Notify user
        const user = await User.findById(booking.userId);
        user.notifications.push({
          message: `Your wash is complete. Remaining washes in package: ${userPackage.remainingWashes}`,
          date: new Date()
        });
        await user.save();
      }
    }

    res.json({ message: 'Booking marked as completed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error completing booking', error: error.message });
  }
};
export const getCustomerBookings = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const bookings = await Booking.find({ userId })
      .populate('branchId')
      .populate('serviceId')
      .populate('userPackageId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
}
export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
}