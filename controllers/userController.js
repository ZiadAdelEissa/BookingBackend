import User from "../models/User.js";
import Booking from "../models/Booking.js";
import UserPackage from "../models/UserPackage.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    .select("-password -__v")
    .populate("familyMembers", "name email");    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      req.body,
      { new: true, select: "-password -__v" }
    );
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

export const addFamilyMember = async (req, res) => {
  try {
    const { email } = req.body;
    const familyMember = await User.findOne({ email });

    if (!familyMember) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(req.session.user._id, {
      $addToSet: { familyMembers: familyMember._id },
    });

    res.json({ message: "Family member added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding family member", error: error.message });
  }
};

export const getUserPackages = async (req, res) => {
  try {
    const packages = await UserPackage.find({ userId: req.session.user._id , isActive:true,remainingWashes:{$gt:0}})  
      .populate("packageId")
      .populate("sharedWith", "name email");
    res.json(packages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching packages", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.session.user._id })
      .populate("branchId", "name location phone")
      .populate("serviceId", "name price")
      .populate("userPackageId");
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};
