/**
 * Diet Routes — /api/diet
 */

const express = require('express');
const { protect }    = require('../middleware/auth');
const { getDietPlans, recommendDiet } = require('../controllers/dietController');

const router = express.Router();

router.get ('/',         protect, getDietPlans);
router.post('/recommend',protect, recommendDiet);

module.exports = router;
