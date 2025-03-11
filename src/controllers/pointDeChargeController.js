const PointDeCharge = require('../models/PointDeCharge');
const responseFormatter = require('../utils/responseFormatter');

// Toutes les stations
exports.getAllPoints = async (req, res) => {
    try {
        const points = await PointDeCharge.find();
        return responseFormatter.success(res, points);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des points de charge', error);
    }
};

// Par région
exports.getPointsByRegion = async (req, res) => {
    try {
        const region = req.params.region;
        const points = await PointDeCharge.find({ region: new RegExp(region, 'i') });

        if (points.length === 0) {
            return responseFormatter.notFound(res, 'Aucun point de charge trouvé pour cette région');
        }

        const totalBornes = points.reduce((sum, item) => sum + (item.nombre_bornes || 0), 0);

        return responseFormatter.success(res, {
            region,
            totalBornes,
            nombreStations: points.length,
            stations: points
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des points par région', error);
    }
};

// Par département
exports.getPointsByDepartement = async (req, res) => {
    try {
        const codeDepartement = req.params.codeDepartement;
        const points = await PointDeCharge.find({ departement: new RegExp(codeDepartement, 'i') });

        if (points.length === 0) {
            return responseFormatter.notFound(res, 'Aucun point de charge trouvé pour ce département');
        }

        const totalBornes = points.reduce((sum, item) => sum + (item.nombre_bornes || 0), 0);

        return responseFormatter.success(res, {
            departement: codeDepartement,
            totalBornes,
            nombreStations: points.length,
            stations: points
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des points par département', error);
    }
};

// Statistiques par région (agrégées)
exports.getStatsByRegion = async (req, res) => {
    try {
        const stats = await PointDeCharge.aggregate([
            {
                $group: {
                    _id: "$region",
                    totalBornes: { $sum: "$nombre_bornes" },
                    nombreStations: { $sum: 1 }
                }
            },
            {
                $project: {
                    region: "$_id",
                    _id: 0,
                    totalBornes: 1,
                    nombreStations: 1
                }
            },
            { $sort: { totalBornes: -1 } }
        ]);

        return responseFormatter.success(res, stats);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques des points par région', error);
    }
};
