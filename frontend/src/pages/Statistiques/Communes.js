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

//Rajout
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