import Chart from 'chart.js/auto';

export function renderCommunesData(container) {
    container.innerHTML = `
    <h2>Données des communes et départements</h2>
    <div id="communes-tab">
      <!-- Le contenu sera chargé par loadCommunesData() -->
    </div>
  `;

    loadCommunesData();
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