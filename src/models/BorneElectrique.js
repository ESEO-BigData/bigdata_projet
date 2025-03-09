const mongoose = require('mongoose');

// Schéma pour les propriétés de la borne
const PropertiesSchema = new mongoose.Schema({
    accessibilite_pmr: Boolean,
    adresse_station: String,
    code_insee_commune: String,
    condition_acces: String,
    consolidated_code_postal: String,
    consolidated_commune: String,
    consolidated_latitude: Number,
    consolidated_longitude: Number,
    contact_amenageur: String,
    contact_operateur: String,
    created_at: Date,
    date_maj: Date,
    date_mise_en_service: Date,
    gratuit: Boolean,
    horaires: String,
    id_pdc_itinerance: String,
    id_pdc_local: String,
    id_station_itinerance: String,
    id_station_local: String,
    implantation_station: String,
    nbre_pdc: Number,
    nom_amenageur: String,
    nom_enseigne: String,
    nom_operateur: String,
    nom_station: String,
    observations: String,
    paiement_acte: Boolean,
    paiement_autre: Boolean,
    paiement_cb: Boolean,
    prise_type_2: Boolean,
    prise_type_autre: Boolean,
    prise_type_chademo: Boolean,
    prise_type_combo_ccs: Boolean,
    prise_type_ef: Boolean,
    puissance_nominale: Number,
    raccordement: String,
    reservation: Boolean,
    restriction_gabarit: Boolean,
    station_deux_roues: Boolean,
    tarification: String,
    telephone_operateur: String
}, { _id: false });

// Schéma principal pour les bornes électriques
const BorneElectriqueSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: {
        type: String,
        default: "Feature"
    },
    properties: PropertiesSchema,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    }
}, {
    collection: 'BornesElectriques',
    timestamps: false
});

// Indexation géospatiale pour la recherche de proximité
BorneElectriqueSchema.index({ 'geometry.coordinates': '2dsphere' });

module.exports = mongoose.model('BorneElectrique', BorneElectriqueSchema);
