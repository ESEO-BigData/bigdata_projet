const express = require('express');
const router = express.Router();
const nbVehiculesCommuneController = require('../controllers/nbVehiculesCommuneController');

// Routes pour les véhicules par commune
router.get('/', nbVehiculesCommuneController.getAllVehiculesCommune);
router.get('/code/:codeGeo', nbVehiculesCommuneController.getVehiculesCommuneByCodeGeo);
router.get('/nom/:nomCommune', nbVehiculesCommuneController.getVehiculesCommuneByName);
router.get('/epci/:codeEPCI', nbVehiculesCommuneController.getVehiculesCommuneByEPCI);
router.get('/top/nombre', nbVehiculesCommuneController.getTopCommunesElectriques);
router.get('/top/pourcentage', nbVehiculesCommuneController.getTopCommunesPourcentage);
router.get('/statistiques', nbVehiculesCommuneController.getGlobalStats);

module.exports = router;
