const express = require('express');
const router = express.Router();
const { register, login, saveSOS, logActivity, getProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/sos', protect, saveSOS);
router.post('/activity', protect, logActivity);
router.get('/profile', protect, getProfile);

module.exports = router;
