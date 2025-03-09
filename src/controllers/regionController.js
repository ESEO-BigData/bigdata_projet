const Region = require('../models/Region');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer toutes les régions
exports.getAllRegions = async (req, res) => {
    try {
        const regions = await Region.find();
        return responseFormatter.success(res, regions);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des régions', error);
    }
};

// Récupérer une région par son numéro de département
exports.getRegionByNumero = async (req, res) => {
    try {
        const numero = req.params.numero;
        const region = await Region.findOne({ NUMÉRO: numero });

        if (!region) {
            return responseFormatter.notFound(res, 'Région non trouvée');
        }

        return responseFormatter.success(res, region);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération de la région', error);
    }
};

// Récupérer une région par son nom de département
exports.getRegionByNom = async (req, res) => {
    try {
        const nom = req.params.nom;
        const region = await Region.findOne({
            NOM: new RegExp(nom, 'i')
        });

        if (!region) {
            return responseFormatter.notFound(res, 'Région non trouvée');
        }

        return responseFormatter.success(res, region);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération de la région', error);
    }
};

// Récupérer les départements par région
exports.getDepartementsByRegion = async (req, res) => {
    try {
        const nomRegion = req.params.nomRegion;
        const departements = await Region.find({
            REGION: new RegExp(nomRegion, 'i')
        });

        if (departements.length === 0) {
            return responseFormatter.notFound(res, 'Aucun département trouvé pour cette région');
        }

        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements de cette région', error);
    }
};

// Obtenir des statistiques démographiques par région
exports.getRegionDemographics = async (req, res) => {
    try {
        const stats = await Region.aggregate([
            {
                $group: {
                    _id: "$REGION",
                    totalPopulation: { $sum: "$POPULATION" },
                    totalSuperficie: { $sum: "$SUPERFICIE (km²)" },
                    nombreDepartements: { $sum: 1 },
                    densiteMoyenne: { $avg: "$DENSITE (habitants/km2)" }
                }
            },
            {
                $project: {
                    region: "$_id",
                    _id: 0,
                    totalPopulation: 1,
                    totalSuperficie: 1,
                    nombreDepartements: 1,
                    densiteMoyenne: 1,
                    densiteCalculee: { $divide: ["$totalPopulation", "$totalSuperficie"] }
                }
            },
            { $sort: { totalPopulation: -1 } }
        ]);

        return responseFormatter.success(res, stats);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques démographiques', error);
    }
};

// Obtenir les départements les plus peuplés
exports.getMostPopulatedDepartements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const departements = await Region.find()
            .sort({ POPULATION: -1 })
            .limit(limit);

        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements les plus peuplés', error);
    }
};

// Obtenir les départements les plus denses
exports.getMostDenseDepartements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const departements = await Region.find()
            .sort({ "DENSITE (habitants/km2)": -1 })
            .limit(limit);

        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements les plus denses', error);
    }
};
