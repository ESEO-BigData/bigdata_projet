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

// Obtenir le nombre de bornes par région
exports.getBornesByRegion = async (req, res) => {
    try {
        const regionName = req.params.regionName;

        // 1. Récupérer tous les départements de la région
        const departementsData = await DepartementEtRegion.find({ REGION: regionName });

        // 2. Récupérer toutes les communes de ces départements
        const codesDepartements = departementsData.map(dept => dept.DEPARTEMENT);
        const communesData = await NbVehiculesParCommune.find({
            codeDepartement: { $in: codesDepartements }
        });

        // 3. Compter les bornes pour chaque commune
        let totalBornes = 0;
        let totalPointsDeCharge = 0;

        for (const commune of communesData) {
            const bornes = await BorneElectrique.find({
                'properties.consolidated_commune': commune.LIBGEO
            });

            totalBornes += bornes.length;
            totalPointsDeCharge += bornes.reduce((sum, borne) => {
                return sum + (borne.properties.nbre_pdc || 0);
            }, 0);
        }

        return responseFormatter.success(res, {
            region: regionName,
            totalBornes,
            totalPointsDeCharge
        });
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des bornes par région', error);
    }
};

exports.getBornesElectriquesByAdresseOrId = async (req, res) => {
    try {
        const { adresse, id } = req.query;

        if (!adresse && !id) {
            return responseFormatter.badRequest(res, 'Paramètre "adresse" ou "id" requis');
        }

        const query = { $or: [] };
        if (adresse) query.$or.push({ 'properties.adresse_station': adresse });
        if (id) query.$or.push({ 'properties.id_station_itinerance': id });

        const bornes = await BorneElectrique.find(query);

        if (!bornes || bornes.length === 0) {
            return responseFormatter.notFound(res, 'Aucune borne correspondante trouvée');
        }

        let missingInfoCount = 0;
        let missingPaiement = 0;
        let missingPrise = 0;
        let missingPuissance = 0;
        let missingMultiple = 0;

        const formatted = bornes.map(borne => {
            const paiement = {
                acte: borne.properties.paiement_acte,
                autre: borne.properties.paiement_autre,
                cb: borne.properties.paiement_cb
            };

            const types_prise = {
                type2: borne.properties.prise_type_2,
                chademo: borne.properties.prise_type_chademo,
                combo_ccs: borne.properties.prise_type_combo_ccs,
                ef: borne.properties.prise_type_ef
            };

            const puissance_kw = borne.properties.puissance_nominale;

            const hasPaiement = paiement.acte || paiement.cb || paiement.autre;
            const hasPrise = types_prise.type2 || types_prise.chademo || types_prise.combo_ccs || types_prise.ef;
            const hasPuissance = puissance_kw !== undefined && puissance_kw !== null;

            let missing = 0;
            if (!hasPaiement) { missing++; missingPaiement++; }
            if (!hasPrise) { missing++; missingPrise++; }
            if (!hasPuissance) { missing++; missingPuissance++; }
            if (missing > 1) missingMultiple++;
            if (missing > 0) missingInfoCount++;

            return { paiement, types_prise, puissance_kw };
        });

        /*console.log(`📊 Vérification des données complémentaires :`);
        console.log(`→ Total de points de charge trouvés : ${bornes.length}`);
        console.log(`→ Points sans informations complètes : ${missingInfoCount}`);
        console.log(`   - Sans info puissance : ${missingPuissance}`);
        console.log(`   - Sans info type de prise : ${missingPrise}`);
        console.log(`   - Sans info méthode de paiement : ${missingPaiement}`);
        console.log(`   - Manquent ≥ 2 types d'information : ${missingMultiple}`);*/

        return responseFormatter.success(res, formatted);
    } catch (error) {
        return responseFormatter.error(res, 'Erreur lors de la récupération des détails des bornes', error);
    }
};


