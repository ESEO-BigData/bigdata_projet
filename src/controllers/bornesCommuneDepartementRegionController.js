const BornesCommuneDepartementRegion = require('../models/BornesCommuneDepartementRegion');
const responseFormatter = require('../utils/responseFormatter');

// Récupérer toutes les bornes par commune (avec pagination)
exports.getAllBornesCommune = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const bornesCommune = await BornesCommuneDepartementRegion.find()
            .skip(skip)
            .limit(limit);

        const total = await BornesCommuneDepartementRegion.countDocuments();

        return responseFormatter.success(res, {
            bornesCommune,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des bornes par commune', error);
    }
};

// Récupérer les bornes par commune
exports.getBornesByCommune = async (req, res) => {
    try {
        const commune = req.params.commune;
        const bornes = await BornesCommuneDepartementRegion.findOne({
            commune: new RegExp(commune, 'i')
        });

        if (!bornes) {
            return responseFormatter.notFound(res, 'Données de bornes pour cette commune non trouvées');
        }

        return responseFormatter.success(res, bornes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des bornes pour cette commune', error);
    }
};

// Récupérer les bornes par département
exports.getBornesByDepartement = async (req, res) => {
    try {
        const codeDepartement = req.params.codeDepartement;
        const bornes = await BornesCommuneDepartementRegion.find({ code_departement: codeDepartement });

        if (bornes.length === 0) {
            return responseFormatter.notFound(res, 'Données de bornes pour ce département non trouvées');
        }

        // Calculer le total des bornes pour ce département
        const totalBornes = bornes.reduce((total, commune) => total + commune.nombre_bornes, 0);

        return responseFormatter.success(res, {
            communes: bornes,
            totalBornes,
            nombreCommunes: bornes.length
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des bornes pour ce département', error);
    }
};

// Récupérer les bornes par région
exports.getBornesByRegion = async (req, res) => {
    try {
        const region = req.params.region;
        const bornes = await BornesCommuneDepartementRegion.find({
            region: new RegExp(region, 'i')
        });

        if (bornes.length === 0) {
            return responseFormatter.notFound(res, 'Données de bornes pour cette région non trouvées');
        }

        // Calculer le total des bornes pour cette région
        const totalBornes = bornes.reduce((total, commune) => total + commune.nombre_bornes, 0);

        // Regrouper par département
        const departementsMap = {};
        bornes.forEach(commune => {
            if (!departementsMap[commune.code_departement]) {
                departementsMap[commune.code_departement] = {
                    code: commune.code_departement,
                    nom: commune.departement,
                    nombre_bornes: 0,
                    communes: []
                };
            }
            departementsMap[commune.code_departement].nombre_bornes += commune.nombre_bornes;
            departementsMap[commune.code_departement].communes.push({
                nom: commune.commune,
                nombre_bornes: commune.nombre_bornes,
                code_postal: commune.code_postal
            });
        });

        const departements = Object.values(departementsMap);

        return responseFormatter.success(res, {
            region,
            totalBornes,
            nombreCommunes: bornes.length,
            nombreDepartements: departements.length,
            departements
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des bornes pour cette région', error);
    }
};

// Obtenir les communes avec le plus de bornes
exports.getTopCommunesBornes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topCommunes = await BornesCommuneDepartementRegion.find()
            .sort({ nombre_bornes: -1 })
            .limit(limit);

        return responseFormatter.success(res, topCommunes);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des communes avec le plus de bornes', error);
    }
};

// Obtenir des statistiques sur les bornes par région
exports.getBornesStatsByRegion = async (req, res) => {
    try {
        const stats = await BornesCommuneDepartementRegion.aggregate([
            {
                $group: {
                    _id: "$region",
                    totalBornes: { $sum: "$nombre_bornes" },
                    nombreCommunes: { $sum: 1 }
                }
            },
            {
                $project: {
                    region: "$_id",
                    _id: 0,
                    totalBornes: 1,
                    nombreCommunes: 1
                }
            },
            { $sort: { totalBornes: -1 } }
        ]);

        return responseFormatter.success(res, stats);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors du calcul des statistiques des bornes par région', error);
    }
};
