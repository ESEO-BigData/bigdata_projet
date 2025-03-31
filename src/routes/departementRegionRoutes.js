const express = require('express');
const router = express.Router();
const departementRegionController = require('../controllers/departementRegionController');

// Routes existantes
router.get('/', departementRegionController.getAllDepartementsRegions);
router.get('/numero/:numero', departementRegionController.getDepartementByNumero);
router.get('/region/:region', departementRegionController.getDepartementsByRegion);
router.get('/statistiques', departementRegionController.getDepartementsStats);
router.get('/population/top', departementRegionController.getMostPopulatedDepartements);
router.get('/densite/top', departementRegionController.getMostDenseDepartements);

// Nouvelles routes pour les corrélations
router.get('/correlation/departements', departementRegionController.getCorrelationStatsByDepartement);
router.get('/correlation/regions', departementRegionController.getCorrelationStatsByRegion);
router.get('/bornes/top', departementRegionController.getMostEquippedDepartements);
router.get('/stations/top', departementRegionController.getMostStationsDepartements);

module.exports = router;
