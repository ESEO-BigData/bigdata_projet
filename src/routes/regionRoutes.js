const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');

// Routes pour les régions
router.get('/', regionController.getAllRegions);
router.get('/numero/:numero', regionController.getRegionByNumero);
router.get('/nom/:nom', regionController.getRegionByNom);
router.get('/region/:nomRegion', regionController.getDepartementsByRegion);
router.get('/statistiques/demographiques', regionController.getRegionDemographics);
router.get('/population/top', regionController.getMostPopulatedDepartements);
router.get('/densite/top', regionController.getMostDenseDepartements);

module.exports = router;
