const express = require('express');
const router = express.Router();
const {
  getAllStudents, getStudentById, approveStudent, rejectStudent,
  suspendStudent, reactivateStudent, editStudent,
  getDashboardStats, getAuditLogs,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', editStudent);
router.put('/students/:id/approve', approveStudent);
router.put('/students/:id/reject', rejectStudent);
router.put('/students/:id/suspend', suspendStudent);
router.put('/students/:id/reactivate', reactivateStudent);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
