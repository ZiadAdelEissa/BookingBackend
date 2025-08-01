import Booking from "../models/Booking.js";
import Branch from "../models/Branch.js";
import UserPackage from "../models/UserPackage.js";
import User from "../models/User.js";

export const getAllBookings = async (req, res) => {
  try {
    const { branchId, status } = req.query;
    let filter = {};

    if (branchId) filter.branchId = branchId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("userId")
      .populate("branchId")
      .populate("serviceId")
      .populate("userPackageId");
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    booking.completedAt = new Date();

    if (booking.status === "completed") {
      // If package was used, decrement remaining washes
      if (booking.userPackageId) {
        const userPackage = await UserPackage.findById(booking.userPackageId);
        if (userPackage.remainingWashes > 0) {
          userPackage.remainingWashes -= 1;
          userPackage.remainingWashes = userPackage.remainingWashes; // Decrement remaining washes by 1;
          await userPackage.save();
        }
      }
      if (status === "completed" && booking.userPackageId) {
        const updatedPackage = await UserPackage.findById(
          booking.userPackageId
        );
        updatedPackage.remainingWashes = updatedPackage.remainingWashes;
        await updatedPackage.save();
      }
    }

    if (adminNotes) booking.adminNotes = adminNotes;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const activeUsers = await User.countDocuments({ role: "customer" });
    const branches = await Branch.countDocuments({ isActive: true });

    res.json({
      totalBookings,
      completedBookings,
      activeUsers,
      branches,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};
export const createBranch = async (req, res) => {
  try {
    const { name, location, operatingHours, closeingHours, phone } = req.body;
    const branch = new Branch({
      name,
      location,
      operatingHours,
      closeingHours,
      phone,
    });
    await branch.save();
    res.status(201).json({ message: "Branch created successfully", branch });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating branch", error: error.message });
  }
};

export const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true });
    res.json(branches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching branches", error: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const branch = await Branch.findByIdAndUpdate(id, updates, { new: true });
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json({ message: "Branch updated successfully", branch });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating branch", error: error.message });
  }
};
export const getBranchBookings = async (req, res) => {
  try {
    const branchId = req.session.user.branch;
    const { status } = req.query;

    const filter = { branchId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("userId", "name email phone")
      .populate("branchId", "name location")
      .populate("serviceId", "name price")
      .populate("userPackageId", "remainingWashes");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch branch bookings",
      error: error.message,
    });
  }
};
// Update booking status (only for admin's branch)
export const updateBranchBookingStatus = async (req, res) => {
  try {
    const admin = req.session.user;
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (admin.role !== "super-admin" || admin.role !== "branch-admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const booking = await Booking.findOne({
      _id: id,
      branchId: admin.branch,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found in your branch" });
    }

    booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};

export const updateBranchBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.session.user.branch;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, branchId },
      req.body,
      { new: true }
    ).populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found in your branch",
      });
    }

    res.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
};
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndDelete({
      _id: id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found in your branch",
      });
    }

    res.json({
      message: "Booking deleted successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};
// Get branch stats (only for the admin's branch)
export const getBranchStats = async (req, res) => {
  try {
    const admin = req.session.user;

    if (admin.role !== "branch-admin" || admin.role == "super-admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalBookings = await Booking.countDocuments({
      branchId: admin.branch,
    });
    const completedBookings = await Booking.countDocuments({
      branchId: admin.branch,
      status: "completed",
    });

    res.json({
      totalBookings,
      completedBookings,
      branch: admin.branch,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};
export const getAllUserPackages = async (req, res) => {
  try {
    const userPackages = await UserPackage.find()
      .populate("userId", "name email")
      .populate("packageId")
      .populate("sharedWith", "name email");

    res.json(userPackages);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user packages",
      error: error.message,
    });
  }
};
export const deleteUserPackage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPackage = await UserPackage.findByIdAndDelete({
      _id: id,
    });
    
    if (!deletedPackage) {
      return res.status(404).json({ message: "User package not found" });
    }

    res.json({ 
      message: "User package deleted successfully",
      package: deletedPackage
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user package",
      error: error.message
    });
  }
};