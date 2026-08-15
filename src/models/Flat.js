import mongoose from 'mongoose';

const flatSchema = new mongoose.Schema(
  {
    block_name: {
      type: String,
      required: [true, 'Block name is required'],
      trim: true
    },
    flat_number: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true
    },
    occupancy_type: {
      type: String,
      enum: ['Owner', 'Tenant'],
      required: [true, 'Occupancy type must be either Owner or Tenant']
    }
  },
  {
    timestamps: true
  }
);

const Flat = mongoose.model('Flat', flatSchema);

export default Flat;
