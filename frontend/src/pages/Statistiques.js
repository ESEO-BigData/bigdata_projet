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

// Fonction pour charger les données des communes
function loadCommunesData() {
    // Initialiser le contenu de l'onglet Communes
    const communesTab = document.getElementById('communes-tab');
    communesTab.innerHTML = `
    <div class="departements-container">
      <h2>Top 10 des départements par nombre de véhicules électriques</h2>
      
      <div class="filter-container">
        <div class="departement-selector">
        <div class="sort-controls">
  <div class="sort-by">
    <label for="sort-by-select">Trier par :</label>
    <select id="sort-by-select">
      <option value="vehiculesElectriques">Véhicules électriques</option>
      <option value="vehiculesThermiques">Véhicules thermiques</option>
      <option value="bornes">Bornes de recharge</option>
    </select>
  </div>
  <div class="sort-order">
    <label for="sort-order-select">Ordre :</label>
    <select id="sort-order-select">
      <option value="desc">Décroissant</option>
      <option value="asc">Croissant</option>
    </select>
  </div>
</div>
          <label for="departement-select">Sélectionner un département :</label>
          <select id="departement-select">
            <option value="">Choisir un département</option>
          </select>
        </div>
      </div>
      
      <div class="chart-container">
        <canvas id="departements-chart"></canvas>
      </div>
    </div>
    
    <div class="communes-container" style="display: none;">
      <div class="back-button-container">
        <button id="back-to-departements" class="btn">← Retour aux départements</button>
        <div class="sort-controls">
  <div class="sort-by">
    <label for="communes-sort-by-select">Trier par :</label>
    <select id="communes-sort-by-select">
      <option value="vehiculesElectriques">Véhicules électriques</option>
      <option value="vehiculesThermiques">Véhicules thermiques</option>
      <option value="bornes">Bornes de recharge</option>
    </select>
  </div>
  <div class="sort-order">
    <label for="communes-sort-order-select">Ordre :</label>
    <select id="communes-sort-order-select">
      <option value="desc">Décroissant</option>
      <option value="asc">Croissant</option>
    </select>
  </div>
</div>

      </div>
      
      <h2>Communes du département <span id="selected-departement-name"></span></h2>
      
      <div class="chart-container">
        <canvas id="communes-by-departement-chart"></canvas>
      </div>
      
      <div class="data-table-container">
  <h3>Liste des communes</h3>
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
  <div class="pagination-controls">
    <button id="prev-page" class="pagination-btn">Précédent</button>
    <span id="page-info">Page 1 sur 1</span>
    <button id="next-page" class="pagination-btn">Suivant</button>
  </div>
    <div class="export-container">
    <button id="export-communes-csv" class="export-btn">Exporter en CSV</button>
  </div>
</div>
    </div>
  `;

    // Charger les données des départements
    loadTopDepartements();

    // Configurer le sélecteur de département
    setupDepartementSelector();

    // Configurer les contrôles de tri
    setupSortControls();

    // Configurer le bouton d'export
    setupExportButton();
    // Configurer le bouton de retour
    document.getElementById('back-to-departements').addEventListener('click', () => {
        document.querySelector('.departements-container').style.display = 'block';
        document.querySelector('.communes-container').style.display = 'none';
    });
}

// Fonction pour charger le top 10 des départements
function loadTopDepartements() {
    fetch('/api/bornes-communes/statistiques/correlation')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Trier les départements par nombre de véhicules électriques
                const departements = data.data.departements
                    .sort((a, b) => b.totalVehiculesElectriques - a.totalVehiculesElectriques)
                    .slice(0, 10);

                createDepartementsChart(departements);
                populateDepartementSelector(data.data.departements);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des départements:', error));
}

// Fonction pour créer le graphique des départements
function createDepartementsChart(departements, sortBy = 'vehiculesElectriques', sortOrder = 'desc') {
    const ctx = document.getElementById('departements-chart').getContext('2d');

    // Trier les départements selon le critère choisi
    departements.sort((a, b) => {
        let valueA, valueB;

        switch(sortBy) {
            case 'vehiculesElectriques':
                valueA = a.totalVehiculesElectriques;
                valueB = b.totalVehiculesElectriques;
                break;
            case 'vehiculesThermiques':
                valueA = a.totalVehicules - a.totalVehiculesElectriques;
                valueB = b.totalVehicules - b.totalVehiculesElectriques;
                break;
            case 'bornes':
                valueA = a.totalBornes;
                valueB = b.totalBornes;
                break;
        }

        return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
    });

    // Limiter à 10 départements
    const topDepartements = departements.slice(0, 10);

    // Détruire le graphique existant s'il y en a un
    if (window.departementsChart) {
        window.departementsChart.destroy();
    }

    // Créer un nouveau graphique
    window.departementsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topDepartements.map(dept => `${dept.code} - ${dept.departement}`),
            datasets: [
                {
                    label: 'Véhicules électriques',
                    data: topDepartements.map(dept => dept.totalVehiculesElectriques),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Véhicules thermiques',
                    data: topDepartements.map(dept => dept.totalVehicules - dept.totalVehiculesElectriques),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Bornes de recharge',
                    data: topDepartements.map(dept => dept.totalBornes),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Top 10 des départements'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre'
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const departementCode = topDepartements[index].code;
                    const departementName = topDepartements[index].departement;
                    loadCommunesByDepartement(departementCode, departementName);
                }
            }
        }
    });
}

// Fonction pour remplir le sélecteur de départements
function populateDepartementSelector(departements) {
    const select = document.getElementById('departement-select');

    // Trier les départements par code
    departements.sort((a, b) => a.code.localeCompare(b.code));

    departements.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.code;
        option.textContent = `${dept.code} - ${dept.departement}`;
        select.appendChild(option);
    });
}

// Fonction pour configurer le sélecteur de département
function setupDepartementSelector() {
    const select = document.getElementById('departement-select');

    select.addEventListener('change', () => {
        const departementCode = select.value;
        if (departementCode) {
            const departementName = select.options[select.selectedIndex].text.split(' - ')[1];
            loadCommunesByDepartement(departementCode, departementName);
        }
    });
}

// Fonction pour configurer les contrôles de tri avec changement automatique
function setupSortControls() {
    // Contrôles de tri pour les départements
    document.getElementById('sort-by-select').addEventListener('change', () => {
        applyDepartementSort();
    });

    document.getElementById('sort-order-select').addEventListener('change', () => {
        applyDepartementSort();
    });

    // Contrôles de tri pour les communes
    document.getElementById('communes-sort-by-select').addEventListener('change', () => {
        applyCommunesSort();
    });

    document.getElementById('communes-sort-order-select').addEventListener('change', () => {
        applyCommunesSort();
    });
}

function setupExportButton() {
    document.getElementById('export-communes-csv').addEventListener('click', () => {
        // Créer le contenu CSV
        let csvContent = 'Commune,Code postal,Véhicules électriques,Pourcentage,Total véhicules,Bornes de recharge\n';

        communesData.forEach(commune => {
            const pourcentage = ((commune.NB_VP_RECHARGEABLES_EL / commune.NB_VP) * 100).toFixed(2);
            csvContent += `"${commune.commune}","${commune.code_postal}",${commune.NB_VP_RECHARGEABLES_EL},${pourcentage},${commune.NB_VP},${commune.nombre_bornes}\n`;
        });

        // Créer un objet Blob avec le contenu CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Créer un lien de téléchargement
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `communes-${document.getElementById('selected-departement-name').textContent}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Fonction pour appliquer le tri aux départements
function applyDepartementSort() {
    const sortBy = document.getElementById('sort-by-select').value;
    const sortOrder = document.getElementById('sort-order-select').value;

    // Sauvegarder l'état actuel des légendes si le graphique existe
    let hiddenDatasets = [];
    if (window.departementsChart) {
        hiddenDatasets = window.departementsChart.data.datasets.map(dataset =>
            !window.departementsChart.isDatasetVisible(
                window.departementsChart.data.datasets.indexOf(dataset)
            )
        );
    }

    fetch('/api/bornes-communes/statistiques/correlation')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                createDepartementsChart(data.data.departements, sortBy, sortOrder);

                // Restaurer l'état des légendes
                if (hiddenDatasets.length > 0 && window.departementsChart) {
                    hiddenDatasets.forEach((isHidden, index) => {
                        if (isHidden && index < window.departementsChart.data.datasets.length) {
                            window.departementsChart.setDatasetVisibility(index, false);
                        }
                    });
                    window.departementsChart.update();
                }
            }
        })
        .catch(error => console.error('Erreur lors du chargement des départements:', error));
}

// Fonction pour appliquer le tri aux communes
function applyCommunesSort() {
    const sortBy = document.getElementById('communes-sort-by-select').value;
    const sortOrder = document.getElementById('communes-sort-order-select').value;
    const departementCode = document.getElementById('selected-departement-code').value;

    // Sauvegarder l'état actuel des légendes si le graphique existe
    let hiddenDatasets = [];
    if (window.communesByDepartementChart) {
        hiddenDatasets = window.communesByDepartementChart.data.datasets.map(dataset =>
            !window.communesByDepartementChart.isDatasetVisible(
                window.communesByDepartementChart.data.datasets.indexOf(dataset)
            )
        );
    }

    fetch(`/api/bornes-communes/departement/${departementCode}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                createCommunesByDepartementChart(data.data.communes, sortBy, sortOrder);

                // Restaurer l'état des légendes
                if (hiddenDatasets.length > 0 && window.communesByDepartementChart) {
                    hiddenDatasets.forEach((isHidden, index) => {
                        if (isHidden && index < window.communesByDepartementChart.data.datasets.length) {
                            window.communesByDepartementChart.setDatasetVisibility(index, false);
                        }
                    });
                    window.communesByDepartementChart.update();
                }
            }
        })
        .catch(error => console.error('Erreur lors du chargement des communes:', error));
}

// Fonction pour charger les communes d'un département
function loadCommunesByDepartement(departementCode, departementName) {
    fetch(`/api/bornes-communes/departement/${departementCode}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Afficher le conteneur des communes et masquer celui des départements
                document.querySelector('.departements-container').style.display = 'none';
                document.querySelector('.communes-container').style.display = 'block';

                // Stocker le code du département pour les tris futurs
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.id = 'selected-departement-code';
                hiddenInput.value = departementCode;
                document.querySelector('.communes-container').appendChild(hiddenInput);

                // Mettre à jour le nom du département sélectionné
                document.getElementById('selected-departement-name').textContent = departementName;

                // Obtenir les valeurs de tri actuelles
                const sortBy = document.getElementById('communes-sort-by-select').value;
                const sortOrder = document.getElementById('communes-sort-order-select').value;

                createCommunesByDepartementChart(data.data.communes, sortBy, sortOrder);
                populateCommunesTable(data.data.communes);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des communes:', error));
}

// Fonction pour créer le graphique des communes par département
function createCommunesByDepartementChart(communes, sortBy = 'vehiculesElectriques', sortOrder = 'desc') {
    const ctx = document.getElementById('communes-by-departement-chart').getContext('2d');

    // Trier les communes selon le critère choisi
    communes.sort((a, b) => {
        let valueA, valueB;

        switch(sortBy) {
            case 'vehiculesElectriques':
                valueA = a.NB_VP_RECHARGEABLES_EL;
                valueB = b.NB_VP_RECHARGEABLES_EL;
                break;
            case 'vehiculesThermiques':
                valueA = a.NB_VP - a.NB_VP_RECHARGEABLES_EL;
                valueB = b.NB_VP - b.NB_VP_RECHARGEABLES_EL;
                break;
            case 'bornes':
                valueA = a.nombre_bornes;
                valueB = b.nombre_bornes;
                break;
        }

        return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
    });

    // Limiter à 20 communes pour la lisibilité du graphique
    const topCommunes = communes.slice(0, 20);

    // Détruire le graphique existant s'il y en a un
    if (window.communesByDepartementChart) {
        window.communesByDepartementChart.destroy();
    }

    // Créer un nouveau graphique
    window.communesByDepartementChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topCommunes.map(commune => commune.commune),
            datasets: [
                {
                    label: 'Véhicules électriques',
                    data: topCommunes.map(commune => commune.NB_VP_RECHARGEABLES_EL),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Véhicules thermiques',
                    data: topCommunes.map(commune => commune.NB_VP - commune.NB_VP_RECHARGEABLES_EL),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Bornes de recharge',
                    data: topCommunes.map(commune => commune.nombre_bornes),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Top 20 des communes du département`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre'
                    }
                }
            }
        }
    });
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

// Variables globales pour la pagination
let currentPage = 1;
let communesData = [];
const rowsPerPage = 10;

// Fonction pour remplir le tableau des communes avec pagination
function populateCommunesTable(communes) {
    // Stocker les données pour la pagination
    communesData = communes;
    currentPage = 1;

    // Afficher la première page
    displayCommunesPage(currentPage);

    // Configurer les contrôles de pagination
    setupPaginationControls(communes.length);
}

// Fonction pour afficher une page spécifique du tableau
function displayCommunesPage(page) {
    const tableBody = document.querySelector('#communes-table tbody');
    tableBody.innerHTML = '';

    // Calculer les indices de début et de fin pour la page actuelle
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, communesData.length);

    // Afficher les communes pour la page actuelle
    for (let i = startIndex; i < endIndex; i++) {
        const commune = communesData[i];
        const pourcentage = ((commune.NB_VP_RECHARGEABLES_EL / commune.NB_VP) * 100).toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${commune.commune}</td>
      <td>${commune.code_postal}</td>
      <td>${commune.NB_VP_RECHARGEABLES_EL.toLocaleString('fr-FR')}</td>
      <td>${pourcentage}%</td>
      <td>${commune.NB_VP.toLocaleString('fr-FR')}</td>
    `;

        tableBody.appendChild(row);
    }

    // Mettre à jour l'information de page
    document.getElementById('page-info').textContent = `Page ${page} sur ${Math.ceil(communesData.length / rowsPerPage)}`;
}

// Fonction pour configurer les contrôles de pagination
function setupPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    // Mettre à jour l'état des boutons
    updatePaginationButtons(totalPages);

    // Configurer les événements des boutons
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayCommunesPage(currentPage);
            updatePaginationButtons(totalPages);
        }
    };

    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayCommunesPage(currentPage);
            updatePaginationButtons(totalPages);
        }
    };
}

// Fonction pour mettre à jour l'état des boutons de pagination
function updatePaginationButtons(totalPages) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
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
