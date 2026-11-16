const express = require('express');
const router = express.Router();
const {
  getPublicCoreTeam,
  getAllCoreTeamAdmin,
  createCoreTeamMember,
  updateCoreTeamMember,
  deleteCoreTeamMember,
} = require('../controllers/coreTeamController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route
router.get('/', getPublicCoreTeam);

// Admin routes
router.get('/all', protect, adminOnly, getAllCoreTeamAdmin);
router.post('/', protect, adminOnly, createCoreTeamMember);
router.put('/:id', protect, adminOnly, updateCoreTeamMember);
router.delete('/:id', protect, adminOnly, deleteCoreTeamMember);

module.exports = router;

