const express = require('express');
const router = express.Router();
const { getIncidents, createIncident, getAccidents, createAccident } = require('../controllers/reportController');
const protect = require('../middleware/authMiddleware');

router.get('/incidents', protect, getIncidents);
router.post('/incidents', protect, createIncident);
router.get('/accidents', protect, getAccidents);
router.post('/accidents', protect, createAccident);

module.exports = router;
