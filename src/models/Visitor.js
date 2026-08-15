import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    visitor_name: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    vehicle_number: {
      type: String,
      default: '',
      trim: true
    },
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required']
    },
    gate_pass_code: {
      type: String,
      default: null
    },
    entry_timestamp: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['Pre-Approved', 'Entered', 'Exited'],
      default: 'Pre-Approved'
    }
  },
  {
    timestamps: true
  }
);

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
