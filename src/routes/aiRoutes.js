const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze-correlation', aiController.analyzeCorrelation);

module.exports = router;