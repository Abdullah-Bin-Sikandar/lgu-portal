const express = require('express');
const router = express.Router();
const {
  getPublicEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getPublicEvents);
router.get('/:id', getEventById);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllEventsAdmin);
router.post('/', protect, adminOnly, createEvent);
router.put('/:id', protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;

