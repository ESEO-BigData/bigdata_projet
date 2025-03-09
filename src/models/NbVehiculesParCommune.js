const mongoose = require('mongoose');

const NbVehiculesParCommuneSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codePostal: String,
    codeCommune: String,
    nomCommune: String,
    codeDepartement: String,
    nbVehicules: Number
}, {
    collection: 'NbVehiculesParCommune',
    timestamps: false
});

module.exports = mongoose.model('NbVehiculesParCommune', NbVehiculesParCommuneSchema);
