const mongoose = require('mongoose');

const BornesCommuneDepartementRegionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    commune: {
        type: String,
        required: true
    },
    nombre_bornes: {
        type: Number,
        required: true
    },
    departement: {
        type: String,
        required: true
    },
    code_departement: {
        type: String,
        required: true,
        match: /^[0-9A-Z]{2}$/
    },
    region: {
        type: String,
        required: true
    },
    code_postal: {
        type: String,
        required: true,
        match: /^[0-9]{5}$/
    }
}, {
    collection: 'BornesCommuneDepartementRegion',
    timestamps: false
});

// Indexation pour améliorer les performances des requêtes
BornesCommuneDepartementRegionSchema.index({ commune: 1 });
BornesCommuneDepartementRegionSchema.index({ code_departement: 1 });
BornesCommuneDepartementRegionSchema.index({ region: 1 });

module.exports = mongoose.model('BornesCommuneDepartementRegion', BornesCommuneDepartementRegionSchema);
