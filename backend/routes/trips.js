const express = require('express');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/trips
// @desc    Get all trips for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Make sure user owns trip
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/trips
// @desc    Create new trip
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { destination, alertType, alertConfig, notes } = req.body;

    // Validation
    if (!destination || !destination.name || !destination.coordinates) {
      return res.status(400).json({ message: 'Please provide destination details' });
    }

    if (!alertType || !['distance', 'route', 'eta'].includes(alertType)) {
      return res.status(400).json({ message: 'Please provide valid alert type' });
    }

    const trip = await Trip.create({
      user: req.user._id,
      destination,
      alertType,
      alertConfig: alertConfig || {},
      notes
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Make sure user owns trip
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { destination, alertType, alertConfig, notes, status } = req.body;

    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        destination: destination || trip.destination,
        alertType: alertType || trip.alertType,
        alertConfig: alertConfig || trip.alertConfig,
        notes: notes !== undefined ? notes : trip.notes,
        status: status || trip.status
      },
      { new: true, runValidators: true }
    );

    res.json(trip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/trips/:id/start
// @desc    Start trip tracking
// @access  Private
router.put('/:id/start', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trip.status = 'active';
    trip.startedAt = new Date();
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/trips/:id/complete
// @desc    Complete trip
// @access  Private
router.put('/:id/complete', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trip.status = 'completed';
    trip.completedAt = new Date();
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/trips/:id/alert
// @desc    Mark alert as triggered
// @access  Private
router.put('/:id/alert', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trip.alertTriggered = true;
    trip.triggeredAt = new Date();
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error('Alert trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Make sure user owns trip
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await trip.deleteOne();

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;