import mongoose from 'mongoose';

const userPackageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  // packageName: { type: String, ref:"package", required: true },
  remainingWashes: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('UserPackage', userPackageSchema);