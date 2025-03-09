const express = require('express');
const router = express.Router();
const bornesCommuneDepartementRegionController = require('../controllers/bornesCommuneDepartementRegionController');

// Routes pour les bornes par commune/département/région
router.get('/', bornesCommuneDepartementRegionController.getAllBornesCommune);
router.get('/commune/:commune', bornesCommuneDepartementRegionController.getBornesByCommune);
router.get('/departement/:codeDepartement', bornesCommuneDepartementRegionController.getBornesByDepartement);
router.get('/region/:region', bornesCommuneDepartementRegionController.getBornesByRegion);
router.get('/top', bornesCommuneDepartementRegionController.getTopCommunesBornes);
router.get('/statistiques/regions', bornesCommuneDepartementRegionController.getBornesStatsByRegion);

module.exports = router;
