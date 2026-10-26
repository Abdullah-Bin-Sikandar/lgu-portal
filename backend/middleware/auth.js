const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Protect routes - verify JWT and load user
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized. Token invalid or expired.' });
    }

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ success: false, message: 'Admin account not found or inactive.' });
      }
      req.user = admin;
      req.user.role = 'admin';
    } else {
      const student = await Student.findById(decoded.id);
      if (!student) {
        return res.status(401).json({ success: false, message: 'Student account not found.' });
      }
      if (student.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: `Account access denied. Status: ${student.status}.`,
          status: student.status,
        });
      }
      req.user = student;
      req.user.role = 'student';
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
};

// Student only middleware
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
};

module.exports = { protect, adminOnly, studentOnly };
