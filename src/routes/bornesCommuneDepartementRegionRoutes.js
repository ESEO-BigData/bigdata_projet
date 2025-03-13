const express = require('express');
const router = express.Router();
const bornesCommuneDepartementRegionController = require('../controllers/bornesCommuneDepartementRegionController');

// Routes pour les données combinées bornes/communes/départements/régions
router.get('/', bornesCommuneDepartementRegionController.getAllBornesCommuneDepartementRegion);
router.get('/commune/:commune', bornesCommuneDepartementRegionController.getByCommune);
router.get('/codepostal/:codePostal', bornesCommuneDepartementRegionController.getByCodePostal);
router.get('/departement/:codeDepartement', bornesCommuneDepartementRegionController.getByDepartement);
router.get('/region/:region', bornesCommuneDepartementRegionController.getByRegion);

// Routes pour les classements
router.get('/top/bornes', bornesCommuneDepartementRegionController.getTopBornes);
router.get('/top/vehicules', bornesCommuneDepartementRegionController.getTopVehicules);
router.get('/top/ratio', bornesCommuneDepartementRegionController.getTopRatio);
router.get('/top/pourcentage', bornesCommuneDepartementRegionController.getTopPourcentage);

// Routes pour les statistiques
router.get('/statistiques/global', bornesCommuneDepartementRegionController.getGlobalStats);
router.get('/statistiques/correlation', bornesCommuneDepartementRegionController.getCorrelationStats);
router.get('/communes-sans-bornes', bornesCommuneDepartementRegionController.getCommunesSansBornes);

// Route pour comparer deux régions
router.get('/comparer/:region1/:region2', bornesCommuneDepartementRegionController.compareRegions);

module.exports = router;
