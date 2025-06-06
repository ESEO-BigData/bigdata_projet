const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze-correlation', aiController.analyzeCorrelation);
router.post('/analyze-comparison', aiController.analyzeComparison);

module.exports = router;