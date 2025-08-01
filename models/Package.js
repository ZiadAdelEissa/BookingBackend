import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  washCount: { type: Number, required: true },
  validityDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('Package', packageSchema);