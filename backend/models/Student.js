const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    enrollmentYear: {
      type: Number,
      required: [true, 'Enrollment year is required'],
      min: [2000, 'Invalid enrollment year'],
      max: [new Date().getFullYear() + 1, 'Invalid enrollment year'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Contact number too long'],
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    // Academic Information
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    degreeProgram: {
      type: String,
      required: [true, 'Degree program is required'],
      trim: true,
    },
    currentSemester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },
    academicSession: {
      type: String,
      trim: true,
      default: '',
    },

    // Professional Information
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    linkedIn: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },
    otherLinks: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    ],

    // Account Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },

    // Approval metadata
    rejectionReason: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    suspendedAt: { type: Date, default: null },
    suspendedReason: { type: String, default: '' },

    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Profile visibility settings
    profileVisibility: {
      contactNumber: { type: Boolean, default: false },
      email: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for search
studentSchema.index({ fullName: 'text', rollNumber: 'text' });
studentSchema.index({ department: 1 });
studentSchema.index({ degreeProgram: 1 });
studentSchema.index({ enrollmentYear: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
