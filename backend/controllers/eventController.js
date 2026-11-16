const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');

// @desc    Get all public events
// @route   GET /api/events
// @access  Public
const getPublicEvents = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const events = await Event.find(filter).sort({ date: -1 });
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for admin
// @route   GET /api/events/all
// @access  Private/Admin
const getAllEventsAdmin = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by id
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, venue, image, status, registrationUrl, organizer, featured } = req.body;

    if (!title || !description || !date || !venue) {
      return res.status(400).json({ success: false, message: 'Title, description, date, and venue are required' });
    }

    const event = await Event.create({
      title,
      description,
      category: category || 'General',
      date,
      time: time || '',
      venue,
      image: image || '',
      status: status || 'upcoming',
      registrationUrl: registrationUrl || '',
      organizer: organizer || 'YPDC LGU Chapter',
      featured: Boolean(featured),
    });

    if (req.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'CREATE_EVENT',
        targetId: event._id,
        targetType: 'Event',
        details: `Created event: ${event.title}`,
        ipAddress: req.ip,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'UPDATE_EVENT',
        targetId: event._id,
        targetType: 'Event',
        details: `Updated event: ${event.title}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    if (req.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'DELETE_EVENT',
        targetId: event._id,
        targetType: 'Event',
        details: `Deleted event: ${event.title}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

