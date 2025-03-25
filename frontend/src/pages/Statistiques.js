import Chart from 'chart.js/auto';
import { renderCommunesData } from './Statistiques/Communes';

export function renderStatistics(container) {
    container.innerHTML = `
    <h1>Statistiques</h1>
    <div class="stats-navigation">
      <ul>
        <li><a href="#" id="nav-dashboard" class="active">Tableau de bord</a></li>
        <li><a href="#" id="nav-regions">Véhicules par région</a></li>
        <li><a href="#" id="nav-communes">Communes et départements</a></li>
        <li><a href="#" id="nav-correlation">Corrélation</a></li>
      </ul>
    </div>
    <div id="stats-content"></div>
  `;

    const contentDiv = document.getElementById('stats-content');
    const navDashboard = document.getElementById('nav-dashboard');
    const navRegions = document.getElementById('nav-regions');
    const navCommunes = document.getElementById('nav-communes');
    const navCorrelation = document.getElementById('nav-correlation');

    // Fonction pour mettre à jour l'onglet actif
    function updateActiveTab(activeTab) {
        [navDashboard, navRegions, navCommunes, navCorrelation].forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
    }

    // Gestionnaires d'événements pour les onglets
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navDashboard);
        renderDashboard(contentDiv);
    });

    navRegions.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navRegions);
        renderRegionsData(contentDiv);
    });

    navCommunes.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navCommunes);
        renderCommunesData(contentDiv);
    });

    navCorrelation.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navCorrelation);
        renderCorrelationData(contentDiv);
    });

    // Afficher le tableau de bord par défaut
    renderDashboard(contentDiv);
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
/*
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
*/

// Fonction pour charger le top 10 des départements
/*
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
*/

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
/*
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
*/

// Fonction pour configurer les contrôles de tri avec changement automatique
/*
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
*/
/*
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
*/

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

// Fonction pour charger les données de comparaison
function loadComparisonData() {
    // Initialiser le contenu de l'onglet Comparaisons
    const comparisonTab = document.getElementById('comparaison-tab');
    comparisonTab.innerHTML = `
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

    // Si le type n'est pas communes, charger les options
    const territoryType = document.getElementById('territory-type').value;
    if (territoryType !== 'communes') {
        loadTerritoryOptions();
    }
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
                    territories = data.data.departements.map(dept => ({
                        id: dept.code,
                        name: `${dept.code} - ${dept.departement}`
                    }));
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
                        resultItem.textContent = `${commune.commune} (${commune.code_postal})`;
                        resultItem.dataset.id = commune.commune;
                        resultItem.dataset.name = `${commune.commune} (${commune.code_postal})`;

                        resultItem.addEventListener('click', () => {
                            searchInput.value = resultItem.dataset.name;
                            hiddenInput.value = resultItem.dataset.id;
                            resultsContainer.innerHTML = '';
                            compareSelectedTerritories();
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

// Fonction pour comparer les territoires sélectionnés
function compareSelectedTerritories() {
    const territoryType = document.getElementById('territory-type').value;
    let territory1, territory2, territory1Name, territory2Name;

    if (territoryType === 'communes') {
        territory1 = document.getElementById('territory1').value;
        territory2 = document.getElementById('territory2').value;
        territory1Name = document.getElementById('territory1-search').value;
        territory2Name = document.getElementById('territory2-search').value;
    } else {
        territory1 = document.getElementById('territory1').value;
        territory2 = document.getElementById('territory2').value;
        territory1Name = territory1 ? document.getElementById('territory1').options[document.getElementById('territory1').selectedIndex].text : '';
        territory2Name = territory2 ? document.getElementById('territory2').options[document.getElementById('territory2').selectedIndex].text : '';
    }

    // Vérifier que les deux territoires sont sélectionnés
    if (!territory1 || !territory2) {
        return;
    }

    // Vérifier que les deux territoires sont différents
    if (territory1 === territory2) {
        alert('Veuillez sélectionner deux territoires différents pour la comparaison.');
        return;
    }

    // Mettre à jour les noms des territoires dans le tableau
    document.getElementById('territory1-name').textContent = territory1Name;
    document.getElementById('territory2-name').textContent = territory2Name;

    // Charger les données pour la comparaison
    if (territoryType === 'regions') {
        // Code existant pour les régions
        const apiUrl = `/api/bornes-communes/comparer/${encodeURIComponent(territory1)}/${encodeURIComponent(territory2)}`;

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
            fetch(`/api/bornes-communes/departement/${territory1}`).then(res => res.json()),
            fetch(`/api/bornes-communes/departement/${territory2}`).then(res => res.json())
        ])
            .then(([data1, data2]) => {
                if (data1.success && data2.success) {
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
                }
            })
            .catch(error => {
                console.error('Erreur lors de la comparaison des départements:', error);
                showComparisonError();
            });
    } else if (territoryType === 'communes') {
        // Nouveau code pour les communes
        Promise.all([
            fetch(`/api/bornes-communes/commune/${encodeURIComponent(territory1)}`).then(res => res.json()),
            fetch(`/api/bornes-communes/commune/${encodeURIComponent(territory2)}`).then(res => res.json())
        ])
            .then(([data1, data2]) => {
                if (data1.success && data2.success) {
                    const commune1 = data1.data;
                    const commune2 = data2.data;

                    const comparisonData = {
                        commune1: {
                            commune: commune1.commune,
                            code_postal: commune1.code_postal,
                            totalVehiculesElectriques: commune1.NB_VP_RECHARGEABLES_EL,
                            totalVehicules: commune1.NB_VP,
                            totalBornes: commune1.nombre_bornes,
                            totalPointsCharge: commune1.nombre_points_charge,
                            pourcentageVehiculesElectriques: ((commune1.NB_VP_RECHARGEABLES_EL / commune1.NB_VP) * 100).toFixed(2),
                            ratioVehiculesParBorne: commune1.nombre_bornes > 0 ? (commune1.NB_VP_RECHARGEABLES_EL / commune1.nombre_bornes).toFixed(2) : 'N/A'
                        },
                        commune2: {
                            commune: commune2.commune,
                            code_postal: commune2.code_postal,
                            totalVehiculesElectriques: commune2.NB_VP_RECHARGEABLES_EL,
                            totalVehicules: commune2.NB_VP,
                            totalBornes: commune2.nombre_bornes,
                            totalPointsCharge: commune2.nombre_points_charge,
                            pourcentageVehiculesElectriques: ((commune2.NB_VP_RECHARGEABLES_EL / commune2.NB_VP) * 100).toFixed(2),
                            ratioVehiculesParBorne: commune2.nombre_bornes > 0 ? (commune2.NB_VP_RECHARGEABLES_EL / commune2.nombre_bornes).toFixed(2) : 'N/A'
                        }
                    };

                    createCommuneComparisonCharts(comparisonData);
                    populateCommuneComparisonTable(comparisonData);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la comparaison des communes:', error);
                showComparisonError();
            });
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
function showComparisonError() {
    const comparisonResults = document.querySelector('.comparison-results');
    comparisonResults.innerHTML = `
    <div class="error-message">
      <p>Une erreur s'est produite lors de la comparaison des territoires.</p>
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

function loadCorrelationData() {
    console.log('Chargement des données de corrélation...');
    // À implémenter dans la prochaine étape
}
