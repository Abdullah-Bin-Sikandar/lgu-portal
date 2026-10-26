const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'STUDENT_REGISTERED',
        'STUDENT_APPROVED',
        'STUDENT_REJECTED',
        'STUDENT_SUSPENDED',
        'STUDENT_REACTIVATED',
        'STUDENT_PROFILE_UPDATED',
        'ADMIN_PROFILE_EDITED',
        'PASSWORD_CHANGED',
        'LOGIN',
        'LOGOUT',
      ],
    },
    performedBy: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      role: String,
    },
    targetStudent: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      rollNumber: String,
    },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ 'targetStudent.id': 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
