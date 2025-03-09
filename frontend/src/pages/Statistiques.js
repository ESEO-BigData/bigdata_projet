import Chart from 'chart.js/auto';

export function renderStatistics(container) {
    // Structure de base avec navigation par onglets
    container.innerHTML = `
    <section class="statistics-section">
      <h1>Tableau de bord des véhicules électriques</h1>
      
      <!-- KPI Dashboard -->
      <div class="kpi-dashboard">
        <div class="kpi-card" id="kpi-total-vehicules">
          <h3>Total véhicules électriques</h3>
          <div class="kpi-value">Chargement...</div>
          <div class="kpi-trend"></div>
        </div>
        
        <div class="kpi-card" id="kpi-total-bornes">
          <h3>Bornes de recharge</h3>
          <div class="kpi-value">Chargement...</div>
          <div class="kpi-trend"></div>
        </div>
        
        <div class="kpi-card" id="kpi-ratio">
          <h3>Véhicules par borne</h3>
          <div class="kpi-value">Chargement...</div>
          <div class="kpi-trend"></div>
        </div>
        
        <div class="kpi-card" id="kpi-top-region">
          <h3>Région leader</h3>
          <div class="kpi-value">Chargement...</div>
          <div class="kpi-trend"></div>
        </div>
      </div>
      
      <!-- Navigation par onglets -->
      <div class="tabs-navigation">
        <button class="tab-button active" data-tab="regions">Régions</button>
        <button class="tab-button" data-tab="communes">Communes</button>
        <button class="tab-button" data-tab="comparaison">Comparaisons</button>
        <button class="tab-button" data-tab="correlation">Corrélations</button>
      </div>
      
      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Onglet Régions -->
        <div class="tab-pane active" id="regions-tab">
          <div class="chart-controls">
            <div class="chart-type-selector">
              <label for="region-chart-type">Type de graphique:</label>
              <select id="region-chart-type">
                <option value="bar">Barres</option>
                <option value="pie">Camembert</option>
                <option value="doughnut">Anneau</option>
              </select>
            </div>
            <button id="export-regions-data" class="export-btn">Exporter les données</button>
          </div>
          
          <div class="chart-container">
            <h2>Véhicules électriques par région</h2>
            <canvas id="regions-chart"></canvas>
          </div>
          
          <div class="data-table-container">
            <h3>Tableau des données</h3>
            <table id="regions-table" class="data-table">
              <thead>
                <tr>
                  <th>Région</th>
                  <th>Nombre de véhicules</th>
                  <th>% du total</th>
                </tr>
              </thead>
              <tbody>
                <!-- Les données seront injectées ici -->
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Autres onglets seront ajoutés dans les prochaines étapes -->
        <div class="tab-pane" id="communes-tab">
          <h2>Chargement des données communes...</h2>
        </div>
        
        <div class="tab-pane" id="comparaison-tab">
          <h2>Chargement des données de comparaison...</h2>
        </div>
        
        <div class="tab-pane" id="correlation-tab">
          <h2>Chargement des données de corrélation...</h2>
        </div>
      </div>
    </section>
  `;

    // Initialiser la navigation par onglets
    initTabNavigation();

    // Charger les KPIs
    loadKPIs();

    // Charger les données des régions
    loadRegionsData();

    // Configurer les contrôles de graphique
    setupChartControls();

    // Configurer les boutons d'export
    setupExportButtons();
}

// Fonction pour initialiser la navigation par onglets
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons et onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');

            // Activer l'onglet correspondant
            const tabId = button.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Charger les données de l'onglet si nécessaire
            switch(tabId) {
                case 'regions':
                    loadRegionsData();
                    break;
                case 'communes':
                    loadCommunesData();
                    break;
                case 'comparaison':
                    loadComparisonData();
                    break;
                case 'correlation':
                    loadCorrelationData();
                    break;
            }
        });
    });
}

// Fonction pour charger les KPIs
function loadKPIs() {
    // Charger le nombre total de véhicules électriques
    fetch('/api/vehicules/communes/statistiques')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const kpiCard = document.getElementById('kpi-total-vehicules');
                const kpiValue = kpiCard.querySelector('.kpi-value');
                kpiValue.textContent = data.data.totalVehiculesElectriques.toLocaleString('fr-FR');
            }
        })
        .catch(error => console.error('Erreur lors du chargement des statistiques:', error));

    // Charger le nombre total de bornes
    fetch('/api/bornes/statistiques')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const kpiCard = document.getElementById('kpi-total-bornes');
                const kpiValue = kpiCard.querySelector('.kpi-value');
                kpiValue.textContent = data.data.general.totalBornes.toLocaleString('fr-FR');
            }
        })
        .catch(error => console.error('Erreur lors du chargement des statistiques des bornes:', error));

    // Charger la région avec le plus de véhicules
    fetch('/api/vehicules/regions/statistiques')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const kpiCard = document.getElementById('kpi-top-region');
                const kpiValue = kpiCard.querySelector('.kpi-value');
                kpiValue.textContent = data.data.regionMax.REGION;
            }
        })
        .catch(error => console.error('Erreur lors du chargement des statistiques des régions:', error));

    // Calculer le ratio véhicules par borne (après avoir chargé les deux valeurs)
    Promise.all([
        fetch('/api/vehicules/communes/statistiques').then(res => res.json()),
        fetch('/api/bornes/statistiques').then(res => res.json())
    ])
        .then(([vehiculesData, bornesData]) => {
            if (vehiculesData.success && bornesData.success) {
                const totalVehicules = vehiculesData.data.totalVehiculesElectriques;
                const totalBornes = bornesData.data.general.totalBornes;
                const ratio = (totalVehicules / totalBornes).toFixed(1);

                const kpiCard = document.getElementById('kpi-ratio');
                const kpiValue = kpiCard.querySelector('.kpi-value');
                kpiValue.textContent = ratio;
            }
        })
        .catch(error => console.error('Erreur lors du calcul du ratio:', error));
}

// Fonction pour charger les données des régions
function loadRegionsData() {
    fetch('/api/vehicules/regions')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Créer ou mettre à jour le graphique
                createOrUpdateRegionsChart(data.data);

                // Remplir le tableau de données
                populateRegionsTable(data.data);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des données des régions:', error));
}

// Fonction pour créer ou mettre à jour le graphique des régions
function createOrUpdateRegionsChart(regions) {
    const ctx = document.getElementById('regions-chart').getContext('2d');
    const chartType = document.getElementById('region-chart-type').value;

    // Trier les régions par nombre de véhicules (décroissant)
    regions.sort((a, b) => b.somme_NB_VP_RECHARGEABLES_EL - a.somme_NB_VP_RECHARGEABLES_EL);

    // Calculer le total pour les pourcentages
    const total = regions.reduce((sum, region) => sum + region.somme_NB_VP_RECHARGEABLES_EL, 0);

    // Détruire le graphique existant s'il y en a un
    if (window.regionsChart) {
        window.regionsChart.destroy();
    }

    // Créer un nouveau graphique
    window.regionsChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: regions.map(region => region.REGION),
            datasets: [{
                label: 'Nombre de véhicules électriques',
                data: regions.map(region => region.somme_NB_VP_RECHARGEABLES_EL),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)',
                    'rgba(40, 159, 64, 0.6)',
                    'rgba(210, 199, 199, 0.6)',
                    'rgba(78, 52, 199, 0.6)',
                    'rgba(209, 102, 226, 0.6)',
                    'rgba(22, 159, 182, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(40, 159, 64, 1)',
                    'rgba(210, 199, 199, 1)',
                    'rgba(78, 52, 199, 1)',
                    'rgba(209, 102, 226, 1)',
                    'rgba(22, 159, 182, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: chartType === 'bar' ? 'top' : 'right',
                    display: chartType !== 'bar'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value.toLocaleString('fr-FR')} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: chartType === 'bar',
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour remplir le tableau des régions
function populateRegionsTable(regions) {
    const tableBody = document.querySelector('#regions-table tbody');
    tableBody.innerHTML = '';

    // Calculer le total pour les pourcentages
    const total = regions.reduce((sum, region) => sum + region.somme_NB_VP_RECHARGEABLES_EL, 0);

    // Trier les régions par nombre de véhicules (décroissant)
    regions.sort((a, b) => b.somme_NB_VP_RECHARGEABLES_EL - a.somme_NB_VP_RECHARGEABLES_EL);

    // Ajouter chaque région au tableau
    regions.forEach(region => {
        const percentage = ((region.somme_NB_VP_RECHARGEABLES_EL / total) * 100).toFixed(1);

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${region.REGION}</td>
      <td>${region.somme_NB_VP_RECHARGEABLES_EL.toLocaleString('fr-FR')}</td>
      <td>${percentage}%</td>
    `;

        tableBody.appendChild(row);
    });
}

// Fonction pour configurer les contrôles de graphique
function setupChartControls() {
    const chartTypeSelector = document.getElementById('region-chart-type');

    chartTypeSelector.addEventListener('change', () => {
        // Recharger le graphique avec le nouveau type
        fetch('/api/vehicules/regions')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    createOrUpdateRegionsChart(data.data);
                }
            })
            .catch(error => console.error('Erreur lors du chargement des données des régions:', error));
    });
}

// Fonction pour configurer les boutons d'export
function setupExportButtons() {
    const exportRegionsBtn = document.getElementById('export-regions-data');

    exportRegionsBtn.addEventListener('click', () => {
        fetch('/api/vehicules/regions')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    exportToCSV(data.data, 'vehicules-electriques-par-region');
                }
            })
            .catch(error => console.error('Erreur lors de l\'export des données:', error));
    });
}

// Fonction pour exporter des données au format CSV
function exportToCSV(data, filename) {
    // Créer les en-têtes CSV
    let csvContent = 'Region,Nombre de vehicules electriques\n';

    // Ajouter chaque ligne de données
    data.forEach(item => {
        csvContent += `${item.REGION},${item.somme_NB_VP_RECHARGEABLES_EL}\n`;
    });

    // Créer un objet Blob avec le contenu CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fonctions pour charger les données des autres onglets (à implémenter dans les prochaines étapes)
// Fonction pour charger les données des communes
function loadCommunesData() {
    // Initialiser le contenu de l'onglet Communes
    const communesTab = document.getElementById('communes-tab');
    communesTab.innerHTML = `
    <div class="search-container">
      <h2>Recherche de communes</h2>
      <div class="search-box">
        <input type="text" id="commune-search" placeholder="Rechercher une commune..." />
        <button id="search-button">Rechercher</button>
      </div>
      <div class="filters">
        <div class="filter">
          <label for="departement-filter">Filtrer par département:</label>
          <select id="departement-filter">
            <option value="">Tous les départements</option>
          </select>
        </div>
        <div class="filter">
          <label for="min-vehicules">Nombre min. de véhicules:</label>
          <input type="number" id="min-vehicules" min="0" value="0" />
        </div>
      </div>
    </div>

    <div class="results-container">
      <div class="chart-container">
        <h2>Top 10 des communes</h2>
        <div class="chart-controls">
          <div class="chart-type-selector">
            <label for="communes-chart-type">Type de graphique:</label>
            <select id="communes-chart-type">
              <option value="bar">Barres</option>
              <option value="pie">Camembert</option>
              <option value="horizontalBar">Barres horizontales</option>
            </select>
          </div>
          <div class="chart-metric-selector">
            <label for="communes-metric">Métrique:</label>
            <select id="communes-metric">
              <option value="nombre">Nombre de véhicules</option>
              <option value="pourcentage">Pourcentage du parc</option>
            </select>
          </div>
          <button id="export-communes-data" class="export-btn">Exporter</button>
        </div>
        <canvas id="communes-chart"></canvas>
      </div>
      
      <div class="data-table-container">
        <h3>Résultats de la recherche</h3>
        <table id="communes-table" class="data-table">
          <thead>
            <tr>
              <th>Commune</th>
              <th>Code postal</th>
              <th>Véhicules électriques</th>
              <th>% du parc</th>
              <th>Total véhicules</th>
            </tr>
          </thead>
          <tbody>
            <!-- Les données seront injectées ici -->
          </tbody>
        </table>
        <div class="pagination" id="communes-pagination">
          <!-- Pagination sera ajoutée ici -->
        </div>
      </div>
    </div>
  `;

    // Charger les départements pour le filtre
    loadDepartements();

    // Charger le top 10 des communes par défaut
    loadTopCommunes();

    // Configurer la recherche
    setupCommuneSearch();

    // Configurer les contrôles du graphique
    setupCommunesChartControls();
}

// Fonction pour charger les départements dans le filtre
function loadDepartements() {
    fetch('/api/departements')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('departement-filter');

                // Trier les départements par numéro
                const departements = data.data.sort((a, b) => a.DEPARTEMENT.localeCompare(b.DEPARTEMENT));

                departements.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.DEPARTEMENT;
                    option.textContent = `${dept.DEPARTEMENT} - ${dept.NOM}`;
                    select.appendChild(option);
                });

                // Ajouter un événement de changement
                select.addEventListener('change', () => {
                    loadTopCommunes();
                });
            }
        })
        .catch(error => console.error('Erreur lors du chargement des départements:', error));
}

// Fonction pour charger le top des communes
function loadTopCommunes() {
    const departement = document.getElementById('departement-filter').value;
    const metric = document.getElementById('communes-metric').value;
    const minVehicules = document.getElementById('min-vehicules').value || 0;

    let url = '';

    if (metric === 'nombre') {
        url = `/api/vehicules/communes/top/nombre?limit=10&minVehicules=${minVehicules}`;
        if (departement) {
            url = `/api/vehicules/communes/departement/${departement}`;
        }
    } else {
        url = `/api/vehicules/communes/top/pourcentage?limit=10&minVehicules=${minVehicules}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let communes = data.data;

                // Si c'est une recherche par département, prendre les 10 premières communes
                if (departement && communes.communes) {
                    communes = communes.communes.sort((a, b) => b.NB_VP_RECHARGEABLES_EL - a.NB_VP_RECHARGEABLES_EL).slice(0, 10);
                }

                createCommunesChart(communes, metric);
                populateCommunesTable(communes);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des communes:', error));
}

// Fonction pour configurer la recherche de communes
function setupCommuneSearch() {
    const searchInput = document.getElementById('commune-search');
    const searchButton = document.getElementById('search-button');

    // Recherche au clic sur le bouton
    searchButton.addEventListener('click', () => {
        searchCommune(searchInput.value);
    });

    // Recherche en appuyant sur Entrée
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCommune(searchInput.value);
        }
    });
}

// Fonction pour rechercher une commune
function searchCommune(query) {
    if (!query) return;

    fetch(`/api/vehicules/communes/nom/${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateCommunesTable(data.data);

                // Si une seule commune est trouvée, créer un graphique pour elle
                if (data.data.length === 1) {
                    createSingleCommuneChart(data.data[0]);
                } else if (data.data.length > 1) {
                    createCommunesChart(data.data, 'nombre');
                }
            } else {
                // Aucune commune trouvée
                document.querySelector('#communes-table tbody').innerHTML = `
          <tr>
            <td colspan="5" class="no-results">Aucune commune trouvée pour "${query}"</td>
          </tr>
        `;
            }
        })
        .catch(error => console.error('Erreur lors de la recherche de communes:', error));
}

// Fonction pour créer le graphique des communes
function createCommunesChart(communes, metric) {
    const ctx = document.getElementById('communes-chart').getContext('2d');
    const chartType = document.getElementById('communes-chart-type').value;

    // Adapter le type de graphique
    let type = chartType;
    if (chartType === 'horizontalBar') {
        type = 'bar';
    }

    // Préparer les données selon la métrique
    let labels, data, title;

    if (metric === 'nombre') {
        // Trier par nombre de véhicules
        communes.sort((a, b) => b.NB_VP_RECHARGEABLES_EL - a.NB_VP_RECHARGEABLES_EL);
        labels = communes.map(c => c.LIBGEO);
        data = communes.map(c => c.NB_VP_RECHARGEABLES_EL);
        title = 'Nombre de véhicules électriques';
    } else {
        // Calculer et trier par pourcentage
        communes.forEach(c => {
            c.pourcentage = (c.NB_VP_RECHARGEABLES_EL / c.NB_VP * 100).toFixed(2);
        });
        communes.sort((a, b) => b.pourcentage - a.pourcentage);
        labels = communes.map(c => c.LIBGEO);
        data = communes.map(c => parseFloat(c.pourcentage));
        title = 'Pourcentage de véhicules électriques';
    }

    // Détruire le graphique existant s'il y en a un
    if (window.communesChart) {
        window.communesChart.destroy();
    }

    // Créer un nouveau graphique
    window.communesChart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)',
                    'rgba(40, 159, 64, 0.6)',
                    'rgba(210, 199, 199, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(40, 159, 64, 1)',
                    'rgba(210, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
            plugins: {
                legend: {
                    position: 'top',
                    display: chartType !== 'bar' && chartType !== 'horizontalBar'
                },
                title: {
                    display: true,
                    text: metric === 'nombre' ? 'Top communes par nombre de véhicules électriques' : 'Top communes par % de véhicules électriques'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: chartType !== 'horizontalBar' && chartType !== 'pie',
                        text: metric === 'nombre' ? 'Nombre de véhicules' : 'Pourcentage (%)'
                    }
                },
                x: {
                    title: {
                        display: chartType === 'horizontalBar',
                        text: metric === 'nombre' ? 'Nombre de véhicules' : 'Pourcentage (%)'
                    }
                }
            }
        }
    });
}

// Fonction pour remplir le tableau des communes
function populateCommunesTable(communes) {
    const tableBody = document.querySelector('#communes-table tbody');
    tableBody.innerHTML = '';

    communes.forEach(commune => {
        const pourcentage = ((commune.NB_VP_RECHARGEABLES_EL / commune.NB_VP) * 100).toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${commune.LIBGEO}</td>
      <td>${commune.CODGEO}</td>
      <td>${commune.NB_VP_RECHARGEABLES_EL.toLocaleString('fr-FR')}</td>
      <td>${pourcentage}%</td>
      <td>${commune.NB_VP.toLocaleString('fr-FR')}</td>
    `;

        tableBody.appendChild(row);
    });
}

// Fonction pour configurer les contrôles du graphique des communes
function setupCommunesChartControls() {
    const chartTypeSelector = document.getElementById('communes-chart-type');
    const metricSelector = document.getElementById('communes-metric');
    const minVehiculesInput = document.getElementById('min-vehicules');
    const exportButton = document.getElementById('export-communes-data');

    // Événements pour mettre à jour le graphique
    chartTypeSelector.addEventListener('change', () => loadTopCommunes());
    metricSelector.addEventListener('change', () => loadTopCommunes());
    minVehiculesInput.addEventListener('change', () => loadTopCommunes());

    // Événement pour exporter les données
    exportButton.addEventListener('click', () => {
        const departement = document.getElementById('departement-filter').value;
        const metric = document.getElementById('communes-metric').value;
        const minVehicules = document.getElementById('min-vehicules').value || 0;

        let url = '';

        if (metric === 'nombre') {
            url = `/api/vehicules/communes/top/nombre?limit=50&minVehicules=${minVehicules}`;
            if (departement) {
                url = `/api/vehicules/communes/departement/${departement}`;
            }
        } else {
            url = `/api/vehicules/communes/top/pourcentage?limit=50&minVehicules=${minVehicules}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let communes = data.data;

                    // Si c'est une recherche par département, utiliser les communes
                    if (departement && communes.communes) {
                        communes = communes.communes;
                    }

                    exportCommunesToCSV(communes);
                }
            })
            .catch(error => console.error('Erreur lors de l\'export des données:', error));
    });
}

// Fonction pour exporter les données des communes au format CSV
function exportCommunesToCSV(communes) {
    // Créer les en-têtes CSV
    let csvContent = 'Commune,Code,Vehicules electriques,Pourcentage,Total vehicules\n';

    // Ajouter chaque ligne de données
    communes.forEach(commune => {
        const pourcentage = ((commune.NB_VP_RECHARGEABLES_EL / commune.NB_VP) * 100).toFixed(2);
        csvContent += `"${commune.LIBGEO}",${commune.CODGEO},${commune.NB_VP_RECHARGEABLES_EL},${pourcentage},${commune.NB_VP}\n`;
    });

    // Créer un objet Blob avec le contenu CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `communes-vehicules-electriques.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Fonction pour charger les données de comparaison
// Fonction pour charger les données de comparaison
function loadComparisonData() {
    // Initialiser le contenu de l'onglet Comparaisons
    const comparisonTab = document.getElementById('comparaison-tab');
    comparisonTab.innerHTML = `
    <div class="comparison-container">
      <h2>Comparaison de territoires</h2>
      
      <div class="comparison-controls">
        <div class="entity-type-selector">
          <label for="entity-type">Type de territoire :</label>
          <select id="entity-type">
            <option value="region">Régions</option>
            <option value="departement">Départements</option>
            <option value="commune">Communes</option>
          </select>
        </div>
        
        <div class="entity-selector">
          <label for="entity1">Territoire 1 :</label>
          <select id="entity1">
            <option value="">Sélectionnez un territoire</option>
          </select>
        </div>
        
        <div class="entity-selector">
          <label for="entity2">Territoire 2 :</label>
          <select id="entity2">
            <option value="">Sélectionnez un territoire</option>
          </select>
        </div>
        
        <button id="compare-button" class="btn">Comparer</button>
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
                <th id="entity1-name">Territoire 1</th>
                <th id="entity2-name">Territoire 2</th>
                <th>Différence</th>
              </tr>
            </thead>
            <tbody>
              <!-- Les données seront injectées ici -->
            </tbody>
          </table>
          <button id="export-comparison" class="export-btn">Exporter la comparaison</button>
        </div>
      </div>
    </div>
  `;

    // Configurer le changement de type d'entité
    document.getElementById('entity-type').addEventListener('change', loadEntitiesForComparison);

    // Charger la liste des entités initiale (régions par défaut)
    loadEntitiesForComparison();

    // Configurer le bouton de comparaison
    document.getElementById('compare-button').addEventListener('click', compareEntities);

    // Configurer le bouton d'export
    document.getElementById('export-comparison').addEventListener('click', exportComparisonData);
}

// Fonction pour charger les entités selon le type sélectionné
function loadEntitiesForComparison() {
    const entityType = document.getElementById('entity-type').value;
    const entity1Select = document.getElementById('entity1');
    const entity2Select = document.getElementById('entity2');

    // Réinitialiser les sélecteurs
    entity1Select.innerHTML = '<option value="">Sélectionnez un territoire</option>';
    entity2Select.innerHTML = '<option value="">Sélectionnez un territoire</option>';

    let apiEndpoint = '';

    switch(entityType) {
        case 'region':
            apiEndpoint = '/api/vehicules/regions';
            break;
        case 'departement':
            apiEndpoint = '/api/departements';
            break;
        case 'commune':
            apiEndpoint = '/api/vehicules/communes?limit=100'; // Limiter pour éviter de charger trop de communes
            break;
    }

    fetch(apiEndpoint)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let entities = [];

                // Adapter selon le type d'entité
                if (entityType === 'region') {
                    entities = data.data;
                    entities.sort((a, b) => a.REGION.localeCompare(b.REGION));

                    entities.forEach(entity => {
                        const option1 = document.createElement('option');
                        option1.value = entity.REGION;
                        option1.textContent = entity.REGION;
                        entity1Select.appendChild(option1);

                        const option2 = document.createElement('option');
                        option2.value = entity.REGION;
                        option2.textContent = entity.REGION;
                        entity2Select.appendChild(option2);
                    });
                }
                else if (entityType === 'departement') {
                    entities = data.data;
                    entities.sort((a, b) => a.DEPARTEMENT.localeCompare(b.DEPARTEMENT));

                    entities.forEach(entity => {
                        const option1 = document.createElement('option');
                        option1.value = entity.DEPARTEMENT;
                        option1.textContent = `${entity.DEPARTEMENT} - ${entity.NOM}`;
                        entity1Select.appendChild(option1);

                        const option2 = document.createElement('option');
                        option2.value = entity.DEPARTEMENT;
                        option2.textContent = `${entity.DEPARTEMENT} - ${entity.NOM}`;
                        entity2Select.appendChild(option2);
                    });
                }
                else if (entityType === 'commune') {
                    entities = data.data.vehiculesCommune;
                    entities.sort((a, b) => a.LIBGEO.localeCompare(b.LIBGEO));

                    entities.forEach(entity => {
                        const option1 = document.createElement('option');
                        option1.value = entity.CODGEO;
                        option1.textContent = entity.LIBGEO;
                        entity1Select.appendChild(option1);

                        const option2 = document.createElement('option');
                        option2.value = entity.CODGEO;
                        option2.textContent = entity.LIBGEO;
                        entity2Select.appendChild(option2);
                    });
                }

                // Sélectionner par défaut les deux premières entités
                if (entities.length >= 2) {
                    entity1Select.selectedIndex = 1;
                    entity2Select.selectedIndex = 2;
                }
            }
        })
        .catch(error => console.error(`Erreur lors du chargement des ${entityType}s:`, error));
}

// Fonction pour comparer les entités sélectionnées
function compareEntities() {
    const entityType = document.getElementById('entity-type').value;
    const entity1Id = document.getElementById('entity1').value;
    const entity2Id = document.getElementById('entity2').value;

    if (!entity1Id || !entity2Id) {
        alert('Veuillez sélectionner deux territoires à comparer');
        return;
    }

    // Mettre à jour les en-têtes du tableau
    const entity1Name = document.getElementById('entity1').options[document.getElementById('entity1').selectedIndex].text;
    const entity2Name = document.getElementById('entity2').options[document.getElementById('entity2').selectedIndex].text;

    document.getElementById('entity1-name').textContent = entity1Name;
    document.getElementById('entity2-name').textContent = entity2Name;

    // Charger les données pour les deux entités
    Promise.all([
        fetchEntityData(entityType, entity1Id, entity1Name),
        fetchEntityData(entityType, entity2Id, entity2Name)
    ])
        .then(([data1, data2]) => {
            // Créer les graphiques de comparaison
            createVehiclesComparisonChart(data1, data2);
            createStationsComparisonChart(data1, data2);
            createRatioComparisonChart(data1, data2);

            // Remplir le tableau comparatif
            populateComparisonTable(data1, data2);
        })
        .catch(error => console.error('Erreur lors de la comparaison des territoires:', error));
}

// Fonction pour récupérer les données d'une entité
function fetchEntityData(entityType, entityId, entityName) {
    let vehiclesPromise, bornesPromise;

    switch(entityType) {
        case 'region':
            vehiclesPromise = fetch(`/api/vehicules/regions/nom/${entityId}`)
                .then(response => response.json())
                .then(data => data.success ? data.data : null);

            bornesPromise = fetch(`/api/bornes/communes/region/${entityId}`)
                .then(response => response.json())
                .then(data => data.success ? data.data : { totalBornes: 0 });
            break;

        case 'departement':
            vehiclesPromise = fetch(`/api/vehicules/communes/departement/${entityId}`)
                .then(response => response.json())
                .then(data => data.success ? {
                    somme_NB_VP_RECHARGEABLES_EL: data.data.totalVehicules || 0
                } : null);

            bornesPromise = fetch(`/api/bornes/communes/departement/${entityId}`)
                .then(response => response.json())
                .then(data => data.success ? data.data : { totalBornes: 0 });
            break;

        case 'commune':
            vehiclesPromise = fetch(`/api/vehicules/communes/code/${entityId}`)
                .then(response => response.json())
                .then(data => data.success ? {
                    somme_NB_VP_RECHARGEABLES_EL: data.data.NB_VP_RECHARGEABLES_EL || 0
                } : null);

            bornesPromise = fetch(`/api/bornes/communes/commune/${entityName}`)
                .then(response => response.json())
                .then(data => data.success ? {
                    totalBornes: data.data.nombre_bornes || 0
                } : { totalBornes: 0 });
            break;
    }

    return Promise.all([vehiclesPromise, bornesPromise])
        .then(([vehiculesData, bornesData]) => {
            // Retourner un objet avec toutes les données
            return {
                nom: entityName,
                vehicules: vehiculesData ? vehiculesData.somme_NB_VP_RECHARGEABLES_EL : 0,
                bornes: bornesData.totalBornes || 0,
                pointsDeCharge: bornesData.totalPointsDeCharge || bornesData.totalBornes || 0,
                ratio: bornesData.totalBornes > 0 ?
                    (vehiculesData.somme_NB_VP_RECHARGEABLES_EL / bornesData.totalBornes).toFixed(1) : 'N/A'
            };
        });
}




// Fonction pour créer le graphique de comparaison des véhicules
function createVehiclesComparisonChart(data1, data2) {
    const ctx = document.getElementById('vehicles-comparison-chart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.vehiclesComparisonChart) {
        window.vehiclesComparisonChart.destroy();
    }

    window.vehiclesComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Véhicules électriques'],
            datasets: [
                {
                    label: data1.nom,
                    data: [data1.vehicules],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: data2.nom,
                    data: [data2.vehicules],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour créer le graphique de comparaison des bornes
function createStationsComparisonChart(data1, data2) {
    const ctx = document.getElementById('stations-comparison-chart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.stationsComparisonChart) {
        window.stationsComparisonChart.destroy();
    }

    window.stationsComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Bornes', 'Points de charge'],
            datasets: [
                {
                    label: data1.nom,
                    data: [data1.bornes, data1.pointsDeCharge],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: data2.nom,
                    data: [data2.bornes, data2.pointsDeCharge],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour créer le graphique de comparaison des ratios
function createRatioComparisonChart(data1, data2) {
    const ctx = document.getElementById('ratio-comparison-chart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.ratioComparisonChart) {
        window.ratioComparisonChart.destroy();
    }

    const ratio1 = parseFloat(data1.ratio) || 0;
    const ratio2 = parseFloat(data2.ratio) || 0;

    window.ratioComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Véhicules par borne'],
            datasets: [
                {
                    label: data1.nom,
                    data: [ratio1],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: data2.nom,
                    data: [ratio2],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour remplir le tableau comparatif
function populateComparisonTable(data1, data2) {
    const tableBody = document.querySelector('#comparison-table tbody');

    // Vider le tableau avant de le remplir
    tableBody.innerHTML = '';

    // Calculer les différences
    const vehiculesDiff = data1.vehicules - data2.vehicules;
    const bornesDiff = data1.bornes - data2.bornes;
    const pointsDiff = data1.pointsDeCharge - data2.pointsDeCharge;

    // Calculer la différence de ratio (en gérant les cas où ratio est "N/A")
    let ratioDiff = 0;
    if (data1.ratio !== 'N/A' && data2.ratio !== 'N/A') {
        ratioDiff = parseFloat(data1.ratio) - parseFloat(data2.ratio);
    } else {
        ratioDiff = 'N/A';
    }

    // Ajouter les lignes au tableau
    const rows = [
        {
            indicator: 'Véhicules électriques',
            value1: data1.vehicules.toLocaleString('fr-FR'),
            value2: data2.vehicules.toLocaleString('fr-FR'),
            diff: vehiculesDiff.toLocaleString('fr-FR'),
            diffClass: vehiculesDiff > 0 ? 'positive' : vehiculesDiff < 0 ? 'negative' : ''
        },
        {
            indicator: 'Bornes de recharge',
            value1: data1.bornes.toLocaleString('fr-FR'),
            value2: data2.bornes.toLocaleString('fr-FR'),
            diff: bornesDiff.toLocaleString('fr-FR'),
            diffClass: bornesDiff > 0 ? 'positive' : bornesDiff < 0 ? 'negative' : ''
        },
        {
            indicator: 'Points de charge',
            value1: data1.pointsDeCharge.toLocaleString('fr-FR'),
            value2: data2.pointsDeCharge.toLocaleString('fr-FR'),
            diff: pointsDiff.toLocaleString('fr-FR'),
            diffClass: pointsDiff > 0 ? 'positive' : pointsDiff < 0 ? 'negative' : ''
        },
        {
            indicator: 'Véhicules par borne',
            value1: data1.ratio,
            value2: data2.ratio,
            diff: typeof ratioDiff === 'number' ? ratioDiff.toFixed(1) : ratioDiff,
            diffClass: ratioDiff > 0 ? 'positive' : ratioDiff < 0 ? 'negative' : ''
        }
    ];

    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${row.indicator}</td>
      <td>${row.value1}</td>
      <td>${row.value2}</td>
      <td class="${row.diffClass}">${row.diff}</td>
    `;
        tableBody.appendChild(tr);
    });
}


// Fonction pour exporter les données de comparaison
function exportComparisonData() {
    const region1 = document.getElementById('region1').value;
    const region2 = document.getElementById('region2').value;

    if (!region1 || !region2) {
        alert('Veuillez d\'abord effectuer une comparaison');
        return;
    }

    Promise.all([
        fetchRegionData(region1),
        fetchRegionData(region2)
    ])
        .then(([data1, data2]) => {
            // Créer le contenu CSV
            let csvContent = 'Indicateur,' + data1.nom + ',' + data2.nom + ',Différence\n';

            // Calculer les différences
            const vehiculesDiff = data1.vehicules - data2.vehicules;
            const bornesDiff = data1.bornes - data2.bornes;
            const pointsDiff = data1.pointsDeCharge - data2.pointsDeCharge;
            const ratioDiff = parseFloat(data1.ratio) - parseFloat(data2.ratio);

            // Ajouter les lignes
            csvContent += `Véhicules électriques,${data1.vehicules},${data2.vehicules},${vehiculesDiff}\n`;
            csvContent += `Bornes de recharge,${data1.bornes},${data2.bornes},${bornesDiff}\n`;
            csvContent += `Points de charge,${data1.pointsDeCharge},${data2.pointsDeCharge},${pointsDiff}\n`;
            csvContent += `Véhicules par borne,${data1.ratio},${data2.ratio},${ratioDiff.toFixed(1)}\n`;

            // Créer un objet Blob avec le contenu CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Créer un lien de téléchargement
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `comparaison-${data1.nom}-${data2.nom}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => console.error('Erreur lors de l\'export des données:', error));
}


function loadCorrelationData() {
    console.log('Chargement des données de corrélation...');
    // À implémenter dans la prochaine étape
}
