import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema(
  {
    option_text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Poll question is required'],
      trim: true
    },
    options: {
      type: [pollOptionSchema],
      validate: [
        function (val) {
          return val.length >= 2;
        },
        'A poll must have at least 2 options'
      ]
    },
    voted_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active'
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expires_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
