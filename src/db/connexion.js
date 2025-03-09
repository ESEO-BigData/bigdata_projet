const mongoose = require('mongoose');
const config = require('../config/config');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log('Connexion à MongoDB établie avec succès');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
