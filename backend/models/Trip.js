const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    name: {
      type: String,
      required: [true, 'Please provide destination name']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    }
  },
  alertType: {
    type: String,
    enum: ['distance', 'route', 'eta'],
    required: [true, 'Please select alert type']
  },
  alertConfig: {
    distanceKm: {
      type: Number,
      default: 5
    },
    minutesBefore: {
      type: Number,
      default: 10
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  alertTriggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);