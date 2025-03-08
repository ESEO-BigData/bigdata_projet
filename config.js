const config = {
    // Configuration de la base de données MongoDB
    mongodb: {
        uri: process.env.MONGODB_URI || "mongodb+srv://maximeguerin:LHbx52LVJ5Cbo6y9@dbbigdata.pjhrq.mongodb.net/VehiculesElectriques?retryWrites=true&w=majority",
        options: {
        }
    },
    // Autres configurations de ton application
    app: {
        port: process.env.PORT || 3000
    }
};

module.exports = config;
