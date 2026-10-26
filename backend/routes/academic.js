const express = require('express');
const router = express.Router();
const academicData = require('../config/academicData');

// @desc    Get all departments
// @route   GET /api/academic/departments
router.get('/departments', (req, res) => {
  res.json({
    success: true,
    departments: academicData.map((d) => ({ name: d.name, code: d.code })),
  });
});

// @desc    Get programs for a department
// @route   GET /api/academic/programs?department=...
router.get('/programs', (req, res) => {
  const { department } = req.query;
  if (!department) {
    return res.status(400).json({ success: false, message: 'Department is required.' });
  }
  const dept = academicData.find((d) => d.name === department);
  if (!dept) {
    return res.status(404).json({ success: false, message: 'Department not found.' });
  }
  res.json({ success: true, programs: dept.programs });
});

// @desc    Get all departments with programs
// @route   GET /api/academic/all
router.get('/all', (req, res) => {
  res.json({ success: true, departments: academicData });
});

module.exports = router;
