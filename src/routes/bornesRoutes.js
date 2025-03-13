const express = require('express');
const router = express.Router();
const bornesController = require('../controllers/bornesController');

// Routes pour les bornes électriques
router.get('/', bornesController.getAllBornes);
router.get('/id/:id', bornesController.getBorneById);
router.get('/commune/:commune', bornesController.getBornesByCommune);
router.get('/codepostal/:codePostal', bornesController.getBornesByCodePostal);
router.get('/departement/:codeDepartement', bornesController.getBornesByDepartement);
router.get('/proximite', bornesController.getBornesProximite);
router.get('/typeprise/:typePrise', bornesController.getBornesByTypePrise);
router.get('/statistiques', bornesController.getBornesStats);
router.get('/region/:regionName', bornesController.getBornesByRegion);
router.get('/details', bornesController.getBornesElectriquesByAdresseOrId);


module.exports = router;
