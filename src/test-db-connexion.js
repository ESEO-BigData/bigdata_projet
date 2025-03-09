const { MongoClient } = require('mongodb');
const config = require('./config/config');

async function testConnection() {
    // Si options est vide, on peut simplement passer l'URI
    const client = new MongoClient(config.mongodb.uri);

    try {
        console.log('Tentative de connexion à MongoDB Atlas...');
        await client.connect();

        console.log('Connexion réussie à MongoDB Atlas!');

        // Liste les bases de données disponibles
        const databasesList = await client.db().admin().listDatabases();
        console.log('Bases de données disponibles:');
        databasesList.databases.forEach(db => {
            console.log(`- ${db.name}`);
        });

        // Liste les collections de la base de données spécifiée
        const dbName = config.mongodb.uri.split('/').pop().split('?')[0];
        const collections = await client.db(dbName).listCollections().toArray();
        console.log(`\nCollections dans la base de données '${dbName}':`);
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

    } catch (error) {
        console.error('Erreur de connexion à MongoDB Atlas:', error);
    } finally {
        await client.close();
        console.log('Connexion fermée');
    }
}

testConnection();
