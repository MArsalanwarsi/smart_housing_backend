import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident ID is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    photo_url: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'In-Progress', 'Resolved'],
      default: 'Pending'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
