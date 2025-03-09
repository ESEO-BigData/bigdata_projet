const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    code: String,
    nom: String,
    geometry: {
        type: {
            type: String,
            enum: ['Polygon', 'MultiPolygon'],
            default: 'Polygon'
        },
        coordinates: [[[Number]]]
    }
}, {
    collection: 'Regions',
    timestamps: false
});

// Indexation géospatiale
RegionSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Region', RegionSchema);
