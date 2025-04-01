import Chart from 'chart.js/auto';

// Fonction pour comparer les territoires sélectionnés
export function renderComparaisonData(container) {
    container.innerHTML = `
    <div class="comparison-container">
      <h2>Comparaison entre territoires</h2>
      
      <div class="comparison-controls">
        <div class="territory-type-selector">
          <label for="territory-type">Type de territoire:</label>
          <select id="territory-type">
            <option value="regions" selected>Régions</option>
            <option value="departements">Départements</option>
            <option value="communes">Communes</option>
          </select>
        </div>
        
        <div class="territory-selector">
          <label for="territory1">Territoire 1:</label>
          <select id="territory1">
            <option value="">Sélectionnez un territoire</option>
          </select>
        </div>
        
        <div class="territory-selector">
          <label for="territory2">Territoire 2:</label>
          <select id="territory2">
            <option value="">Sélectionnez un territoire</option>
          </select>
        </div>
      </div>
      
      <div class="comparison-results">
        <div class="comparison-charts">
          <div class="chart-container">
            <h3>Nombre de véhicules électriques</h3>
            <canvas id="vehicles-comparison-chart"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>Nombre de bornes de recharge</h3>
            <canvas id="stations-comparison-chart"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>Ratio véhicules par borne</h3>
            <canvas id="ratio-comparison-chart"></canvas>
          </div>
        </div>
        
        <div class="comparison-table-container">
          <h3>Tableau comparatif</h3>
          <table id="comparison-table" class="data-table">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th id="territory1-name">Territoire 1</th>
                <th id="territory2-name">Territoire 2</th>
                <th>Différence</th>
              </tr>
            </thead>
            <tbody>
              <!-- Les données seront injectées ici -->
            </tbody>
          </table>
          <div class="export-container">
            <button id="export-comparison" class="export-btn">Exporter la comparaison</button>
          </div>
        </div>
      </div>
    </div>
  `;
// Charger la liste des territoires en fonction du type sélectionné
    loadTerritories();

    // Configurer les événements de changement
    document.getElementById('territory-type').addEventListener('change', () => {
        loadTerritories();
    });

    document.getElementById('territory1').addEventListener('change', () => {
        compareSelectedTerritories();
    });

    document.getElementById('territory2').addEventListener('change', () => {
        compareSelectedTerritories();
    });

    // Configurer le bouton d'export
    document.getElementById('export-comparison').addEventListener('click', exportComparisonData);
}

// Fonction pour charger les territoires dans les sélecteurs
function loadTerritories() {
    // Configurer les sélecteurs en fonction du type de territoire
    setupTerritorySelectors();
}

// Nouvelle fonction pour charger les options dans les listes déroulantes
function loadTerritoryOptions() {
    const territoryType = document.getElementById('territory-type').value;
    const territory1Select = document.getElementById('territory1');
    const territory2Select = document.getElementById('territory2');

    // Vider les sélecteurs
    territory1Select.innerHTML = '<option value="">Sélectionnez un territoire</option>';
    territory2Select.innerHTML = '<option value="">Sélectionnez un territoire</option>';

    // Charger les données en fonction du type de territoire
    let apiUrl = '';

    switch(territoryType) {
        case 'regions':
            apiUrl = '/api/bornes-communes/statistiques/global';
            break;
        case 'departements':
            apiUrl = '/api/bornes-communes/statistiques/correlation';
            break;
    }

    // Si pas de type sélectionné ou communes, ne rien faire ici
    if (!apiUrl) return;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let territories = [];

                // Extraire la liste des territoires en fonction du type
                if (territoryType === 'regions') {
                    territories = data.data.regions.map(region => ({
                        id: region.region,
                        name: region.region
                    }));
                } else if (territoryType === 'departements') {
                    // --- MODIFICATION ICI ---
                    // Filtrer les départements SANS nom ou avec les codes exacts 97, 98, 99
                    // (en supposant que '97 -', '98 -', '99 -' ont ces codes exacts et/ou pas de nom)
                    const excludedExactCodes = ['97', '98', '99'];
                    territories = data.data.departements
                        .filter(dept =>
                                // Garder si le nom du département existe ET n'est pas vide
                                dept.departement && dept.departement.trim() !== '' &&
                                // ET si le code n'est pas EXACTEMENT 97, 98 ou 99 (si c'est la cause du problème)
                                !excludedExactCodes.includes(dept.code)
                            // Alternative si le problème vient juste du nom vide:
                            // filter(dept => dept.departement && dept.departement.trim() !== '')
                            // Choisir la condition la plus adaptée à la structure de tes données réelles
                        )
                        .map(dept => ({
                            id: dept.code,
                            name: `${dept.code} - ${dept.departement}`
                        }));
                    // --- FIN MODIFICATION ---
                }

                // Trier les territoires par nom
                territories.sort((a, b) => a.name.localeCompare(b.name));

                // Remplir les sélecteurs
                territories.forEach(territory => {
                    const option1 = document.createElement('option');
                    option1.value = territory.id;
                    option1.textContent = territory.name;
                    territory1Select.appendChild(option1);

                    const option2 = document.createElement('option');
                    option2.value = territory.id;
                    option2.textContent = territory.name;
                    territory2Select.appendChild(option2);
                });
            }
        })
        .catch(error => console.error('Erreur lors du chargement des territoires:', error));
}

function setupTerritorySelectors() {
    const territoryType = document.getElementById('territory-type').value;
    const comparisonControls = document.querySelector('.comparison-controls');

    // Si le type est communes, afficher des champs de recherche
    if (territoryType === 'communes') {
        comparisonControls.innerHTML = `
      <div class="territory-type-selector">
        <label for="territory-type">Type de territoire:</label>
        <select id="territory-type">
          <option value="regions">Régions</option>
          <option value="departements">Départements</option>
          <option value="communes" selected>Communes</option>
        </select>
      </div>
      
      <div class="territory-search">
        <label for="territory1-search">Commune 1:</label>
        <div class="search-container">
          <input type="text" id="territory1-search" placeholder="Rechercher une commune...">
          <div id="territory1-results" class="search-results"></div>
        </div>
        <input type="hidden" id="territory1" value="">
      </div>
      
      <div class="territory-search">
        <label for="territory2-search">Commune 2:</label>
        <div class="search-container">
          <input type="text" id="territory2-search" placeholder="Rechercher une commune...">
          <div id="territory2-results" class="search-results"></div>
        </div>
        <input type="hidden" id="territory2" value="">
      </div>
    `;

        // Configurer les événements de recherche
        setupCommuneSearch('territory1');
        setupCommuneSearch('territory2');

        // Reconfigurer l'événement de changement de type
        document.getElementById('territory-type').addEventListener('change', () => {
            loadTerritories();
        });
    } else {
        // Pour les régions et départements, afficher des listes déroulantes
        comparisonControls.innerHTML = `
      <div class="territory-type-selector">
        <label for="territory-type">Type de territoire:</label>
        <select id="territory-type">
          <option value="regions" ${territoryType === 'regions' ? 'selected' : ''}>Régions</option>
          <option value="departements" ${territoryType === 'departements' ? 'selected' : ''}>Départements</option>
          <option value="communes">Communes</option>
        </select>
      </div>
      
      <div class="territory-selector">
        <label for="territory1">Territoire 1:</label>
        <select id="territory1">
          <option value="">Sélectionnez un territoire</option>
        </select>
      </div>
      
      <div class="territory-selector">
        <label for="territory2">Territoire 2:</label>
        <select id="territory2">
          <option value="">Sélectionnez un territoire</option>
        </select>
      </div>
    `;

        // Reconfigurer les événements
        document.getElementById('territory-type').addEventListener('change', () => {
            loadTerritories();
        });

        document.getElementById('territory1').addEventListener('change', () => {
            compareSelectedTerritories();
        });

        document.getElementById('territory2').addEventListener('change', () => {
            compareSelectedTerritories();
        });

        // Charger les territoires dans les listes déroulantes
        loadTerritoryOptions();
    }
}

// Fonction pour configurer la recherche de communes
function setupCommuneSearch(fieldId) {
    const searchInput = document.getElementById(`${fieldId}-search`);
    const resultsContainer = document.getElementById(`${fieldId}-results`);
    const hiddenInput = document.getElementById(fieldId);

    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        fetch(`/api/bornes-communes/search/${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const communes = data.data;

                    if (communes.length === 0) {
                        resultsContainer.innerHTML = '<div class="no-results">Aucune commune trouvée</div>';
                        return;
                    }

                    resultsContainer.innerHTML = '';
                    communes.forEach(commune => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'result-item';
                        const displayName = `${commune.commune} (${commune.code_postal})`;
                        resultItem.textContent = displayName;
                        // Stocker les infos nécessaires dans le dataset
                        resultItem.dataset.id = commune.commune; // Garde le nom pour affichage si besoin
                        resultItem.dataset.postal = commune.code_postal;
                        resultItem.dataset.name = displayName; // Pour remplir l'input visible

                        resultItem.addEventListener('click', () => {
                            searchInput.value = resultItem.dataset.name;
                            // --- MODIFICATION ICI ---
                            // Stocker une valeur combinée unique comme 'commune|code_postal'
                            hiddenInput.value = `${resultItem.dataset.id}|${resultItem.dataset.postal}`;
                            // --- FIN MODIFICATION ---
                            resultsContainer.innerHTML = '';
                            compareSelectedTerritories(); // Déclenche la comparaison
                        });

                        resultsContainer.appendChild(resultItem);
                    });
                }
            })
            .catch(error => {
                console.error('Erreur lors de la recherche de communes:', error);
                resultsContainer.innerHTML = '<div class="no-results">Erreur lors de la recherche</div>';
            });
    }, 300));

    // Fermer les résultats si on clique ailleurs
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.innerHTML = '';
        }
    });
}

// Fonction utilitaire pour débouncer les événements
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

function compareSelectedTerritories() {
    const territoryType = document.getElementById('territory-type').value;
    let territory1Value, territory2Value, territory1Name, territory2Name;

    if (territoryType === 'communes') {
        territory1Value = document.getElementById('territory1').value; // ex: "Paris|75001"
        territory2Value = document.getElementById('territory2').value; // ex: "Lyon|69001"
        territory1Name = document.getElementById('territory1-search').value; // Nom affiché
        territory2Name = document.getElementById('territory2-search').value; // Nom affiché
    } else {
        territory1Value = document.getElementById('territory1').value;
        territory2Value = document.getElementById('territory2').value;
        territory1Name = territory1Value ? document.getElementById('territory1').options[document.getElementById('territory1').selectedIndex].text : '';
        territory2Name = territory2Value ? document.getElementById('territory2').options[document.getElementById('territory2').selectedIndex].text : '';
    }

    // Vérifier que les deux territoires sont sélectionnés
    if (!territory1Value || !territory2Value) {
        // console.log("Sélection manquante");
        return;
    }

    // Vérifier que les deux territoires sont différents
    if (territory1Value === territory2Value) {
        alert('Veuillez sélectionner deux territoires différents pour la comparaison.');
        return;
    }

    // Mettre à jour les noms des territoires dans le tableau
    document.getElementById('territory1-name').textContent = territory1Name;
    document.getElementById('territory2-name').textContent = territory2Name;

    // Charger les données pour la comparaison
    if (territoryType === 'regions') {
        // Code existant pour les régions
        const apiUrl = `/api/bornes-communes/comparer/${encodeURIComponent(territory1Value)}/${encodeURIComponent(territory2Value)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    createComparisonCharts(data.data);
                    populateComparisonTable(data.data);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la comparaison des territoires:', error);
                showComparisonError();
            });
    } else if (territoryType === 'departements') {
        // Code existant pour les départements
        Promise.all([
            fetch(`/api/bornes-communes/departement/${encodeURIComponent(territory1Value)}`).then(res => res.json()),
            fetch(`/api/bornes-communes/departement/${encodeURIComponent(territory2Value)}`).then(res => res.json())
        ])
            .then(([data1, data2]) => {
                // Gérer les erreurs API spécifiques
                if (!data1.success) {
                    console.error(`Erreur API pour département ${territory1Name}:`, data1.message);
                    showComparisonError(`Impossible de charger les données pour ${territory1Name}.`);
                    return;
                }
                if (!data2.success) {
                    console.error(`Erreur API pour département ${territory2Name}:`, data2.message);
                    showComparisonError(`Impossible de charger les données pour ${territory2Name}.`);
                    return;
                }

                // Le reste du code pour traiter data1.data et data2.data est ok
                const comparisonData = {
                    departement1: {
                        departement: data1.data.departement,
                        code_departement: data1.data.code_departement,
                        totalVehiculesElectriques: data1.data.statistiques.total_vehicules_electriques,
                        totalBornes: data1.data.statistiques.total_bornes,
                        totalPointsCharge: data1.data.statistiques.total_points_charge,
                        pourcentageVehiculesElectriques: data1.data.statistiques.pourcentage_electriques,
                        ratioVehiculesParBorne: data1.data.statistiques.ratio_vehicules_par_borne
                    },
                    departement2: {
                        departement: data2.data.departement,
                        code_departement: data2.data.code_departement,
                        totalVehiculesElectriques: data2.data.statistiques.total_vehicules_electriques,
                        totalBornes: data2.data.statistiques.total_bornes,
                        totalPointsCharge: data2.data.statistiques.total_points_charge,
                        pourcentageVehiculesElectriques: data2.data.statistiques.pourcentage_electriques,
                        ratioVehiculesParBorne: data2.data.statistiques.ratio_vehicules_par_borne
                    }
                };

                createDepartementComparisonCharts(comparisonData);
                populateDepartementComparisonTable(comparisonData);

            })
            .catch(error => {
                console.error('Erreur lors de la comparaison des départements:', error);
                showComparisonError();
            });
    } else if (territoryType === 'communes') {
        // --- MODIFICATION ICI ---
        // Extraire commune et code postal
        const [commune1, cp1] = territory1Value.split('|');
        const [commune2, cp2] = territory2Value.split('|');

        // Vérifier si on a bien les deux parties
        if (!commune1 || !cp1 || !commune2 || !cp2) {
            console.error("Erreur: Identifiant de commune incomplet.", territory1Value, territory2Value);
            showComparisonError();
            return;
        }

        // Construire les nouvelles URLs d'API
        const apiUrl1 = `/api/bornes-communes/commune/${encodeURIComponent(commune1)}/${encodeURIComponent(cp1)}`;
        const apiUrl2 = `/api/bornes-communes/commune/${encodeURIComponent(commune2)}/${encodeURIComponent(cp2)}`;

        Promise.all([
            fetch(apiUrl1).then(res => res.json()),
            fetch(apiUrl2).then(res => res.json())
        ])
            .then(([data1, data2]) => {
                // Gérer les erreurs API spécifiques
                if (!data1.success) {
                    console.error(`Erreur API pour ${commune1} (${cp1}):`, data1.message);
                    showComparisonError(`Impossible de charger les données pour ${territory1Name}.`);
                    return;
                }
                if (!data2.success) {
                    console.error(`Erreur API pour ${commune2} (${cp2}):`, data2.message);
                    showComparisonError(`Impossible de charger les données pour ${territory2Name}.`);
                    return;
                }

                // Le reste du code pour traiter data1.data et data2.data est ok
                const communeData1 = data1.data;
                const communeData2 = data2.data;

                const comparisonData = {
                    commune1: {
                        commune: communeData1.commune,
                        code_postal: communeData1.code_postal,
                        totalVehiculesElectriques: communeData1.NB_VP_RECHARGEABLES_EL || 0, // S'assurer que c'est un nombre
                        totalVehicules: communeData1.NB_VP || 0,
                        totalBornes: communeData1.nombre_bornes || 0,
                        totalPointsCharge: communeData1.nombre_points_charge || 0,
                        pourcentageVehiculesElectriques: (communeData1.NB_VP && communeData1.NB_VP > 0) ? ((communeData1.NB_VP_RECHARGEABLES_EL / communeData1.NB_VP) * 100).toFixed(2) : '0.00',
                        ratioVehiculesParBorne: (communeData1.nombre_bornes && communeData1.nombre_bornes > 0) ? (communeData1.NB_VP_RECHARGEABLES_EL / communeData1.nombre_bornes).toFixed(2) : 'N/A'
                    },
                    commune2: {
                        commune: communeData2.commune,
                        code_postal: communeData2.code_postal,
                        totalVehiculesElectriques: communeData2.NB_VP_RECHARGEABLES_EL || 0,
                        totalVehicules: communeData2.NB_VP || 0,
                        totalBornes: communeData2.nombre_bornes || 0,
                        totalPointsCharge: communeData2.nombre_points_charge || 0,
                        pourcentageVehiculesElectriques: (communeData2.NB_VP && communeData2.NB_VP > 0) ? ((communeData2.NB_VP_RECHARGEABLES_EL / communeData2.NB_VP) * 100).toFixed(2) : '0.00',
                        ratioVehiculesParBorne: (communeData2.nombre_bornes && communeData2.nombre_bornes > 0) ? (communeData2.NB_VP_RECHARGEABLES_EL / communeData2.nombre_bornes).toFixed(2) : 'N/A'
                    }
                };

                createCommuneComparisonCharts(comparisonData);
                populateCommuneComparisonTable(comparisonData);

            })
            .catch(error => {
                console.error('Erreur lors de la comparaison des communes:', error);
                showComparisonError();
            });
        // --- FIN MODIFICATION ---
    }
}

// Fonction pour créer les graphiques de comparaison
function createComparisonCharts(data) {
    // Extraire les données pour les graphiques
    const labels = [data.region1.region, data.region2.region];
    const vehiclesData = [data.region1.totalVehiculesElectriques, data.region2.totalVehiculesElectriques];
    const stationsData = [data.region1.totalBornes, data.region2.totalBornes];

    // Calculer le ratio véhicules par borne
    const ratio1 = data.region1.totalBornes > 0 ? Number((data.region1.totalVehiculesElectriques / data.region1.totalBornes).toFixed(2)) : 0;
    const ratio2 = data.region2.totalBornes > 0 ? Number((data.region2.totalVehiculesElectriques / data.region2.totalBornes).toFixed(2)) : 0;
    const ratioData = [ratio1, ratio2];

    // Créer le graphique des véhicules
    createBarChart('vehicles-comparison-chart', 'Nombre de véhicules électriques', labels, vehiclesData, 'rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)');

    // Créer le graphique des bornes
    createBarChart('stations-comparison-chart', 'Nombre de bornes de recharge', labels, stationsData, 'rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 1)');

    // Créer le graphique des ratios
    createBarChart('ratio-comparison-chart', 'Ratio véhicules par borne', labels, ratioData, 'rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)');
}

// Fonction pour afficher un message d'erreur
function showComparisonError(message = "Une erreur s'est produite lors de la comparaison des territoires.") {
    const comparisonResults = document.querySelector('.comparison-results');
    comparisonResults.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
      <p>Veuillez réessayer ou sélectionner d'autres territoires.</p>
    </div>
  `;
}

// Fonction pour créer un graphique en barres
function createBarChart(canvasId, title, labels, data, backgroundColor, borderColor) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Vérifier si le graphique existe avant d'essayer de le détruire
    if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
        window[canvasId].destroy();
    }

    // Créer un nouveau graphique
    window[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour créer les graphiques de comparaison pour les départements
function createDepartementComparisonCharts(data) {
    // Extraire les données pour les graphiques
    const labels = [
        `${data.departement1.code_departement} - ${data.departement1.departement}`,
        `${data.departement2.code_departement} - ${data.departement2.departement}`
    ];
    const vehiclesData = [data.departement1.totalVehiculesElectriques, data.departement2.totalVehiculesElectriques];
    const stationsData = [data.departement1.totalBornes, data.departement2.totalBornes];

    // Calculer le ratio véhicules par borne (utiliser les valeurs déjà calculées ou 0 si N/A)
    let ratio1 = data.departement1.ratioVehiculesParBorne;
    if (ratio1 === 'N/A') ratio1 = 0;
    let ratio2 = data.departement2.ratioVehiculesParBorne;
    if (ratio2 === 'N/A') ratio2 = 0;

    const ratioData = [parseFloat(ratio1), parseFloat(ratio2)];

    // Créer le graphique des véhicules
    createBarChart('vehicles-comparison-chart', 'Nombre de véhicules électriques', labels, vehiclesData, 'rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)');

    // Créer le graphique des bornes
    createBarChart('stations-comparison-chart', 'Nombre de bornes de recharge', labels, stationsData, 'rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 1)');

    // Créer le graphique des ratios
    createBarChart('ratio-comparison-chart', 'Ratio véhicules par borne', labels, ratioData, 'rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)');
}

// Fonction pour créer les graphiques de comparaison pour les communes
function createCommuneComparisonCharts(data) {
    // Extraire les données pour les graphiques
    const labels = [
        `${data.commune1.commune} (${data.commune1.code_postal})`,
        `${data.commune2.commune} (${data.commune2.code_postal})`
    ];
    const vehiclesData = [data.commune1.totalVehiculesElectriques, data.commune2.totalVehiculesElectriques];
    const stationsData = [data.commune1.totalBornes, data.commune2.totalBornes];

    // Calculer le ratio véhicules par borne
    let ratio1 = data.commune1.ratioVehiculesParBorne;
    if (ratio1 === 'N/A') ratio1 = 0;
    let ratio2 = data.commune2.ratioVehiculesParBorne;
    if (ratio2 === 'N/A') ratio2 = 0;

    const ratioData = [parseFloat(ratio1), parseFloat(ratio2)];

    // Créer le graphique des véhicules
    createBarChart('vehicles-comparison-chart', 'Nombre de véhicules électriques', labels, vehiclesData, 'rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)');

    // Créer le graphique des bornes
    createBarChart('stations-comparison-chart', 'Nombre de bornes de recharge', labels, stationsData, 'rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 1)');

    // Créer le graphique des ratios
    createBarChart('ratio-comparison-chart', 'Ratio véhicules par borne', labels, ratioData, 'rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)');
}

// Fonction pour remplir le tableau comparatif pour les communes
function populateCommuneComparisonTable(data) {
    const tableBody = document.querySelector('#comparison-table tbody');
    tableBody.innerHTML = '';

    // Définir les indicateurs à afficher
    const indicators = [
        { name: 'Véhicules électriques', value1: data.commune1.totalVehiculesElectriques, value2: data.commune2.totalVehiculesElectriques },
        { name: 'Bornes de recharge', value1: data.commune1.totalBornes, value2: data.commune2.totalBornes },
        { name: 'Points de charge', value1: data.commune1.totalPointsCharge, value2: data.commune2.totalPointsCharge },
        { name: 'Véhicules par borne', value1: data.commune1.ratioVehiculesParBorne, value2: data.commune2.ratioVehiculesParBorne },
        { name: 'Pourcentage de véhicules électriques', value1: data.commune1.pourcentageVehiculesElectriques + '%', value2: data.commune2.pourcentageVehiculesElectriques + '%' },
        { name: 'Total véhicules', value1: data.commune1.totalVehicules, value2: data.commune2.totalVehicules }
    ];

    // Ajouter chaque indicateur au tableau
    indicators.forEach(indicator => {
        const row = document.createElement('tr');

        // Calculer la différence
        let difference = '';
        if (typeof indicator.value1 === 'number' && typeof indicator.value2 === 'number') {
            difference = (indicator.value1 - indicator.value2).toLocaleString('fr-FR');

            // Ajouter une classe pour colorer la différence
            if (indicator.value1 > indicator.value2) {
                difference = `+${difference}`;
                row.classList.add('positive-difference');
            } else if (indicator.value1 < indicator.value2) {
                row.classList.add('negative-difference');
            }
        }

        // Formater les valeurs
        const value1 = typeof indicator.value1 === 'number' ? indicator.value1.toLocaleString('fr-FR') : indicator.value1;
        const value2 = typeof indicator.value2 === 'number' ? indicator.value2.toLocaleString('fr-FR') : indicator.value2;

        row.innerHTML = `
      <td>${indicator.name}</td>
      <td>${value1}</td>
      <td>${value2}</td>
      <td>${difference}</td>
    `;

        tableBody.appendChild(row);
    });
}

// Fonction pour remplir le tableau comparatif pour les départements
function populateDepartementComparisonTable(data) {
    const tableBody = document.querySelector('#comparison-table tbody');
    tableBody.innerHTML = '';

    // Définir les indicateurs à afficher
    const indicators = [
        { name: 'Véhicules électriques', value1: data.departement1.totalVehiculesElectriques, value2: data.departement2.totalVehiculesElectriques },
        { name: 'Bornes de recharge', value1: data.departement1.totalBornes, value2: data.departement2.totalBornes },
        { name: 'Points de charge', value1: data.departement1.totalPointsCharge, value2: data.departement2.totalPointsCharge },
        { name: 'Véhicules par borne', value1: data.departement1.ratioVehiculesParBorne, value2: data.departement2.ratioVehiculesParBorne },
        { name: 'Pourcentage de véhicules électriques', value1: data.departement1.pourcentageVehiculesElectriques + '%', value2: data.departement2.pourcentageVehiculesElectriques + '%' }
    ];

    // Ajouter chaque indicateur au tableau
    indicators.forEach(indicator => {
        const row = document.createElement('tr');

        // Calculer la différence
        let difference = '';
        if (typeof indicator.value1 === 'number' && typeof indicator.value2 === 'number') {
            difference = (indicator.value1 - indicator.value2).toLocaleString('fr-FR');

            // Ajouter une classe pour colorer la différence
            if (indicator.value1 > indicator.value2) {
                difference = `+${difference}`;
                row.classList.add('positive-difference');
            } else if (indicator.value1 < indicator.value2) {
                row.classList.add('negative-difference');
            }
        }

        // Formater les valeurs
        const value1 = typeof indicator.value1 === 'number' ? indicator.value1.toLocaleString('fr-FR') : indicator.value1;
        const value2 = typeof indicator.value2 === 'number' ? indicator.value2.toLocaleString('fr-FR') : indicator.value2;

        row.innerHTML = `
      <td>${indicator.name}</td>
      <td>${value1}</td>
      <td>${value2}</td>
      <td>${difference}</td>
    `;

        tableBody.appendChild(row);
    });
}

// Fonction pour remplir le tableau comparatif
function populateComparisonTable(data) {
    const tableBody = document.querySelector('#comparison-table tbody');
    tableBody.innerHTML = '';

    // Définir les indicateurs à afficher
    const indicators = [
        { name: 'Véhicules électriques', value1: data.region1.totalVehiculesElectriques, value2: data.region2.totalVehiculesElectriques },
        { name: 'Bornes de recharge', value1: data.region1.totalBornes, value2: data.region2.totalBornes },
        { name: 'Points de charge', value1: data.region1.totalPointsCharge, value2: data.region2.totalPointsCharge },
        { name: 'Véhicules par borne', value1: data.region1.ratioVehiculesParBorne, value2: data.region2.ratioVehiculesParBorne },
        { name: 'Pourcentage de véhicules électriques', value1: data.region1.pourcentageVehiculesElectriques + '%', value2: data.region2.pourcentageVehiculesElectriques + '%' }
    ];

    // Ajouter chaque indicateur au tableau
    indicators.forEach(indicator => {
        const row = document.createElement('tr');

        // Calculer la différence
        let difference = '';
        if (typeof indicator.value1 === 'number' && typeof indicator.value2 === 'number') {
            difference = (indicator.value1 - indicator.value2).toLocaleString('fr-FR');

            // Ajouter une classe pour colorer la différence
            if (indicator.value1 > indicator.value2) {
                difference = `+${difference}`;
                row.classList.add('positive-difference');
            } else if (indicator.value1 < indicator.value2) {
                row.classList.add('negative-difference');
            }
        }

        // Formater les valeurs
        const value1 = typeof indicator.value1 === 'number' ? indicator.value1.toLocaleString('fr-FR') : indicator.value1;
        const value2 = typeof indicator.value2 === 'number' ? indicator.value2.toLocaleString('fr-FR') : indicator.value2;

        row.innerHTML = `
      <td>${indicator.name}</td>
      <td>${value1}</td>
      <td>${value2}</td>
      <td>${difference}</td>
    `;

        tableBody.appendChild(row);
    });
}

// Fonction pour exporter les données de comparaison en CSV
function exportComparisonData() {
    const territory1 = document.getElementById('territory1-name').textContent;
    const territory2 = document.getElementById('territory2-name').textContent;

    // Créer le contenu CSV
    let csvContent = `Indicateur,${territory1},${territory2},Différence\n`;

    // Ajouter chaque ligne du tableau
    const rows = document.querySelectorAll('#comparison-table tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => `"${cell.textContent}"`).join(',');
        csvContent += `${rowData}\n`;
    });

    // Créer un objet Blob avec le contenu CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `comparaison-${territory1}-${territory2}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}