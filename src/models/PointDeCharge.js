const mongoose = require('mongoose');

const PointDeChargeSchema = new mongoose.Schema({
    id_station_itinerance: { type: String, required: true },
    consolidated_latitude: { type: Number, required: true },
    consolidated_longitude: { type: Number, required: true },
    adresse_station: { type: String },
    consolidated_commune: { type: String },
    code_postal: { type: String, match: /^[0-9]{5}$/ },
    nombre_bornes: { type: Number, required: true },
    departement: { type: String },
    region: { type: String },
    ratio_bornes_points: { type: Number }
}, {
    collection: 'PointsdeCharge',
    timestamps: false
});

PointDeChargeSchema.index({ region: 1 });
PointDeChargeSchema.index({ departement: 1 });
PointDeChargeSchema.index({ consolidated_commune: 1 });

module.exports = mongoose.model('PointDeCharge', PointDeChargeSchema);
