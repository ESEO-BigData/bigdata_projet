# Projet d'Analyse des Véhicules Électriques en France

Ce projet vise à développer une application web complète en JavaScript pour analyser et visualiser des données relatives aux véhicules électriques en France. L'application exploite une base de données MongoDB Atlas existante et propose diverses visualisations interactives.

## Contexte du projet

Ce projet est réalisé dans le cadre d'une formation en école d'ingénieur et se concentre sur l'analyse de données liées à la mobilité électrique en France. L'objectif est de créer une application permettant d'explorer et d'analyser différentes données concernant:

- Les bornes de recharge électriques
- La répartition des véhicules électriques par région et commune
- Les caractéristiques démographiques des territoires

## Architecture technique

L'application est entièrement développée en JavaScript avec:

- **Back-end**: Node.js
- **Front-end**: JavaScript vanilla ou framework front-end léger
- **Base de données**: MongoDB Atlas (déjà configurée)
- **Déploiement**: Local uniquement (localhost)

## Structure de la base de données

La base de données "VehiculesElectriques" contient 7 collections principales :

### 1. BornesElectriques (123 749 documents)
Contient les informations sur les bornes de recharge en France avec les champs suivants :
- `_id`: Identifiant unique ObjectId
- `type`: Type de donnée (généralement "Feature")
- `properties`: Objet contenant les détails de la borne
  - `accessibilite_pmr`: Accessibilité pour personnes à mobilité réduite
  - `adresse_station`: Adresse complète
  - `code_insee_commune`: Code INSEE de la commune
  - `condition_acces`: Conditions d'accès à la borne
  - `consolidated_code_postal`: Code postal
  - `consolidated_commune`: Nom de la commune
  - `consolidated_latitude`: Coordonnée GPS latitude
  - `consolidated_longitude`: Coordonnée GPS longitude
  - `contact_amenageur`: Email de contact de l'aménageur
  - `contact_operateur`: Email de contact de l'opérateur
  - `created_at`: Date de création de l'entrée
  - `date_maj`: Date de mise à jour
  - `date_mise_en_service`: Date de mise en service
  - `gratuit`: Gratuité du service (true/false)
  - `horaires`: Horaires d'ouverture
  - `id_pdc_itinerance`: Identifiant du point de charge en itinérance
  - `id_pdc_local`: Identifiant local du point de charge
  - `id_station_itinerance`: Identifiant de la station en itinérance
  - `id_station_local`: Identifiant local de la station
  - `implantation_station`: Type d'implantation
  - `nbre_pdc`: Nombre de points de charge
  - `nom_amenageur`: Nom de l'aménageur
  - `nom_enseigne`: Nom de l'enseigne
  - `nom_operateur`: Nom de l'opérateur
  - `nom_station`: Nom de la station
  - `observations`: Commentaires ou observations
  - `paiement_acte`: Paiement à l'acte (true/false)
  - `paiement_autre`: Autre mode de paiement (true/false)
  - `paiement_cb`: Paiement par carte bancaire (true/false)
  - `prise_type_2`: Disponibilité de prise Type 2 (true/false)
  - `prise_type_autre`: Disponibilité d'autres types de prises (true/false)
  - `prise_type_chademo`: Disponibilité de prise CHAdeMO (true/false)
  - `prise_type_combo_ccs`: Disponibilité de prise Combo CCS (true/false)
  - `prise_type_ef`: Disponibilité de prise EF (true/false)
  - `puissance_nominale`: Puissance nominale en kW
  - `raccordement`: Type de raccordement
  - `reservation`: Possibilité de réservation (true/false)
  - `restriction_gabarit`: Restrictions de gabarit
  - `station_deux_roues`: Station pour deux-roues (true/false)
  - `tarification`: Informations sur la tarification
  - `telephone_operateur`: Numéro de téléphone de l'opérateur

### 2. NbVehiculesParRegion (13 documents)
Contient le nombre total de véhicules électriques rechargeables par région :
- `_id`: Identifiant unique ObjectId
- `REGION`: Nom de la région
- `somme_NB_VP_RECHARGEABLES_EL`: Nombre total de véhicules électriques rechargeables dans la région

### 3. Region (101 documents)
Contient des informations détaillées sur les régions :
- `_id`: Identifiant unique ObjectId
- `NUMÉRO`: Numéro du département
- `NOM`: Nom du département
- `REGION`: Nom de la région d'appartenance
- `CHEF LIEU`: Ville chef-lieu
- `SUPERFICIE (km²)`: Superficie en kilomètres carrés
- `POPULATION`: Nombre d'habitants
- `DENSITE (habitants/km2)`: Densité de population

### 4. NbVehiculesParCommune (35 193 documents)
Contient les données sur les véhicules par commune :
- `_id`: Identifiant unique ObjectId
- `CODGEO`: Code géographique de la commune
- `LIBGEO`: Nom de la commune
- `EPCI`: Code de l'Établissement Public de Coopération Intercommunale
- `LIBEPCI`: Nom de l'EPCI
- `DATE_ARRETE`: Date de l'arrêté des données
- `NB_VP_RECHARGEABLES_EL`: Nombre de véhicules particuliers électriques rechargeables
- `NB_VP_RECHARGEABLES_GAZ`: Nombre de véhicules particuliers à gaz rechargeables
- `NB_VP`: Nombre total de véhicules particuliers

### 5. DepartementEtRegion (97 documents)
Contient des informations croisées sur les départements et régions :
- `_id`: Identifiant unique ObjectId
- `DEPARTEMENT`: Numéro du département
- `somme_NB_VP_RECHARGEABLES_EL`: Nombre total de véhicules électriques rechargeables dans le département
- `NOM`: Nom du département
- `REGION`: Nom de la région d'appartenance
- `CHEF LIEU`: Ville chef-lieu
- `SUPERFICIE (km²)`: Superficie en kilomètres carrés
- `POPULATION`: Nombre d'habitants
- `DENSITE (habitants/km2)`: Densité de population

### 6. BornesCommuneDepartementRegion (5837 documents)
Contient les données sur les bornes de recharge électrique par commune :
- `_id`: Identifiant unique ObjectId
- `commune`: Nom de la commune
- `nombre_bornes`: Nombre de bornes de recharge dans la commune
- `nombre_points_charge`: Nombre de points de recharge dans la commune
- `ratio_bornes_points`: Ratio du nombre de bornes sur le nombre de point de charge
- `NB_VP_RECHARGEABLES_EL`: Nombre de véhicules électrique (Nombre entier)
- `NB_VP_RECHARGEABLES_GAZ`: Nombre de véhicules au gaz (Nombre entier)
- `NB_VP`: Nombre de véhicules personnel thermique (Nombre entier)
- `departement`: Nom du département
- `code_departement`: Code du département (format 2 caractères)
- `region`: Nom de la région d'appartenance
- `code_postal`: Code postal de la commune (format 5 caractères)

### 7. PointsdeCharge (31789 documents)
Contient les données des points de recharge électrique :
- `_id` : Identifiant unique ObjectId
- `id_station_itinerance` : Identifiant de la station d'itinérance
- `consolidated_latitude` : Latitude consolidée de la station
- `consolidated_longitude` : Longitude consolidée de la station
- `adresse_station` : Adresse complète de la station
- `consolidated_commune` : Nom de la commune où se situe la station
- `code_postal` : Code postal de la commune (format 5 caractères)
- `nombre_bornes` : Nombre de bornes de recharge à la station (Nombre entier)
- `departement` : Nom du département de localisation
- `region` : Nom de la région d'appartenance
- `ratio_bornes_points` : Ratio du nombre de bornes sur le nombre de points de charge


## Fonctionnalités principales

L'application permettra de:

1. **Visualiser la répartition géographique** des bornes de recharge et des véhicules électriques sur une carte interactive de la France
2. **Explorer les données par territoire** (région, département, commune) avec des statistiques détaillées
3. **Analyser les corrélations** entre différentes variables (densité de population, nombre de bornes, nombre de véhicules)
4. **Générer des graphiques et tableaux de bord** pour une compréhension rapide des données
5. **Filtrer les données** selon différents critères pour des analyses personnalisées

## Valeur ajoutée

Cette application permettra de:
- Identifier les zones bien équipées en infrastructures de recharge
- Repérer les disparités territoriales dans l'adoption des véhicules électriques
- Analyser les facteurs potentiels influençant la transition vers la mobilité électrique
- Fournir des données objectives pour la planification d'infrastructures futures

Le projet est hébergé sur GitHub à l'adresse: https://github.com/ESEO-BigData/bigdata_projet


# Plan du projet sur les véhicules électriques.

## Phase 0 : Configuration initiale (déjà réalisée)

Vous avez déjà configuré l'environnement de développement avec WebStorm sur MacOS et mis en place la structure du projet sur GitHub, incluant les configurations nécessaires pour la connexion à MongoDB Atlas et la gestion des accès pour les membres du groupe.

## Phase 1 : Mise en place du Back-end

### Lot 1.1 : Configuration de base du serveur Node.js

- Installer les dépendances essentielles (Express, Mongoose, dotenv, cors)
- Créer le fichier server.js pour initialiser le serveur Express
- Configurer les middlewares de base (express.json, cors)
- Mettre en place la gestion des variables d'environnement avec dotenv


### Lot 1.2 : Connexion à MongoDB Atlas

- Créer un fichier de configuration pour la connexion à la base de données
- Implémenter la logique de connexion avec Mongoose
- Mettre en place un système de gestion des erreurs de connexion
- Tester la connexion à la base de données


### Lot 1.3 : Modélisation des données

- Créer les modèles Mongoose pour chaque collection :
  - BornesElectriques
  - NbVehiculesParRegion
  - Region
  - NbVehiculesParCommune
  - DepartementEtRegion
- Définir les schémas avec les types de données appropriés
- Ajouter des méthodes statiques utiles pour les requêtes fréquentes


### Lot 1.4 : Développement des contrôleurs

- Créer un contrôleur pour les bornes électriques (récupération, filtrage)
- Créer un contrôleur pour les véhicules par région
- Créer un contrôleur pour les informations régionales
- Créer un contrôleur pour les véhicules par commune
- Créer un contrôleur pour les départements et régions
- Implémenter des fonctions d'agrégation pour les statistiques


### Lot 1.5 : Configuration des routes API

- Définir les routes pour les bornes électriques
- Définir les routes pour les données de véhicules par région
- Définir les routes pour les informations régionales
- Définir les routes pour les données de véhicules par commune
- Définir les routes pour les départements et régions
- Créer des routes spécifiques pour les statistiques agrégées


### Lot 1.6 : Tests et validation du back-end

- Tester chaque route avec Postman ou un outil similaire
- Vérifier la performance des requêtes à la base de données
- Optimiser les requêtes si nécessaire (indexation, projections)
- Documenter les endpoints API


## Phase 2 : Développement du Front-end

### Lot 2.1 : Structure de base et configuration

- Mettre en place la structure des fichiers (HTML, CSS, JS)
- Installer les bibliothèques nécessaires (D3.js, Leaflet, Chart.js)
- Configurer webpack ou un autre bundler si nécessaire
- Créer la page d'accueil et la structure de navigation


### Lot 2.2 : Développement de la carte interactive

- Intégrer Leaflet pour la carte de France
- Configurer les couches de base de la carte
- Implémenter le découpage des régions et départements
- Ajouter les interactions (clic, survol) sur les régions
- Créer les popups d'information


### Lot 2.3 : Visualisation des bornes électriques

- Développer la logique de récupération des données de bornes
- Créer les marqueurs pour les bornes sur la carte
- Implémenter le clustering pour gérer la densité des bornes
- Ajouter des filtres (puissance, disponibilité, etc.)
- Créer une légende explicative


### Lot 2.4 : Visualisation des données de véhicules électriques

- Créer des graphiques pour la répartition des véhicules par région
- Développer des visualisations pour les données par commune
- Implémenter une fonction de recherche par commune
- Ajouter des indicateurs de comparaison entre régions


### Lot 2.5 : Tableaux de bord et statistiques

- Créer un tableau de bord principal avec les KPIs essentiels
- Développer des graphiques de tendance et de répartition
- Implémenter des visualisations pour les corrélations (densité de population vs. bornes)
- Ajouter des fonctionnalités d'export de données


### Lot 2.6 : Fonctionnalités avancées

- Développer un système de filtres croisés
- Implémenter des analyses comparatives entre régions
- Créer des visualisations de densité (heatmaps)
- Ajouter des fonctionnalités de projection et prévision


### Lot 2.7 : Responsive design et optimisation

- Adapter l'interface pour différentes tailles d'écran
- Optimiser le chargement des données volumineuses
- Améliorer les performances de rendu des visualisations
- Tester sur différents navigateurs


## Phase 3 : Intégration et finalisation

### Lot 3.1 : Intégration back-end/front-end

- Connecter toutes les visualisations aux endpoints API
- Gérer les états de chargement et les erreurs
- Optimiser les requêtes côté client
- Mettre en place un système de mise en cache si nécessaire


### Lot 3.2 : Tests d'intégration

- Tester l'application complète en environnement local
- Vérifier la cohérence des données affichées
- Tester les performances avec des volumes de données réels
- Corriger les bugs identifiés


### Lot 3.3 : Documentation

- Documenter l'architecture technique
- Créer un guide d'utilisation
- Documenter les API et les modèles de données
- Préparer une présentation du projet


### Lot 3.4 : Préparation à la démonstration

- Préparer un jeu de données de démonstration
- Créer un scénario de démonstration
- Anticiper les questions techniques
- Préparer une démonstration des fonctionnalités clés

Ce plan vous permettra d'avancer méthodiquement dans le développement de votre application d'analyse des véhicules électriques. Chaque lot peut être assigné à différents membres du groupe en fonction de leurs compétences, et vous pourrez suivre la progression facilement.

