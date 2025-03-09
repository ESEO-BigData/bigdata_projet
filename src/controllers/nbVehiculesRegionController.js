const NbVehiculesParRegion = require('../models/NbVehiculesParRegion');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer tous les véhicules par région
exports.getAllVehiculesRegion = async (req, res) => {
    try {
        const vehiculesRegion = await NbVehiculesParRegion.find();
        return responseFormatter.success(res, vehiculesRegion);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données de véhicules par région', error);
    }
};

// Récupérer les véhicules d'une région spécifique par nom
exports.getVehiculesRegionByName = async (req, res) => {
    try {
        const nomRegion = req.params.nomRegion;
        const vehiculesRegion = await NbVehiculesParRegion.findOne({
            REGION: new RegExp(nomRegion, 'i')
        });

        if (!vehiculesRegion) {
            return responseFormatter.notFound(res, 'Données de véhicules pour cette région non trouvées');
        }

        return responseFormatter.success(res, vehiculesRegion);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des données de véhicules pour cette région', error);
    }
};

// Obtenir les statistiques des véhicules par région
exports.getVehiculesRegionStats = async (req, res) => {
    try {
        const stats = await NbVehiculesParRegion.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$somme_NB_VP_RECHARGEABLES_EL" },
                    moyenne: { $avg: "$somme_NB_VP_RECHARGEABLES_EL" },
                    max: { $max: "$somme_NB_VP_RECHARGEABLES_EL" },
                    min: { $min: "$somme_NB_VP_RECHARGEABLES_EL" }
                }
            }
        ]);

        // Trouver la région avec le plus de véhicules
        const regionMax = await NbVehiculesParRegion.findOne().sort({ somme_NB_VP_RECHARGEABLES_EL: -1 });

        // Trouver la région avec le moins de véhicules
        const regionMin = await NbVehiculesParRegion.findOne().sort({ somme_NB_VP_RECHARGEABLES_EL: 1 });

        return responseFormatter.success(res, {
            statistiques: stats[0],
            regionMax,
            regionMin
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques', error);
    }
};

// Obtenir le classement des régions par nombre de véhicules
exports.getVehiculesRegionRanking = async (req, res) => {
    try {
        const ranking = await NbVehiculesParRegion.find()
            .sort({ somme_NB_VP_RECHARGEABLES_EL: -1 });

        return responseFormatter.success(res, ranking);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération du classement des régions', error);
    }
};
