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

// Obtenir des statistiques de corrélation par département
exports.getCorrelationStatsByDepartement = async (req, res) => {
    try {
        const departements = await DepartementEtRegion.find().select({
            _id: 0,
            DEPARTEMENT: 1,
            NOM: 1,
            REGION: 1,
            somme_NB_VP_RECHARGEABLES_EL: 1,
            Nombre_Bornes: 1,
            Nombre_stations: 1,
            NB_VP: 1,
            POPULATION: 1,
            "DENSITE (habitants/km2)": 1,
            "SUPERFICIE (km²)": 1
        });

        // Ajouter des ratios calculés
        const departementsWithRatios = departements.map(dept => {
            const data = dept.toObject();
            // Ratio véhicules électriques / bornes
            data.ratio_vehicules_bornes = data.Nombre_Bornes > 0 ?
                (data.somme_NB_VP_RECHARGEABLES_EL / data.Nombre_Bornes).toFixed(2) : 'N/A';

            // Pourcentage de véhicules électriques
            data.pourcentage_vehicules_electriques = data.NB_VP > 0 ?
                ((data.somme_NB_VP_RECHARGEABLES_EL / data.NB_VP) * 100).toFixed(2) : 0;

            // Bornes pour 1000 véhicules électriques
            data.bornes_pour_1000_vehicules = data.somme_NB_VP_RECHARGEABLES_EL > 0 ?
                ((data.Nombre_Bornes / data.somme_NB_VP_RECHARGEABLES_EL) * 1000).toFixed(2) : 'N/A';

            return data;
        });

        return responseFormatter.success(res, departementsWithRatios);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des statistiques de corrélation', error);
    }
};

// Obtenir des statistiques de corrélation par région
exports.getCorrelationStatsByRegion = async (req, res) => {
    try {
        // Vérifier d'abord si des données existent
        const count = await DepartementEtRegion.countDocuments();
        if (count === 0) {
            return responseFormatter.success(res, []);
        }

        const statsRegions = await DepartementEtRegion.aggregate([
            {
                $group: {
                    _id: "$REGION",
                    totalVehiculesElectriques: { $sum: "$somme_NB_VP_RECHARGEABLES_EL" },
                    totalBornes: { $sum: "$Nombre_Bornes" },
                    totalStations: { $sum: "$Nombre_stations" },
                    totalVehiculesThermiques: { $sum: "$NB_VP" },
                    totalPopulation: { $sum: "$POPULATION" },
                    totalSuperficie: { $sum: "$SUPERFICIE (km²)" },
                    nombreDepartements: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id",
                    totalVehiculesElectriques: 1,
                    totalBornes: 1,
                    totalStations: 1,
                    totalVehiculesThermiques: 1,
                    totalPopulation: 1,
                    totalSuperficie: 1,
                    nombreDepartements: 1,
                    densite: {
                        $cond: [
                            { $eq: ["$totalSuperficie", 0] },
                            0,
                            { $divide: ["$totalPopulation", "$totalSuperficie"] }
                        ]
                    },
                    pourcentageVehiculesElectriques: {
                        $cond: [
                            { $eq: ["$totalVehiculesThermiques", 0] },
                            0,
                            { $multiply: [
                                    { $divide: ["$totalVehiculesElectriques", "$totalVehiculesThermiques"] },
                                    100
                                ]}
                        ]
                    },
                    ratioVehiculesParBorne: {
                        $cond: [
                            { $eq: ["$totalBornes", 0] },
                            0,
                            { $divide: ["$totalVehiculesElectriques", "$totalBornes"] }
                        ]
                    },
                    bornesPour1000Vehicules: {
                        $cond: [
                            { $eq: ["$totalVehiculesElectriques", 0] },
                            0,
                            { $multiply: [{ $divide: ["$totalBornes", "$totalVehiculesElectriques"] }, 1000] }
                        ]
                    }
                }
            },
            { $sort: { totalVehiculesElectriques: -1 } }
        ]);

        return responseFormatter.success(res, statsRegions);
    } catch (error) {
        console.error('Erreur dans getCorrelationStatsByRegion:', error);
        return responseFormatter.error(res, 'Erreur lors de la récupération des statistiques de corrélation par région', error);
    }
};

// Obtenir les départements les plus équipés en bornes
exports.getMostEquippedDepartements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const departements = await DepartementEtRegion.find().sort({ Nombre_Bornes: -1 }).limit(limit);
        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements les plus équipés en bornes', error);
    }
};

// Obtenir les départements avec le plus de stations
exports.getMostStationsDepartements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const departements = await DepartementEtRegion.find().sort({ Nombre_stations: -1 }).limit(limit);
        return responseFormatter.success(res, departements);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des départements avec le plus de stations', error);
    }
};