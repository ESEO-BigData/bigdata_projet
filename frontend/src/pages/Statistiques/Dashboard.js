import Chart from 'chart.js/auto';

export function renderDashboard(container) {
    container.innerHTML = `
    <h2>Tableau de bord des véhicules électriques</h2>
    <div class="dashboard-container">
      <div class="kpi-row">
        <div class="kpi-card" id="kpi-total-vehicules">
          <h3>Total véhicules électriques</h3>
          <div class="kpi-value">Chargement...</div>
        </div>
        <div class="kpi-card" id="kpi-total-bornes">
          <h3>Bornes de recharge</h3>
          <div class="kpi-value">Chargement...</div>
        </div>
        <div class="kpi-card" id="kpi-ratio">
          <h3>Véhicules par borne</h3>
          <div class="kpi-value">Chargement...</div>
        </div>
        <div class="kpi-card" id="kpi-top-region">
          <h3>Région leader</h3>
          <div class="kpi-value">Chargement...</div>
        </div>
      </div>
      
      <div class="chart-section">
        <h3>Véhicules électriques par région</h3>
        <div class="chart-container">
          <canvas id="regions-chart"></canvas>
        </div>
      </div>
      
      <div class="chart-controls">
  <label for="region-chart-type">Type de graphique :</label>
  <select id="region-chart-type">
    <option value="bar">Barres</option>
    <option value="pie">Camembert</option>
    <option value="line">Ligne</option>
  </select>
</div>

      
      <div class="table-section">
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
        <div class="export-container">
          <button id="export-regions-csv" class="export-btn">Exporter en CSV</button>
        </div>
      </div>
    </div>
  `;

    // Charger les KPIs et les données régionales
    loadKPIs();
    loadRegionsData();

    // Configurer les contrôles et boutons
    setupChartControls();
    setupExportButtons();
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
    // Vérifier si l'élément existe avant d'ajouter un écouteur d'événement
    const chartTypeSelector = document.getElementById('region-chart-type');

    if (chartTypeSelector) {
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
    } else {
        console.log('Élément region-chart-type non trouvé dans le DOM');
    }
}


// Fonction pour configurer les boutons d'export
function setupExportButtons() {
    // Vérifier si l'élément existe avant d'ajouter un écouteur d'événement
    const exportRegionsBtn = document.getElementById('export-regions-csv');

    if (exportRegionsBtn) {
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
    } else {
        console.log('Élément export-regions-data non trouvé dans le DOM');
    }
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
