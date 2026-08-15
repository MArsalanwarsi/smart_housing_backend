import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required']
    },
    amount_due: {
      type: Number,
      required: [true, 'Amount due is required'],
      min: [0, 'Amount due cannot be negative']
    },
    due_date: {
      type: Date,
      required: [true, 'Due date is required']
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
