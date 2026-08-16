import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    timing: {
      type: String,
      trim: true,
      default: ''
    },
    capacity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Closed'],
      default: 'Active'
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Facility = mongoose.model('Facility', facilitySchema);

export default Facility;
