const express = require('express');
const router = express.Router();
const departementRegionController = require('../controllers/departementRegionController');

// Routes pour les départements et régions
router.get('/', departementRegionController.getAllDepartementsRegions);
router.get('/numero/:numero', departementRegionController.getDepartementByNumero);
router.get('/region/:region', departementRegionController.getDepartementsByRegion);
router.get('/statistiques', departementRegionController.getDepartementsStats);
router.get('/population/top', departementRegionController.getMostPopulatedDepartements);
router.get('/densite/top', departementRegionController.getMostDenseDepartements);

module.exports = router;
