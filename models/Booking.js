import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: function() { return this.status !== 'blocked'; }
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service',
    required: function() { return this.status !== 'blocked'; }
  },
  userPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPackage' },
  bookingDate: { type: Date, required: true },
  bookingTime: { type: String, required: true ,match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/},
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'blocked'], 
    default: 'pending' 
  },
  completedAt: { type: Date },
  adminNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  systemReserved: { type: Boolean, default: false }
});

export default mongoose.model('Booking', bookingSchema);