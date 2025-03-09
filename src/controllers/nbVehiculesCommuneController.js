const NbVehiculesParCommune = require('../models/NbVehiculesParCommune');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer tous les véhicules par commune (avec pagination)
exports.getAllVehiculesCommune = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const vehiculesCommune = await NbVehiculesParCommune.find()
            .skip(skip)
            .limit(limit);

        const total = await NbVehiculesParCommune.countDocuments();

        return responseFormatter.success(res, {
            vehiculesCommune,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données de véhicules par commune', error);
    }
};

// Récupérer les véhicules d'une commune spécifique par code géographique
exports.getVehiculesCommuneByCodeGeo = async (req, res) => {
    try {
        const codeGeo = req.params.codeGeo;
        const vehiculesCommune = await NbVehiculesParCommune.findOne({ CODGEO: codeGeo });

        if (!vehiculesCommune) {
            return responseFormatter.notFound(res, 'Données de véhicules pour cette commune non trouvées');
        }

        return responseFormatter.success(res, vehiculesCommune);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données de véhicules pour cette commune', error);
    }
};

// Récupérer les véhicules d'une commune spécifique par nom
exports.getVehiculesCommuneByName = async (req, res) => {
    try {
        const nomCommune = req.params.nomCommune;
        const vehiculesCommune = await NbVehiculesParCommune.find({
            LIBGEO: new RegExp(nomCommune, 'i')
        });

        if (vehiculesCommune.length === 0) {
            return responseFormatter.notFound(res, 'Données de véhicules pour cette commune non trouvées');
        }

        return responseFormatter.success(res, vehiculesCommune);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données de véhicules pour cette commune', error);
    }
};

// Récupérer les véhicules par EPCI
exports.getVehiculesCommuneByEPCI = async (req, res) => {
    try {
        const codeEPCI = req.params.codeEPCI;
        const vehiculesCommune = await NbVehiculesParCommune.find({ EPCI: codeEPCI });

        if (vehiculesCommune.length === 0) {
            return responseFormatter.notFound(res, 'Données de véhicules pour cet EPCI non trouvées');
        }

        // Calculer le total des véhicules pour cet EPCI
        const totalVehicules = vehiculesCommune.reduce((total, commune) => total + commune.NB_VP_RECHARGEABLES_EL, 0);
        const totalVehiculesGaz = vehiculesCommune.reduce((total, commune) => total + (commune.NB_VP_RECHARGEABLES_GAZ || 0), 0);
        const totalVP = vehiculesCommune.reduce((total, commune) => total + commune.NB_VP, 0);

        // Récupérer le nom de l'EPCI
        const nomEPCI = vehiculesCommune[0].LIBEPCI;

        return responseFormatter.success(res, {
            nomEPCI,
            communes: vehiculesCommune,
            statistiques: {
                totalVehiculesElectriques: totalVehicules,
                totalVehiculesGaz: totalVehiculesGaz,
                totalVehicules: totalVP,
                pourcentageElectriques: (totalVehicules / totalVP * 100).toFixed(2),
                pourcentageGaz: (totalVehiculesGaz / totalVP * 100).toFixed(2),
                nombreCommunes: vehiculesCommune.length
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données de véhicules pour cet EPCI', error);
    }
};

// Obtenir les communes avec le plus de véhicules électriques
exports.getTopCommunesElectriques = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topCommunes = await NbVehiculesParCommune.find()
            .sort({ NB_VP_RECHARGEABLES_EL: -1 })
            .limit(limit);

        return responseFormatter.success(res, topCommunes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le plus de véhicules électriques', error);
    }
};

// Obtenir les communes avec le plus fort taux de véhicules électriques
exports.getTopCommunesPourcentage = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const minVehicules = parseInt(req.query.minVehicules) || 100; // Minimum de véhicules pour éviter les petites communes avec peu de données

        const communes = await NbVehiculesParCommune.aggregate([
            {
                $match: {
                    NB_VP: { $gte: minVehicules }
                }
            },
            {
                $project: {
                    CODGEO: 1,
                    LIBGEO: 1,
                    EPCI: 1,
                    LIBEPCI: 1,
                    NB_VP_RECHARGEABLES_EL: 1,
                    NB_VP: 1,
                    pourcentage: {
                        $multiply: [
                            { $divide: ["$NB_VP_RECHARGEABLES_EL", "$NB_VP"] },
                            100
                        ]
                    }
                }
            },
            { $sort: { pourcentage: -1 } },
            { $limit: limit }
        ]);

        return responseFormatter.success(res, communes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le plus fort taux de véhicules électriques', error);
    }
};

// Obtenir des statistiques globales
exports.getGlobalStats = async (req, res) => {
    try {
        const stats = await NbVehiculesParCommune.aggregate([
            {
                $group: {
                    _id: null,
                    totalCommunes: { $sum: 1 },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehiculesGaz: { $sum: "$NB_VP_RECHARGEABLES_GAZ" },
                    totalVehicules: { $sum: "$NB_VP" },
                    moyenneVehiculesElectriquesParCommune: { $avg: "$NB_VP_RECHARGEABLES_EL" },
                    maxVehiculesElectriques: { $max: "$NB_VP_RECHARGEABLES_EL" },
                    minVehiculesElectriques: { $min: "$NB_VP_RECHARGEABLES_EL" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCommunes: 1,
                    totalVehiculesElectriques: 1,
                    totalVehiculesGaz: 1,
                    totalVehicules: 1,
                    moyenneVehiculesElectriquesParCommune: 1,
                    maxVehiculesElectriques: 1,
                    minVehiculesElectriques: 1,
                    pourcentageElectriques: {
                        $multiply: [
                            { $divide: ["$totalVehiculesElectriques", "$totalVehicules"] },
                            100
                        ]
                    },
                    pourcentageGaz: {
                        $multiply: [
                            { $divide: ["$totalVehiculesGaz", "$totalVehicules"] },
                            100
                        ]
                    }
                }
            }
        ]);

        return responseFormatter.success(res, stats[0]);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques globales', error);
    }
};
