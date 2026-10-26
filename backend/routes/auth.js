const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const {
  registerStudent, login, getMe, changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 100 }),
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll number is required.')
    .matches(/^[a-zA-Z]{2}-\d{4,5}-[a-zA-Z0-9]+-\d{2,4}$/)
    .withMessage('Roll number format must be like: fa-2023-bsse-067'),
  body('enrollmentYear')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid enrollment year.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required.')
    .matches(/^[a-zA-Z]{2}-\d{4,5}-[a-zA-Z0-9]+-\d{2,4}@lgu\.edu\.pk$/i)
    .withMessage('University email format must be like: fa-2023-bsse-067@lgu.edu.pk'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('department').notEmpty().withMessage('Department is required.'),
  body('degreeProgram').notEmpty().withMessage('Degree program is required.'),
  body('currentSemester')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 8 })
    .withMessage('Total semesters must be between 1 and 8.'),
];

router.post('/register', authLimiter, upload.single('profilePicture'), registerValidation, registerStudent);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
