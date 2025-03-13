const BornesCommuneDepartementRegion = require('../models/BornesCommuneDepartementRegion');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer toutes les données (avec pagination)
exports.getAllBornesCommuneDepartementRegion = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const data = await BornesCommuneDepartementRegion.find()
            .skip(skip)
            .limit(limit);

        const total = await BornesCommuneDepartementRegion.countDocuments();

        return responseFormatter.success(res, {
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données', error);
    }
};

// Récupérer les données par commune
exports.getByCommune = async (req, res) => {
    try {
        const commune = req.params.commune;
        const data = await BornesCommuneDepartementRegion.findOne({
            commune: new RegExp(commune, 'i')
        });

        if (!data) {
            return responseFormatter.notFound(res, 'Données non trouvées pour cette commune');
        }

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données pour cette commune', error);
    }
};

// Récupérer les données par code postal
exports.getByCodePostal = async (req, res) => {
    try {
        const codePostal = req.params.codePostal;
        const data = await BornesCommuneDepartementRegion.find({ code_postal: codePostal });

        if (data.length === 0) {
            return responseFormatter.notFound(res, 'Données non trouvées pour ce code postal');
        }

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données pour ce code postal', error);
    }
};

// Récupérer les données par département
exports.getByDepartement = async (req, res) => {
    try {
        const codeDepartement = req.params.codeDepartement;
        const data = await BornesCommuneDepartementRegion.find({ code_departement: codeDepartement });

        if (data.length === 0) {
            return responseFormatter.notFound(res, 'Données non trouvées pour ce département');
        }

        // Calculer des statistiques pour le département
        const totalBornes = data.reduce((sum, item) => sum + item.nombre_bornes, 0);
        const totalPointsCharge = data.reduce((sum, item) => sum + item.nombre_points_charge, 0);
        const totalVehicules = data.reduce((sum, item) => sum + item.NB_VP_RECHARGEABLES_EL, 0);
        const totalVehiculesGaz = data.reduce((sum, item) => sum + item.NB_VP_RECHARGEABLES_GAZ, 0);
        const totalVP = data.reduce((sum, item) => sum + item.NB_VP, 0);

        return responseFormatter.success(res, {
            departement: data[0].departement,
            code_departement: codeDepartement,
            region: data[0].region,
            communes: data,
            statistiques: {
                nombre_communes: data.length,
                total_bornes: totalBornes,
                total_points_charge: totalPointsCharge,
                total_vehicules_electriques: totalVehicules,
                total_vehicules_gaz: totalVehiculesGaz,
                total_vehicules: totalVP,
                pourcentage_electriques: totalVP > 0 ? ((totalVehicules / totalVP) * 100).toFixed(2) : 0,
                ratio_vehicules_par_borne: totalBornes > 0 ? (totalVehicules / totalBornes).toFixed(2) : 'N/A'
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données pour ce département', error);
    }
};

// Récupérer les données par région
exports.getByRegion = async (req, res) => {
    try {
        const region = req.params.region;
        const data = await BornesCommuneDepartementRegion.find({
            region: new RegExp(region, 'i')
        });

        if (data.length === 0) {
            return responseFormatter.notFound(res, 'Données non trouvées pour cette région');
        }

        // Calculer des statistiques pour la région
        const totalBornes = data.reduce((sum, item) => sum + item.nombre_bornes, 0);
        const totalPointsCharge = data.reduce((sum, item) => sum + item.nombre_points_charge, 0);
        const totalVehicules = data.reduce((sum, item) => sum + item.NB_VP_RECHARGEABLES_EL, 0);
        const totalVehiculesGaz = data.reduce((sum, item) => sum + item.NB_VP_RECHARGEABLES_GAZ, 0);
        const totalVP = data.reduce((sum, item) => sum + item.NB_VP, 0);

        // Regrouper par département
        const departements = {};
        data.forEach(item => {
            if (!departements[item.code_departement]) {
                departements[item.code_departement] = {
                    nom: item.departement,
                    code: item.code_departement,
                    nombre_bornes: 0,
                    nombre_points_charge: 0,
                    nombre_vehicules_electriques: 0,
                    nombre_vehicules_gaz: 0,
                    nombre_vehicules_total: 0
                };
            }

            departements[item.code_departement].nombre_bornes += item.nombre_bornes;
            departements[item.code_departement].nombre_points_charge += item.nombre_points_charge;
            departements[item.code_departement].nombre_vehicules_electriques += item.NB_VP_RECHARGEABLES_EL;
            departements[item.code_departement].nombre_vehicules_gaz += item.NB_VP_RECHARGEABLES_GAZ;
            departements[item.code_departement].nombre_vehicules_total += item.NB_VP;
        });

        return responseFormatter.success(res, {
            region: data[0].region,
            communes: data,
            departements: Object.values(departements),
            statistiques: {
                nombre_communes: data.length,
                nombre_departements: Object.keys(departements).length,
                total_bornes: totalBornes,
                total_points_charge: totalPointsCharge,
                total_vehicules_electriques: totalVehicules,
                total_vehicules_gaz: totalVehiculesGaz,
                total_vehicules: totalVP,
                pourcentage_electriques: totalVP > 0 ? ((totalVehicules / totalVP) * 100).toFixed(2) : 0,
                ratio_vehicules_par_borne: totalBornes > 0 ? (totalVehicules / totalBornes).toFixed(2) : 'N/A'
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données pour cette région', error);
    }
};

// Obtenir les communes avec le plus de bornes
exports.getTopBornes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const data = await BornesCommuneDepartementRegion.find({ nombre_bornes: { $gt: 0 } })
            .sort({ nombre_bornes: -1 })
            .limit(limit);

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le plus de bornes', error);
    }
};

// Obtenir les communes avec le plus de véhicules électriques
exports.getTopVehicules = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const data = await BornesCommuneDepartementRegion.find({ NB_VP_RECHARGEABLES_EL: { $gt: 0 } })
            .sort({ NB_VP_RECHARGEABLES_EL: -1 })
            .limit(limit);

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le plus de véhicules électriques', error);
    }
};

// Obtenir les communes avec le meilleur ratio véhicules/bornes
exports.getTopRatio = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const minBornes = parseInt(req.query.minBornes) || 1;
        const minVehicules = parseInt(req.query.minVehicules) || 10;

        const data = await BornesCommuneDepartementRegion.find({
            nombre_bornes: { $gte: minBornes },
            NB_VP_RECHARGEABLES_EL: { $gte: minVehicules }
        })
            .sort({ ratio_bornes_points: -1 })
            .limit(limit);

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le meilleur ratio', error);
    }
};

// Obtenir les communes avec le plus fort pourcentage de véhicules électriques
exports.getTopPourcentage = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const minVehicules = parseInt(req.query.minVehicules) || 100; // Minimum de véhicules pour éviter les petites communes

        const data = await BornesCommuneDepartementRegion.aggregate([
            {
                $match: {
                    NB_VP: { $gte: minVehicules }
                }
            },
            {
                $project: {
                    commune: 1,
                    nombre_bornes: 1,
                    nombre_points_charge: 1,
                    NB_VP_RECHARGEABLES_EL: 1,
                    NB_VP: 1,
                    departement: 1,
                    code_departement: 1,
                    region: 1,
                    code_postal: 1,
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

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le plus fort pourcentage', error);
    }
};

// Obtenir des statistiques globales
exports.getGlobalStats = async (req, res) => {
    try {
        const stats = await BornesCommuneDepartementRegion.aggregate([
            {
                $group: {
                    _id: null,
                    totalCommunes: { $sum: 1 },
                    totalBornes: { $sum: "$nombre_bornes" },
                    totalPointsCharge: { $sum: "$nombre_points_charge" },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehiculesGaz: { $sum: "$NB_VP_RECHARGEABLES_GAZ" },
                    totalVehicules: { $sum: "$NB_VP" },
                    communesAvecBornes: {
                        $sum: { $cond: [{ $gt: ["$nombre_bornes", 0] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCommunes: 1,
                    totalBornes: 1,
                    totalPointsCharge: 1,
                    totalVehiculesElectriques: 1,
                    totalVehiculesGaz: 1,
                    totalVehicules: 1,
                    communesAvecBornes: 1,
                    pourcentageCommunesAvecBornes: {
                        $multiply: [
                            { $divide: ["$communesAvecBornes", "$totalCommunes"] },
                            100
                        ]
                    },
                    pourcentageVehiculesElectriques: {
                        $multiply: [
                            { $divide: ["$totalVehiculesElectriques", "$totalVehicules"] },
                            100
                        ]
                    },
                    ratioVehiculesParBorne: {
                        $cond: [
                            { $eq: ["$totalBornes", 0] },
                            "N/A",
                            { $divide: ["$totalVehiculesElectriques", "$totalBornes"] }
                        ]
                    },
                    ratioPointsChargeParBorne: {
                        $cond: [
                            { $eq: ["$totalBornes", 0] },
                            "N/A",
                            { $divide: ["$totalPointsCharge", "$totalBornes"] }
                        ]
                    }
                }
            }
        ]);

        // Statistiques par région
        const statsRegions = await BornesCommuneDepartementRegion.aggregate([
            {
                $group: {
                    _id: "$region",
                    totalCommunes: { $sum: 1 },
                    totalBornes: { $sum: "$nombre_bornes" },
                    totalPointsCharge: { $sum: "$nombre_points_charge" },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehiculesGaz: { $sum: "$NB_VP_RECHARGEABLES_GAZ" },
                    totalVehicules: { $sum: "$NB_VP" }
                }
            },
            {
                $project: {
                    region: "$_id",
                    _id: 0,
                    totalCommunes: 1,
                    totalBornes: 1,
                    totalPointsCharge: 1,
                    totalVehiculesElectriques: 1,
                    totalVehiculesGaz: 1,
                    totalVehicules: 1,
                    pourcentageVehiculesElectriques: {
                        $multiply: [
                            { $divide: ["$totalVehiculesElectriques", "$totalVehicules"] },
                            100
                        ]
                    },
                    ratioVehiculesParBorne: {
                        $cond: [
                            { $eq: ["$totalBornes", 0] },
                            null,
                            { $divide: ["$totalVehiculesElectriques", "$totalBornes"] }
                        ]
                    }
                }
            },
            { $sort: { totalVehiculesElectriques: -1 } }
        ]);

        return responseFormatter.success(res, {
            global: stats[0],
            regions: statsRegions
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques globales', error);
    }
};

// Obtenir des statistiques de corrélation
exports.getCorrelationStats = async (req, res) => {
    try {
        // Calculer la corrélation entre le nombre de bornes et le nombre de véhicules électriques par département
        const statsDepartements = await BornesCommuneDepartementRegion.aggregate([
            {
                $group: {
                    _id: "$code_departement",
                    departement: { $first: "$departement" },
                    region: { $first: "$region" },
                    totalBornes: { $sum: "$nombre_bornes" },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehicules: { $sum: "$NB_VP" },
                    population: { $sum: "$population" } // Si vous avez ce champ
                }
            },
            {
                $project: {
                    _id: 0,
                    code: "$_id",
                    departement: 1,
                    region: 1,
                    totalBornes: 1,
                    totalVehiculesElectriques: 1,
                    totalVehicules: 1,
                    population: 1,
                    pourcentageVehiculesElectriques: {
                        $multiply: [
                            { $divide: ["$totalVehiculesElectriques", "$totalVehicules"] },
                            100
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

        return responseFormatter.success(res, {
            departements: statsDepartements
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques de corrélation', error);
    }
};
// Obtenir des statistiques de corrélation
exports.getCorrelationStats = async (req, res) => {
    try {
        // Calculer la corrélation entre le nombre de bornes et le nombre de véhicules électriques par département
        const statsDepartements = await BornesCommuneDepartementRegion.aggregate([
            {
                $group: {
                    _id: "$code_departement",
                    departement: { $first: "$departement" },
                    region: { $first: "$region" },
                    totalBornes: { $sum: "$nombre_bornes" },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehicules: { $sum: "$NB_VP" }
                }
            },
            {
                $project: {
                    _id: 0,
                    code: "$_id",
                    departement: 1,
                    region: 1,
                    totalBornes: 1,
                    totalVehiculesElectriques: 1,
                    totalVehicules: 1,
                    pourcentageVehiculesElectriques: {
                        $multiply: [
                            { $divide: ["$totalVehiculesElectriques", "$totalVehicules"] },
                            100
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

        return responseFormatter.success(res, {
            departements: statsDepartements
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques de corrélation', error);
    }
};

// Obtenir les communes sans bornes mais avec des véhicules électriques
exports.getCommunesSansBornes = async (req, res) => {
    try {
        const minVehicules = parseInt(req.query.minVehicules) || 10;
        const limit = parseInt(req.query.limit) || 20;

        const data = await BornesCommuneDepartementRegion.find({
            nombre_bornes: 0,
            NB_VP_RECHARGEABLES_EL: { $gte: minVehicules }
        })
            .sort({ NB_VP_RECHARGEABLES_EL: -1 })
            .limit(limit);

        return responseFormatter.success(res, data);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes sans bornes', error);
    }
};

// Comparer deux régions
exports.compareRegions = async (req, res) => {
    try {
        const region1 = req.params.region1;
        const region2 = req.params.region2;

        // Vérifier que les deux régions sont différentes
        if (region1 === region2) {
            return responseFormatter.badRequest(res, 'Les deux régions doivent être différentes');
        }

        // Récupérer les données pour la région 1
        const dataRegion1 = await BornesCommuneDepartementRegion.aggregate([
            { $match: { region: new RegExp(region1, 'i') } },
            {
                $group: {
                    _id: "$region",
                    totalCommunes: { $sum: 1 },
                    totalBornes: { $sum: "$nombre_bornes" },
                    totalPointsCharge: { $sum: "$nombre_points_charge" },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehiculesGaz: { $sum: "$NB_VP_RECHARGEABLES_GAZ" },
                    totalVehicules: { $sum: "$NB_VP" }
                }
            }
        ]);

        // Récupérer les données pour la région 2
        const dataRegion2 = await BornesCommuneDepartementRegion.aggregate([
            { $match: { region: new RegExp(region2, 'i') } },
            {
                $group: {
                    _id: "$region",
                    totalCommunes: { $sum: 1 },
                    totalBornes: { $sum: "$nombre_bornes" },
                    totalPointsCharge: { $sum: "$nombre_points_charge" },
                    totalVehiculesElectriques: { $sum: "$NB_VP_RECHARGEABLES_EL" },
                    totalVehiculesGaz: { $sum: "$NB_VP_RECHARGEABLES_GAZ" },
                    totalVehicules: { $sum: "$NB_VP" }
                }
            }
        ]);

        if (dataRegion1.length === 0 || dataRegion2.length === 0) {
            return responseFormatter.notFound(res, 'Une ou plusieurs régions non trouvées');
        }

        // Calculer les pourcentages et ratios pour la région 1
        const statsRegion1 = {
            region: dataRegion1[0]._id,
            totalCommunes: dataRegion1[0].totalCommunes,
            totalBornes: dataRegion1[0].totalBornes,
            totalPointsCharge: dataRegion1[0].totalPointsCharge,
            totalVehiculesElectriques: dataRegion1[0].totalVehiculesElectriques,
            totalVehiculesGaz: dataRegion1[0].totalVehiculesGaz,
            totalVehicules: dataRegion1[0].totalVehicules,
            pourcentageVehiculesElectriques: ((dataRegion1[0].totalVehiculesElectriques / dataRegion1[0].totalVehicules) * 100).toFixed(2),
            ratioVehiculesParBorne: dataRegion1[0].totalBornes > 0 ? (dataRegion1[0].totalVehiculesElectriques / dataRegion1[0].totalBornes).toFixed(2) : 'N/A',
            bornesPour1000Vehicules: ((dataRegion1[0].totalBornes / dataRegion1[0].totalVehiculesElectriques) * 1000).toFixed(2)
        };

        // Calculer les pourcentages et ratios pour la région 2
        const statsRegion2 = {
            region: dataRegion2[0]._id,
            totalCommunes: dataRegion2[0].totalCommunes,
            totalBornes: dataRegion2[0].totalBornes,
            totalPointsCharge: dataRegion2[0].totalPointsCharge,
            totalVehiculesElectriques: dataRegion2[0].totalVehiculesElectriques,
            totalVehiculesGaz: dataRegion2[0].totalVehiculesGaz,
            totalVehicules: dataRegion2[0].totalVehicules,
            pourcentageVehiculesElectriques: ((dataRegion2[0].totalVehiculesElectriques / dataRegion2[0].totalVehicules) * 100).toFixed(2),
            ratioVehiculesParBorne: dataRegion2[0].totalBornes > 0 ? (dataRegion2[0].totalVehiculesElectriques / dataRegion2[0].totalBornes).toFixed(2) : 'N/A',
            bornesPour1000Vehicules: ((dataRegion2[0].totalBornes / dataRegion2[0].totalVehiculesElectriques) * 1000).toFixed(2)
        };

        // Calculer les différences
        const differences = {
            totalCommunes: statsRegion1.totalCommunes - statsRegion2.totalCommunes,
            totalBornes: statsRegion1.totalBornes - statsRegion2.totalBornes,
            totalPointsCharge: statsRegion1.totalPointsCharge - statsRegion2.totalPointsCharge,
            totalVehiculesElectriques: statsRegion1.totalVehiculesElectriques - statsRegion2.totalVehiculesElectriques,
            totalVehicules: statsRegion1.totalVehicules - statsRegion2.totalVehicules,
            pourcentageVehiculesElectriques: (parseFloat(statsRegion1.pourcentageVehiculesElectriques) - parseFloat(statsRegion2.pourcentageVehiculesElectriques)).toFixed(2)
        };

        return responseFormatter.success(res, {
            region1: statsRegion1,
            region2: statsRegion2,
            differences
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la comparaison des régions', error);
    }
};

// Obtenir le total des véhicules électriques d'une région à partir des données communes (DOM-TOM compatible)
exports.getNbVehiculesELByRegion = async (req, res) => {
    try {
        const region = req.params.region;
        const normalize = str => str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const regionCleaned = normalize(region);

        const allBornes = await BornesCommuneDepartementRegion.find();
        const matchingBornes = allBornes.filter(b => normalize(b.region) === regionCleaned);

        /*console.log("🔍 Région recherchée :", region, "| normalisée :", regionCleaned);
        console.log("↪️ Communes trouvées :", matchingBornes.length);*/

        if (matchingBornes.length === 0) {
            return responseFormatter.notFound(res, `Aucune donnée pour la région ${region}`);
        }

        const totalEL = matchingBornes.reduce((sum, commune) => sum + (commune.NB_VP_RECHARGEABLES_EL || 0), 0);

        return responseFormatter.success(res, {
            region,
            totalVehiculesElectriques: totalEL
        });

    } catch (error) {
        return responseFormatter.error(res, `Erreur lors du calcul des véhicules électriques pour la région ${region}`, error);
    }
};
