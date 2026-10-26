const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');
const academicData = require('../config/academicData');

// @desc    Get all student registrations with filters
// @route   GET /api/admin/students
// @access  Admin
exports.getAllStudents = async (req, res, next) => {
  try {
    const {
      search, status, department, degreeProgram, enrollmentYear,
      page = 1, limit = 15,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (degreeProgram) query.degreeProgram = degreeProgram;
    if (enrollmentYear) query.enrollmentYear = parseInt(enrollmentYear);
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
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

// @desc    Get a single student's full info (admin)
// @route   GET /api/admin/students/:id
// @access  Admin
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a student registration
// @route   PUT /api/admin/students/:id/approve
// @access  Admin
exports.approveStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    if (student.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Student is already approved.' });
    }

    student.status = 'approved';
    student.approvedAt = new Date();
    student.approvedBy = req.user._id;
    student.rejectionReason = '';
    await student.save();

    await AuditLog.create({
      action: 'STUDENT_APPROVED',
      performedBy: { id: req.user._id, name: req.user.name, role: 'admin' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: 'Student registration approved.',
    });

    res.json({ success: true, message: `${student.fullName}'s registration has been approved.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a student registration
// @route   PUT /api/admin/students/:id/reject
// @access  Admin
exports.rejectStudent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    student.status = 'rejected';
    student.rejectionReason = reason || '';
    student.approvedAt = null;
    await student.save();

    await AuditLog.create({
      action: 'STUDENT_REJECTED',
      performedBy: { id: req.user._id, name: req.user.name, role: 'admin' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: `Rejected. Reason: ${reason || 'No reason provided.'}`,
    });

    res.json({ success: true, message: `${student.fullName}'s registration has been rejected.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend student account
// @route   PUT /api/admin/students/:id/suspend
// @access  Admin
exports.suspendStudent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    student.status = 'suspended';
    student.suspendedAt = new Date();
    student.suspendedReason = reason || '';
    await student.save();

    await AuditLog.create({
      action: 'STUDENT_SUSPENDED',
      performedBy: { id: req.user._id, name: req.user.name, role: 'admin' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: `Suspended. Reason: ${reason || 'No reason provided.'}`,
    });

    res.json({ success: true, message: `${student.fullName}'s account has been suspended.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate a suspended student
// @route   PUT /api/admin/students/:id/reactivate
// @access  Admin
exports.reactivateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    student.status = 'approved';
    student.suspendedAt = null;
    student.suspendedReason = '';
    await student.save();

    await AuditLog.create({
      action: 'STUDENT_REACTIVATED',
      performedBy: { id: req.user._id, name: req.user.name, role: 'admin' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: 'Account reactivated.',
    });

    res.json({ success: true, message: `${student.fullName}'s account has been reactivated.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin edits a student's profile
// @route   PUT /api/admin/students/:id
// @access  Admin
exports.editStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Admin can update any field except password
    const editableFields = [
      'fullName', 'rollNumber', 'enrollmentYear', 'email', 'contactNumber',
      'department', 'degreeProgram', 'currentSemester', 'academicSession',
      'bio', 'linkedIn', 'github', 'portfolio', 'otherLinks',
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    await AuditLog.create({
      action: 'ADMIN_PROFILE_EDITED',
      performedBy: { id: req.user._id, name: req.user.name, role: 'admin' },
      targetStudent: { id: student._id, name: student.fullName, rollNumber: student.rollNumber },
      details: `Admin edited student profile fields: ${Object.keys(req.body).join(', ')}`,
    });

    const updated = await Student.findById(student._id).select('-password');
    res.json({ success: true, message: 'Student profile updated.', student: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      pendingCount,
      approvedCount,
      rejectedCount,
      suspendedCount,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'pending' }),
      Student.countDocuments({ status: 'approved' }),
      Student.countDocuments({ status: 'rejected' }),
      Student.countDocuments({ status: 'suspended' }),
    ]);

    // Department-wise approved students
    const departmentStats = await Student.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Enrollment year stats
    const enrollmentYearStats = await Student.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$enrollmentYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    // Degree program stats
    const degreeProgramStats = await Student.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$degreeProgram', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent registrations
    const recentRegistrations = await Student.find()
      .select('fullName rollNumber department degreeProgram status createdAt profilePicture')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        total: totalStudents,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        suspended: suspendedCount,
      },
      departmentStats,
      enrollmentYearStats,
      degreeProgramStats,
      recentRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};
