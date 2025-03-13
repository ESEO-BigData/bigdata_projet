const mongoose = require('mongoose');

const BornesCommuneDepartementRegionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    commune: {
        type: String,
        required: true
    },
    nombre_bornes: {
        type: Number,
        default: 0
    },
    nombre_points_charge: {
        type: Number,
        default: 0
    },
    ratio_bornes_points: {
        type: Number,
        default: 0
    },
    NB_VP_RECHARGEABLES_EL: {
        type: Number,
        default: 0
    },
    NB_VP_RECHARGEABLES_GAZ: {
        type: Number,
        default: 0
    },
    NB_VP: {
        type: Number,
        default: 0
    },
    departement: {
        type: String,
        required: true
    },
    code_departement: {
        type: String,
        required: true,
        match: /^[0-9A-Z]{2}$/  // Format 2 caractères
    },
    region: {
        type: String,
        required: true
    },
    code_postal: {
        type: String,
        required: true,
        match: /^[0-9]{5}$/  // Format 5 caractères
    }
}, {
    collection: 'BornesCommuneDepartementRegion',
    timestamps: false
});

// Créer des index pour améliorer les performances des requêtes
BornesCommuneDepartementRegionSchema.index({ commune: 1 });
BornesCommuneDepartementRegionSchema.index({ code_departement: 1 });
BornesCommuneDepartementRegionSchema.index({ region: 1 });
BornesCommuneDepartementRegionSchema.index({ code_postal: 1 });

module.exports = mongoose.model('BornesCommuneDepartementRegion', BornesCommuneDepartementRegionSchema);
