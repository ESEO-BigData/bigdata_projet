const mongoose = require('mongoose');

const DepartementEtRegionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    DEPARTEMENT: {
        type: String,
        required: true
    },
    somme_NB_VP_RECHARGEABLES_EL: {
        type: Number,
        required: true
    },
    NOM: {
        type: String,
        required: true
    },
    REGION: {
        type: String,
        required: true
    },
    CHEF_LIEU: {
        type: String,
        required: true
    },
    "SUPERFICIE (km²)": {
        type: Number,
        required: true
    },
    POPULATION: {
        type: Number,
        required: true
    },
    "DENSITE (habitants/km2)": {
        type: Number,
        required: true
    },
    latitude_chef_lieu: {
        type: Number,
        required: false
    },
    longitude_chef_lieu: {
        type: Number,
        required: false
    },
    Nombre_Bornes: {
        type: Number,
        required: true
    },
    Nombre_stations: {
        type: Number,
        required: true
    },
    NB_VP: {
        type: Number,
        required: true
    }
}, {
    collection: 'DepartementEtRegion',
    timestamps: false
});

module.exports = mongoose.model('DepartementEtRegion', DepartementEtRegionSchema);
