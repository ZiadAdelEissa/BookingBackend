import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ["booking", "package", "system"], default: "booking" }
});
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notifications: [notificationSchema],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  role: {
    type: String,
    enum: ["customer", "branch-admin", "super-admin"],
    default: 'customer'
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, // Only for branch admins
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
