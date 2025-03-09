const express = require('express');
const connectDB = require('./db/connexion');
const routes = require('./routes/index');
const config = require('./config/config');

// Initialisation de l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour les CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Routes de l'API
app.use('/api', routes);

// Middleware pour gérer les routes non trouvées
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Démarrage du serveur
const PORT = config.app.port;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
    console.error('Erreur non gérée:', err.message);
    // Ne pas arrêter le serveur en production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});
