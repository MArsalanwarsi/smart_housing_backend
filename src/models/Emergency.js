import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Emergency title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Emergency description is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Fire', 'Medical', 'Security', 'Maintenance', 'Other'],
      default: 'Other'
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active'
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    contact_number: {
      type: String,
      trim: true,
      default: ''
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

const Emergency = mongoose.model('Emergency', emergencySchema);

export default Emergency;
