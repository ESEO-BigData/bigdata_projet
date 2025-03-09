const BorneElectrique = require('../models/BorneElectrique');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer toutes les bornes (avec pagination)
exports.getAllBornes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bornes = await BorneElectrique.find()
            .skip(skip)
            .limit(limit);

        const total = await BorneElectrique.countDocuments();

        return responseFormatter.success(res, {
            bornes,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des bornes', error);
    }
};

// Récupérer une borne par son ID
exports.getBorneById = async (req, res) => {
    try {
        const borne = await BorneElectrique.findById(req.params.id);

        if (!borne) {
            return responseFormatter.notFound(res, 'Borne non trouvée');
        }

        return responseFormatter.success(res, borne);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération de la borne', error);
    }
};

// Rechercher des bornes par commune
exports.getBornesByCommune = async (req, res) => {
    try {
        const commune = req.params.commune;
        const bornes = await BorneElectrique.find({
            'properties.consolidated_commune': new RegExp(commune, 'i')
        });

        return responseFormatter.success(res, bornes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la recherche des bornes par commune', error);
    }
};

// Rechercher des bornes par code postal
exports.getBornesByCodePostal = async (req, res) => {
    try {
        const codePostal = req.params.codePostal;
        const bornes = await BorneElectrique.find({
            'properties.consolidated_code_postal': codePostal
        });

        return responseFormatter.success(res, bornes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la recherche des bornes par code postal', error);
    }
};

// Rechercher des bornes par département
exports.getBornesByDepartement = async (req, res) => {
    try {
        const codeDepartement = req.params.codeDepartement;
        // Le code postal français commence par le code du département
        const bornes = await BorneElectrique.find({
            'properties.consolidated_code_postal': new RegExp('^' + codeDepartement)
        });

        return responseFormatter.success(res, bornes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la recherche des bornes par département', error);
    }
};

// Rechercher des bornes à proximité (géospatial)
exports.getBornesProximite = async (req, res) => {
    try {
        const { longitude, latitude, distance = 5000 } = req.query; // distance en mètres

        if (!longitude || !latitude) {
            return responseFormatter.badRequest(res, 'Les coordonnées (longitude et latitude) sont requises');
        }

        const bornes = await BorneElectrique.find({
            'geometry': {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(distance)
                }
            }
        }).limit(20);

        return responseFormatter.success(res, bornes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la recherche des bornes à proximité', error);
    }
};

// Filtrer les bornes par type de prise
exports.getBornesByTypePrise = async (req, res) => {
    try {
        const typePrise = req.params.typePrise;
        let query = {};

        switch(typePrise.toLowerCase()) {
            case 'type2':
                query = { 'properties.prise_type_2': true };
                break;
            case 'chademo':
                query = { 'properties.prise_type_chademo': true };
                break;
            case 'comboccs':
                query = { 'properties.prise_type_combo_ccs': true };
                break;
            case 'ef':
                query = { 'properties.prise_type_ef': true };
                break;
            default:
                return responseFormatter.badRequest(res, 'Type de prise non reconnu');
        }

        const bornes = await BorneElectrique.find(query).limit(100);
        return responseFormatter.success(res, bornes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la recherche des bornes par type de prise', error);
    }
};

// Obtenir des statistiques sur les bornes
exports.getBornesStats = async (req, res) => {
    try {
        const stats = await BorneElectrique.aggregate([
            {
                $group: {
                    _id: null,
                    totalBornes: { $sum: 1 },
                    totalPointsDeCharge: { $sum: '$properties.nbre_pdc' },
                    puissanceMoyenne: { $avg: '$properties.puissance_nominale' },
                    bornesGratuites: {
                        $sum: { $cond: [{ $eq: ['$properties.gratuit', true] }, 1, 0] }
                    },
                    bornesPayantes: {
                        $sum: { $cond: [{ $eq: ['$properties.gratuit', false] }, 1, 0] }
                    }
                }
            }
        ]);

        // Statistiques par type de prise
        const statsPrises = await BorneElectrique.aggregate([
            {
                $group: {
                    _id: null,
                    type2: { $sum: { $cond: [{ $eq: ['$properties.prise_type_2', true] }, 1, 0] } },
                    chademo: { $sum: { $cond: [{ $eq: ['$properties.prise_type_chademo', true] }, 1, 0] } },
                    comboCCS: { $sum: { $cond: [{ $eq: ['$properties.prise_type_combo_ccs', true] }, 1, 0] } },
                    ef: { $sum: { $cond: [{ $eq: ['$properties.prise_type_ef', true] }, 1, 0] } }
                }
            }
        ]);

        return responseFormatter.success(res, {
            general: stats[0],
            typesPrises: statsPrises[0]
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques des bornes', error);
    }
};
