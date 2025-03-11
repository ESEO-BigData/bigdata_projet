const express = require('express');
const router = express.Router();
const pointDeChargeController = require('../controllers/pointDeChargeController');

// Routes
router.get('/', pointDeChargeController.getAllPoints);
router.get('/region/:region', pointDeChargeController.getPointsByRegion);
router.get('/departement/:codeDepartement', pointDeChargeController.getPointsByDepartement);
router.get('/statistiques/regions', pointDeChargeController.getStatsByRegion);

module.exports = router;
