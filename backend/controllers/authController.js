const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const academicData = require('../config/academicData');
const path = require('path');
const fs = require('fs');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
exports.registerStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      fullName, rollNumber, enrollmentYear, email, contactNumber,
      password, department, degreeProgram, currentSemester,
      academicSession, bio, linkedIn, github, portfolio, otherLinks,
    } = req.body;

    // Validate department and degree program against official data
    const dept = academicData.find((d) => d.name === department);
    if (!dept) {
      return res.status(400).json({ success: false, message: 'Invalid department selected.' });
    }
    if (!dept.programs.includes(degreeProgram)) {
      return res.status(400).json({ success: false, message: 'Invalid degree program for selected department.' });
    }

    // Check uniqueness
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRoll = rollNumber.toLowerCase().trim();

    const existingByEmail = await Student.findOne({ email: normalizedEmail });
    if (existingByEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }
    const existingByRoll = await Student.findOne({ rollNumber: normalizedRoll });
    if (existingByRoll) {
      return res.status(409).json({ success: false, message: 'An account with this roll number already exists.' });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : '';

    const student = await Student.create({
      fullName, rollNumber: normalizedRoll, enrollmentYear: parseInt(enrollmentYear),
      email: normalizedEmail, contactNumber: contactNumber || '',
      password, department, degreeProgram,
      currentSemester: currentSemester ? parseInt(currentSemester) : null,
      academicSession: academicSession || '',
      bio: bio || '', linkedIn: linkedIn || '', github: github || '',
      portfolio: portfolio || '',
      otherLinks: otherLinks ? JSON.parse(otherLinks) : [],
      profilePicture,
      status: 'pending',
    });

    await AuditLog.create({
      action: 'STUDENT_REGISTERED',
      performedBy: { id: student._id, name: student.fullName, role: 'student' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: 'New student registration submitted.',
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Your account is pending administrator approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student / Admin Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/roll number and password.' });
    }

    if (role === 'admin') {
      const admin = await Admin.findOne({ email: identifier.toLowerCase() }).select('+password');
      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      }
      if (!admin.isActive) {
        return res.status(403).json({ success: false, message: 'Admin account is inactive.' });
      }
      const token = generateToken(admin._id, 'admin');
      await AuditLog.create({
        action: 'LOGIN',
        performedBy: { id: admin._id, name: admin.name, role: 'admin' },
        details: 'Admin login.',
      });
      return res.json({
        success: true,
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' },
      });
    }

    // Student login - ONLY by email and password
    if (!identifier.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Students can only log in using their university email (e.g. fa-2023-bsse-067@lgu.edu.pk). Roll number login is not permitted.',
      });
    }

    const student = await Student.findOne({ email: identifier.toLowerCase().trim() }).select('+password');
    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (student.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your registration is pending administrator approval. Please check back later.',
        status: 'pending',
      });
    }
    if (student.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: `Your registration has been rejected. ${student.rejectionReason ? 'Reason: ' + student.rejectionReason : 'Please contact the university.'}`,
        status: 'rejected',
      });
    }
    if (student.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the university administration.',
        status: 'suspended',
      });
    }

    const token = generateToken(student._id, 'student');
    await AuditLog.create({
      action: 'LOGIN',
      performedBy: { id: student._id, name: student.fullName, role: 'student' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: 'Student login.',
    });

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        degreeProgram: student.degreeProgram,
        profilePicture: student.profilePicture,
        status: student.status,
        role: 'student',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Protected
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role === 'admin') {
      return res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: 'admin' },
      });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        degreeProgram: user.degreeProgram,
        profilePicture: user.profilePicture,
        status: user.status,
        role: 'student',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Protected
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id).select('+password');
    } else {
      user = await Student.findById(req.user._id).select('+password');
    }

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      action: 'PASSWORD_CHANGED',
      performedBy: { id: user._id, name: user.name || user.fullName, role: req.user.role },
      details: 'Password changed.',
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
