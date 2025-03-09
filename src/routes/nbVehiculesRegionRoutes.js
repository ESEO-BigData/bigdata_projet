const express = require('express');
const router = express.Router();
const nbVehiculesRegionController = require('../controllers/nbVehiculesRegionController');

// Routes pour les véhicules par région
router.get('/', nbVehiculesRegionController.getAllVehiculesRegion);
router.get('/nom/:nomRegion', nbVehiculesRegionController.getVehiculesRegionByName);
router.get('/statistiques', nbVehiculesRegionController.getVehiculesRegionStats);
router.get('/classement', nbVehiculesRegionController.getVehiculesRegionRanking);

module.exports = router;
