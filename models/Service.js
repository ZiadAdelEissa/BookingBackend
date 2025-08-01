import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('Service', serviceSchema);