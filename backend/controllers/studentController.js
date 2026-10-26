const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');
const path = require('path');
const fs = require('fs');

// @desc    Get current student's full profile
// @route   GET /api/students/profile
// @access  Protected (student)
exports.getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id).select('-password -passwordResetToken -passwordResetExpires');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile (permitted fields only)
// @route   PUT /api/students/profile
// @access  Protected (student)
exports.updateMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Only permitted fields can be self-updated
    const permitted = ['bio', 'contactNumber', 'linkedIn', 'github', 'portfolio', 'otherLinks', 'profileVisibility'];
    permitted.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'otherLinks') {
          student.otherLinks = typeof req.body[field] === 'string'
            ? JSON.parse(req.body[field])
            : req.body[field];
        } else if (field === 'profileVisibility') {
          student.profileVisibility = typeof req.body[field] === 'string'
            ? JSON.parse(req.body[field])
            : req.body[field];
        } else {
          student[field] = req.body[field];
        }
      }
    });

    // Handle profile picture upload
    if (req.file) {
      // Remove old picture
      if (student.profilePicture) {
        const oldPath = path.join(__dirname, '..', student.profilePicture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      student.profilePicture = `/uploads/${req.file.filename}`;
    }

    await student.save();

    await AuditLog.create({
      action: 'STUDENT_PROFILE_UPDATED',
      performedBy: { id: student._id, name: student.fullName, role: 'student' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: 'Student updated their own profile.',
    });

    const updated = await Student.findById(student._id).select('-password');
    res.json({ success: true, message: 'Profile updated successfully.', student: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single student's public profile
// @route   GET /api/students/:id
// @access  Protected
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select(
      '-password -passwordResetToken -passwordResetExpires -rejectionReason -approvedBy -suspendedReason'
    );
    if (!student || student.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Student profile not found or not available.' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student directory (approved students only)
// @route   GET /api/students/directory
// @access  Protected
exports.getDirectory = async (req, res, next) => {
  try {
    const {
      search, department, degreeProgram, enrollmentYear,
      page = 1, limit = 12,
    } = req.query;

    const query = { status: 'approved' };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;
    if (degreeProgram) query.degreeProgram = degreeProgram;
    if (enrollmentYear) query.enrollmentYear = parseInt(enrollmentYear);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .select('fullName rollNumber enrollmentYear department degreeProgram profilePicture bio currentSemester linkedIn github portfolio')
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
