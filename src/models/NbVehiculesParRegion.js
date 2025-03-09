const mongoose = require('mongoose');

const NbVehiculesParRegionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    REGION: {
        type: String,
        required: true
    },
    somme_NB_VP_RECHARGEABLES_EL: {
        type: Number,
        required: true
    }
}, {
    collection: 'NbVehiculesParRegion',
    timestamps: false
});

module.exports = mongoose.model('NbVehiculesParRegion', NbVehiculesParRegionSchema);
