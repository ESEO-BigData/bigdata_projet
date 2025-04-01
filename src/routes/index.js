const express = require('express');
const router = express.Router();

// Import des routes
const bornesRoutes = require('./bornesRoutes');
const nbVehiculesRegionRoutes = require('./nbVehiculesRegionRoutes');
const regionRoutes = require('./regionRoutes');
const nbVehiculesCommuneRoutes = require('./nbVehiculesCommuneRoutes');
const departementRegionRoutes = require('./departementRegionRoutes');
const bornesCommuneDepartementRegionRoutes = require('./bornesCommuneDepartementRegionRoutes');
const pointDeChargeRoutes = require('./pointDeChargeRoutes');
const aiRoutes = require('./aiRoutes');


// Configuration des routes
router.use('/bornes', bornesRoutes);
router.use('/vehicules/regions', nbVehiculesRegionRoutes);
router.use('/regions', regionRoutes);
router.use('/vehicules/communes', nbVehiculesCommuneRoutes);
router.use('/departements', departementRegionRoutes);
router.use('/bornes-communes', bornesCommuneDepartementRegionRoutes);
router.use('/points-de-charge', pointDeChargeRoutes);
router.use('/ai', aiRoutes);


// Route racine
router.get('/', (req, res) => {
    res.json({
        message: 'API de données sur les véhicules électriques',
        endpoints: {
            bornes: '/api/bornes',
            bornesCommunes: '/api/bornes/communes',
            vehiculesRegions: '/api/vehicules/regions',
            regions: '/api/regions',
            vehiculesCommunes: '/api/vehicules/communes',
            departements: '/api/departements',
            pointsDeCharge: '/api/points-de-charge'
        }
    });
});

module.exports = router;
