const DepartementEtRegion = require('../models/DepartementEtRegion');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer tous les départements et régions
exports.getAllDepartementsRegions = async (req, res) => {
    try {
        const data = await DepartementEtRegion.find();
        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements et régions', error);
    }
};

// Récupérer un département par son numéro
exports.getDepartementByNumero = async (req, res) => {
    try {
        const numero = req.params.numero;
        const departement = await DepartementEtRegion.findOne({ DEPARTEMENT: numero });

        if (!departement) {
            return responseFormatter.notFound(res, 'Département non trouvé');
        }

        return responseFormatter.success(res, departement);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération du département', error);
    }
};

// Récupérer les départements d'une région spécifique
exports.getDepartementsByRegion = async (req, res) => {
    try {
        const region = req.params.region;
        const departements = await DepartementEtRegion.find({ REGION: new RegExp(region, 'i') });

        if (departements.length === 0) {
            return responseFormatter.notFound(res, 'Aucun département trouvé pour cette région');
        }

        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements pour cette région', error);
    }
};

// Obtenir des statistiques globales sur les départements
exports.getDepartementsStats = async (req, res) => {
    try {
        const stats = await DepartementEtRegion.aggregate([
            {
                $group: {
                    _id: null,
                    totalPopulation: { $sum: "$POPULATION" },
                    totalSuperficie: { $sum: "$SUPERFICIE (km²)" },
                    densiteMoyenne: { $avg: "$DENSITE (habitants/km2)" },
                    nombreDepartements: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPopulation: 1,
                    totalSuperficie: 1,
                    densiteMoyenne: 1,
                    nombreDepartements: 1
                }
            }
        ]);

        return responseFormatter.success(res, stats);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques des départements', error);
    }
};

// Obtenir les départements les plus peuplés
exports.getMostPopulatedDepartements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const departements = await DepartementEtRegion.find().sort({ POPULATION: -1 }).limit(limit);

        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements les plus peuplés', error);
    }
};

// Obtenir les départements les plus denses
exports.getMostDenseDepartements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const departements = await DepartementEtRegion.find().sort({ "DENSITE (habitants/km2)": -1 }).limit(limit);

        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements les plus denses', error);
    }
};
