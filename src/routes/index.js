const express = require('express');
const router = express.Router();

// Import des routes
const bornesRoutes = require('./bornesRoutes');
const nbVehiculesRegionRoutes = require('./nbVehiculesRegionRoutes');
const regionRoutes = require('./regionRoutes');
const nbVehiculesCommuneRoutes = require('./nbVehiculesCommuneRoutes');
const departementRegionRoutes = require('./departementRegionRoutes');

// Configuration des routes
router.use('/bornes', bornesRoutes);
router.use('/vehicules/regions', nbVehiculesRegionRoutes);
router.use('/regions', regionRoutes);
router.use('/vehicules/communes', nbVehiculesCommuneRoutes);
router.use('/departements', departementRegionRoutes);

// Route racine
router.get('/', (req, res) => {
    res.json({
        message: 'API de données sur les véhicules électriques',
        endpoints: {
            bornes: '/api/bornes',
            vehiculesRegions: '/api/vehicules/regions',
            regions: '/api/regions',
            vehiculesCommunes: '/api/vehicules/communes',
            departements: '/api/departements'
        }
    });
});

module.exports = router;
