const express = require('express');
const router = express.Router();
const {
  getMyProfile, updateMyProfile, getDirectory, getStudentById,
} = require('../controllers/studentController');
const { protect, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Directory (for logged-in users)
router.get('/directory', protect, getDirectory);

// Own profile
router.get('/profile', protect, studentOnly, getMyProfile);
router.put('/profile', protect, studentOnly, upload.single('profilePicture'), updateMyProfile);

// View another student's profile
router.get('/:id', protect, getStudentById);

module.exports = router;
