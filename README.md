**1. Configuration de l’environnement de développement**  
- **Installation de WebStorm sur macOS** : Téléchargez et installez l’IDE WebStorm depuis le site officiel de JetBrains. Assurez-vous que WebStorm fonctionne correctement sur le Mac (ou tout autre éditeur/IDE de votre choix si nécessaire).  
- **Configuration de Node.js et npm** : Installez Node.js (version LTS recommandée) sur votre machine. Cela installera également npm (le gestionnaire de paquets Node). Vérifiez l’installation en exécutant `node -v` et `npm -v` dans le terminal. Configurez éventuellement le chemin Node/npm si nécessaire.  
- **Installation et configuration de MongoDB Atlas** : Créez un compte sur MongoDB Atlas et créez un **cluster** MongoDB en ligne. Configurez un **nom d’utilisateur** et un **mot de passe** pour la base de données. Ajoutez l’**adresse IP** de votre machine (ou utilisez 0.0.0.0/0 en développement) aux IP autorisées pour vous connecter au cluster. Notez l’**URI de connexion** fourni par Atlas (il inclut l’hôte du cluster et les identifiants de connexion).  
- **Mise en place d’un fichier de configuration pour la connexion à la base** : Dans le projet, créez un fichier de configuration (par exemple un fichier `.env` pour les variables d’environnement ou un fichier config.js) contenant l’URI de connexion MongoDB Atlas et d’autres informations sensibles (comme les identifiants). Assurez-vous que ce fichier est **exclu du contrôle de version** (gitignore) afin de protéger les données sensibles.  
- **Gestion des accès pour chaque membre du groupe** : Sur MongoDB Atlas, ajoutez chaque membre du groupe de projet avec les permissions appropriées (par exemple en leur créant un compte ou en partageant les identifiants de connexion de façon sécurisée). Vérifiez que chaque membre peut se connecter à la base de données. En parallèle, assurez-vous que tous les membres disposent de l’environnement de développement configuré (Node, WebStorm, accès au repo du projet, etc.).  

**2. Développement du back-end avec Node.js et Express**  
- **Initialisation du projet avec npm** : Créez un dossier de projet backend, puis initialisez-le avec `npm init` pour générer un fichier `package.json`. Renseignez les informations de base (nom, version, etc.) ou utilisez `npm init -y` pour les valeurs par défaut.  
- **Installation des bibliothèques nécessaires** : Installez les dépendances back-end essentielles via npm : par exemple `express` (framework web), `mongoose` ou `mongodb` (pour interagir avec MongoDB), `dotenv` (pour gérer les variables d’environnement), éventuellement `cors` (si le front-end est sur un domaine/port différent), et d’autres librairies utiles. Par exemple : `npm install express mongoose dotenv cors`.  
- **Connexion à MongoDB Atlas** : Dans le code (par ex. un fichier `index.js` ou `app.js`), utilisez Mongoose ou le pilote MongoDB pour vous connecter à la base de données Atlas. Chargez l’URI de connexion depuis le fichier de configuration/variables d’environnement (process.env). Gérez les événements de connexion (succès ou erreur) pour confirmer que l’application se connecte bien à la base au démarrage.  
- **Organisation de la structure du projet** : Organisez le code serveur en suivant les bonnes pratiques. Par exemple, créez des dossiers pour les **modèles** (schemas Mongoose pour BornesElectriques, Region, etc.), les **routes** (définition des routes Express pour chaque ressource API), et les **contrôleurs** (logique métier pour traiter les requêtes, si le projet le justifie). Séparez l’app.js (configuration de l’app Express) des fichiers de route. Assurez-vous que le tout reste clair et maintenable.  
- **Création des routes API** : Développez les routes RESTful nécessaires pour interagir avec les collections MongoDB:  
  - *BornesElectriques* : route(s) pour récupérer la liste des bornes, ajouter une borne, etc.  
  - *NbVehiculesParRegion* : route pour récupérer le nombre de véhicules électriques par région.  
  - *Region* : route pour récupérer les informations de région (et possiblement créer/mettre à jour si nécessaire).  
  - *NbVehiculesParCommune* : route pour accéder aux statistiques par commune.  
  - *DepartementEtRegion* : route pour obtenir la correspondance entre départements et régions.  
  Implémentez les méthodes HTTP appropriées (GET pour lecture, POST pour ajout, PUT/PATCH pour mise à jour, DELETE si suppression nécessaire). Utilisez Mongoose pour faire les requêtes sur MongoDB Atlas et renvoyer les résultats en JSON.  
- **Tests des routes API avec Postman** : Une fois les routes créées, testez-les une par une en utilisant un outil comme Postman ou Insomnia. Vérifiez que chaque endpoint renvoie les données attendues ou effectue l’action prévue (par ex., que GET /bornes renvoie la liste des bornes électriques depuis la base). Testez également les cas d’erreur (par ex., demande d’une ressource qui n’existe pas) pour vous assurer que le back-end gère correctement les erreurs et renvoie des codes HTTP appropriés.  

**3. Développement du front-end en JavaScript**  
- **Choix de la méthode pour le front-end** : Optez pour la solution la plus simple pour ce projet. Si l’interface est basique, un front-end en **JavaScript Vanilla** (pur) peut suffire avec éventuellement un peu de **HTML/CSS**. Si l’application nécessite une interface utilisateur plus dynamique ou structurée, envisagez un framework léger comme **Vue.js** (ou React/Angular si déjà familiers, mais cela ajoute de la complexité). Le but est d’avoir une base simple à maintenir par tous les membres du groupe.  
- **Structuration des fichiers du front-end** : Créez un répertoire dédié au front-end (si le projet n’est pas monolithique) ou servez des fichiers statiques via Express. Organisez les fichiers en séparant le HTML, le CSS et le JS. Si vous utilisez un framework comme Vue.js, mettez en place la structure de projet correspondante (composants, etc.). Sinon, avec du JavaScript simple, créez par exemple un fichier `index.html` principal, un fichier `app.js` pour la logique front-end, et des fichiers CSS pour le style.  
- **Création des pages et composants de l’interface utilisateur** : Concevez l’interface utilisateur. Par exemple, une page d’accueil avec un aperçu des statistiques globales, une page ou section pour les détails par région, etc. Créez les éléments HTML nécessaires (boutons, menus, conteneurs pour les graphiques et la carte). Si usage d’un framework, créez les composants (par ex. un composant `StatsRegional` pour afficher les stats par région, un composant `CarteBornes` pour la carte des bornes, etc.). Assurez une navigation claire entre les différentes vues (par exemple via un menu ou des onglets).  
- **Connexion du front-end au back-end via API** : Écrivez le code JavaScript pour appeler les routes API que vous avez créées. Utilisez la fonction `fetch()` (ou Axios) pour envoyer des requêtes HTTP vers le back-end et récupérer les données JSON. Par exemple, appeler l’endpoint `/api/nbVehiculesParRegion` pour obtenir le nombre de véhicules par région et afficher ces données dans la page. Gérez les réponses asynchrones avec des promesses ou `async/await`. Implémentez un retour visuel pour l’utilisateur pendant le chargement des données (spinner ou message de chargement). Vérifiez que le front-end reçoit bien les données du back-end et les affiche correctement.  

**4. Mise en place des visualisations et de la carte interactive**  
- **Intégration d’une bibliothèque de graphiques** : Pour représenter visuellement les statistiques (par ex. le nombre de véhicules électriques par région ou commune), intégrez une bibliothèque de graphiques telle que **Chart.js** (simple à utiliser) ou **D3.js** (plus puissant mais plus complexe). Par exemple, utilisez un graphique en barres ou un graphique en secteurs pour montrer la part des véhicules par région. Installez la bibliothèque choisie (via `<script>` CDN dans le HTML, ou via npm si application front-end construite) et créez un ou plusieurs graphiques alimentés par les données reçues de l’API.  
- **Affichage des statistiques** : Sur la page appropriée, affichez les chiffres clés (par exemple, le total de véhicules électriques, la région ayant le plus de véhicules, etc.) de manière claire. Utilisez des composants visuels attrayants (graphiques, compteurs) pour rendre ces données faciles à comprendre. Chaque statistique ou graphique doit être mis à jour dynamiquement avec les données en direct depuis la base via l’API.  
- **Mise en place d’une carte interactive** : Intégrez une carte pour visualiser des informations géographiques liées aux véhicules électriques. Pour cela, utilisez une bibliothèque comme **Leaflet.js** (libre et facile à manipuler) ou l’API Google Maps. La carte pourrait afficher, par exemple, les **bornes de recharge électriques** (points localisés) ou utiliser un code couleur par région en fonction du nombre de véhicules. Configurez la carte pour qu’elle se centre sur la zone géographique voulue (par exemple, la France si les données sont françaises).  
- **Liaison des données de la base avec la carte** : Récupérez depuis l’API les données nécessaires pour la carte (par exemple la liste des bornes avec leurs coordonnées GPS, ou la liste des régions avec une valeur numérique). Utilisez ces données pour ajouter des **marqueurs** sur la carte (dans le cas des bornes de recharge, chaque borne = un marqueur avec éventuellement un pop-up affichant des détails). Si vous affichez des données par région, utilisez un calque géographique (GeoJSON des régions) et appliquez un style en fonction des données (par exemple coloration d’une région en fonction du nombre de véhicules). Assurez-vous que l’interaction est fluide – par exemple, possibilité de cliquer sur un marqueur ou une région pour afficher plus d’infos. Testez que la carte affiche bien toutes les données attendues.  

**5. Finalisation et tests**  
- **Tests de bout en bout des fonctionnalités** : Effectuez des tests complets de l’application. Par exemple, lancez le back-end et le front-end ensemble et parcourez toutes les fonctionnalités comme le ferait un utilisateur lambda. Vérifiez la chaîne complète : le front-end envoie bien les requêtes, le back-end répond correctement et les données s’affichent côté client. Testez différents scénarios, y compris des cas limites (aucune donnée, données très volumineuses, etc.). Si possible, réalisez ces tests sur différents navigateurs et appareils pour assurer la compatibilité.  
- **Correction des bugs et optimisation du code** : À la suite des tests, corrigez tous les problèmes rencontrés. Cela peut inclure des bugs fonctionnels (une route API qui plante sur un cas particulier, un affichage incorrect sur la carte, etc.) ou des problèmes de performance (requêtes trop lentes, front-end qui rame avec beaucoup de données). Optimisez le code si nécessaire : par exemple, améliorez les requêtes MongoDB en ajoutant des filtres ou des index sur les collections Atlas, nettoyez le code front-end et factorisez les fonctions répétitives. Assurez-vous également que la structure du projet est bien organisée et que le code est lisible (mise en forme, commentaires si besoin).  
- **Documentation du projet** : Rédigez une documentation claire pour le projet. Incluez un **README** en racine du projet expliquant comment installer et lancer l’application (instructions pour installer les dépendances, configurer les variables d’environnement, lancer le serveur Node et le front-end, etc.). Documentez également l’**API** (liste des endpoints, paramètres attendus, structure des données renvoyées) pour que toute personne qui utilise ou teste l’application comprenne comment s’en servir. Si le projet est remis à un examinateur ou déployé, ajoutez toute information pertinente (par exemple, des identifiants de test, ou comment accéder à la démo en ligne). Enfin, assurez-vous que le code source final est versionné proprement (dernier commit fonctionnel, sans fichiers inutiles).  

En suivant ces étapes de manière organisée, le groupe pourra réaliser le projet d’application web sur les véhicules électriques de manière efficace et structurée. Chaque étape garantit que l’environnement est prêt, que le back-end et le front-end communiquent correctement, que les données sont présentées de façon interactive, et que l’application finale est fiable et bien documentée.
