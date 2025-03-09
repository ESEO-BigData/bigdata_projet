// src/pages/Statistics.js
import Chart from 'chart.js/auto';

export function renderStatistics(container) {
    container.innerHTML = `
    <section class="statistics-section">
      <h1>Statistiques des véhicules électriques</h1>
      
      <div class="chart-container">
        <h2>Véhicules électriques par région</h2>
        <canvas id="regions-chart"></canvas>
      </div>
      
      <div class="chart-container">
        <h2>Top 10 des communes avec le plus de véhicules électriques</h2>
        <canvas id="communes-chart"></canvas>
      </div>
    </section>
  `;

    // Charger les données des régions
    fetch('/api/vehicules/regions')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                createRegionsChart(data.data);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des données des régions:', error));

    // Charger les données des communes
    fetch('/api/vehicules/communes/top/nombre?limit=10')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                createCommunesChart(data.data);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des données des communes:', error));
}

function createRegionsChart(regions) {
    const ctx = document.getElementById('regions-chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: regions.map(region => region.REGION),
            datasets: [{
                label: 'Nombre de véhicules électriques',
                data: regions.map(region => region.somme_NB_VP_RECHARGEABLES_EL),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
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

function createCommunesChart(communes) {
    const ctx = document.getElementById('communes-chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes.map(commune => commune.LIBGEO),
            datasets: [{
                label: 'Nombre de véhicules électriques',
                data: communes.map(commune => commune.NB_VP_RECHARGEABLES_EL),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
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
