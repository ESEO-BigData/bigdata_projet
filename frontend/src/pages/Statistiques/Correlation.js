import Chart from 'chart.js/auto';

export function renderCorrelationData(container) {
    container.innerHTML = `
    <section class="correlation-section">
      <h1>Analyse des corrélations</h1>
      
      <div class="kpi-dashboard">
        <div class="kpi-card">
          <h3>Coefficient de corrélation</h3>
          <div class="kpi-value" id="correlation-coefficient">Chargement...</div>
          <div class="kpi-description">Entre les variables sélectionnées</div>
        </div>
        
        <div class="kpi-card">
          <h3>Départements bien équipés</h3>
          <div class="kpi-value" id="well-equipped-count">Chargement...</div>
          <div class="kpi-description">Ratio bornes/véhicules > moyenne</div>
        </div>
        
        <div class="kpi-card">
          <h3>Départements sous-équipés</h3>
          <div class="kpi-value" id="under-equipped-count">Chargement...</div>
          <div class="kpi-description">Ratio bornes/véhicules < moyenne</div>
        </div>
      </div>
      
      <div class="correlation-controls">
        <div class="control-group">
          <label for="correlation-x">Variable X:</label>
          <select id="correlation-x">
            <option value="vehicules">Nombre de véhicules électriques</option>
            <option value="bornes">Nombre de bornes</option>
            <option value="stations">Nombre de stations</option>
            <option value="thermiques">Nombre de véhicules thermiques</option>
            <option value="population">Population</option>
            <option value="densite">Densité de population</option>
            <option value="superficie">Superficie</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="correlation-y">Variable Y:</label>
          <select id="correlation-y">
            <option value="bornes">Nombre de bornes</option>
            <option value="vehicules">Nombre de véhicules électriques</option>
            <option value="stations">Nombre de stations</option>
            <option value="thermiques">Nombre de véhicules thermiques</option>
            <option value="population">Population</option>
            <option value="densite">Densité de population</option>
            <option value="superficie">Superficie</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="correlation-filter">Filtrer par:</label>
          <select id="correlation-filter">
            <option value="departements">Départements</option>
            <option value="regions">Régions</option>
          </select>
        </div>
      </div>
      
      <div class="chart-container correlation-chart-container">
        <h2>Graphique de corrélation</h2>
        <canvas id="correlation-chart"></canvas>
      </div>
      
      <div class="correlation-insights">
        <h2>Analyse des résultats</h2>
        <div id="correlation-analysis">
          <p>Sélectionnez des variables et cliquez sur "Mettre à jour" pour voir l'analyse.</p>
        </div>
      </div>
      
      <div class="data-tables-container">
        <div class="data-table-container">
          <h2>Top 10 des départements bien équipés</h2>
          <table id="well-equipped-table" class="data-table">
            <thead>
              <tr>
                <th>Département</th>
                <th>Véhicules électriques</th>
                <th>Bornes</th>
                <th>Ratio (bornes/1000 véhicules)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Les données seront injectées ici -->
            </tbody>
          </table>
        </div>
        
        <div class="data-table-container">
          <h2>Top 10 des départements sous-équipés</h2>
          <table id="under-equipped-table" class="data-table">
            <thead>
              <tr>
                <th>Département</th>
                <th>Véhicules électriques</th>
                <th>Bornes</th>
                <th>Ratio (bornes/1000 véhicules)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Les données seront injectées ici -->
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="export-container">
        <button id="export-correlation-data" class="export-btn">Exporter les données</button>
      </div>
    </section>
  `;

    // Initialiser les contrôles et les événements
    initCorrelationControls();

    // Charger les données initiales
    loadCorrelationData();
}

// Initialiser les contrôles de corrélation
function initCorrelationControls() {
    const exportButton = document.getElementById('export-correlation-data');
    const xVariableSelect = document.getElementById('correlation-x');
    const yVariableSelect = document.getElementById('correlation-y');
    const filterTypeSelect = document.getElementById('correlation-filter');

    // Ajouter des écouteurs d'événements pour les changements de sélection
    xVariableSelect.addEventListener('change', () => {
        loadCorrelationData();
    });

    yVariableSelect.addEventListener('change', () => {
        loadCorrelationData();
    });

    filterTypeSelect.addEventListener('change', () => {
        loadCorrelationData();
    });

    // Événement pour exporter les données
    exportButton.addEventListener('click', () => {
        exportCorrelationData();
    });
}


// Charger les données de corrélation
function loadCorrelationData() {
    const xVariable = document.getElementById('correlation-x').value;
    const yVariable = document.getElementById('correlation-y').value;
    const filterType = document.getElementById('correlation-filter').value;

    // Récupérer les données de corrélation depuis l'API
    const endpoint = filterType === 'departements'
        ? '/api/departements/correlation/departements'
        : '/api/departements/correlation/regions';

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Traiter les données pour l'affichage
                processCorrelationData(data.data, xVariable, yVariable, filterType);
            } else {
                console.error('Erreur lors du chargement des données de corrélation');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données de corrélation:', error);
        });
}

// Traiter les données de corrélation
function processCorrelationData(data, xVariable, yVariable, filterType) {
    // Supprimer tout message d'avertissement existant
    const existingWarnings = document.querySelectorAll('.warning-message');
    existingWarnings.forEach(warning => warning.remove());

    // Vérifier si les variables sont identiques
    const isSameVariable = xVariable === yVariable;

    // Ajouter un message d'avertissement si nécessaire
    if (isSameVariable) {
        const warningMessage = `
      <div class="warning-message" style="background-color: #FFA500; color: white; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
        <strong>Attention :</strong> Les variables sélectionnées sont identiques. Le coefficient de corrélation sera toujours de 1, ce qui n'apporte pas d'information pertinente.
      </div>`;

        // Insérer le message d'avertissement avant le graphique
        const chartContainer = document.querySelector('.correlation-chart-container');
        chartContainer.insertAdjacentHTML('beforebegin', warningMessage);
    }

    // Extraire les données pertinentes
    const items = Array.isArray(data) ? data : [];

    // Préparer les données pour le graphique de dispersion
    const scatterData = items.map(item => {
        let x, y;

        // Déterminer la valeur X
        switch(xVariable) {
            case 'vehicules':
                x = filterType === 'departements' ? item.somme_NB_VP_RECHARGEABLES_EL : item.totalVehiculesElectriques;
                break;
            case 'bornes':
                x = filterType === 'departements' ? item.Nombre_Bornes : item.totalBornes;
                break;
            case 'stations':
                x = filterType === 'departements' ? item.Nombre_stations : item.totalStations;
                break;
            case 'thermiques':
                x = filterType === 'departements' ? item.NB_VP : item.totalVehiculesThermiques;
                break;
            case 'population':
                x = filterType === 'departements' ? item.POPULATION : item.totalPopulation;
                break;
            case 'densite':
                x = filterType === 'departements' ? item["DENSITE (habitants/km2)"] : item.densite;
                break;
            case 'superficie':
                x = filterType === 'departements' ? item["SUPERFICIE (km²)"] : item.totalSuperficie;
                break;
            default:
                x = 0;
        }

        // Déterminer la valeur Y
        switch(yVariable) {
            case 'vehicules':
                y = filterType === 'departements' ? item.somme_NB_VP_RECHARGEABLES_EL : item.totalVehiculesElectriques;
                break;
            case 'bornes':
                y = filterType === 'departements' ? item.Nombre_Bornes : item.totalBornes;
                break;
            case 'stations':
                y = filterType === 'departements' ? item.Nombre_stations : item.totalStations;
                break;
            case 'thermiques':
                y = filterType === 'departements' ? item.NB_VP : item.totalVehiculesThermiques;
                break;
            case 'population':
                y = filterType === 'departements' ? item.POPULATION : item.totalPopulation;
                break;
            case 'densite':
                y = filterType === 'departements' ? item["DENSITE (habitants/km2)"] : item.densite;
                break;
            case 'superficie':
                y = filterType === 'departements' ? item["SUPERFICIE (km²)"] : item.totalSuperficie;
                break;
            default:
                y = 0;
        }

        return {
            x,
            y,
            label: filterType === 'departements' ? `${item.DEPARTEMENT} - ${item.NOM}` : item.region
        };
    });

    // Créer le graphique de dispersion
    if (!isSameVariable) {
        createScatterPlot(scatterData, xVariable, yVariable);
    } else {
        // Si les variables sont identiques, afficher un message dans le graphique
        createIdentityPlot(scatterData, xVariable);
    }

    // Calculer le coefficient de corrélation
    const coefficient = calculateCorrelation(
        scatterData.map(d => d.x),
        scatterData.map(d => d.y)
    );

    // Mettre à jour l'affichage du coefficient
    document.getElementById('correlation-coefficient').textContent = coefficient.toFixed(2);

    // Analyser les départements bien/sous équipés
    analyzeEquipmentRatio(items, filterType);

    // Générer l'analyse textuelle
    generateCorrelationAnalysis(coefficient, xVariable, yVariable);
}

// Créer un graphique de dispersion
function createScatterPlot(data, xVariable, yVariable) {
    const ctx = document.getElementById('correlation-chart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.correlationChart) {
        window.correlationChart.destroy();
    }

    // Obtenir les libellés des variables
    const xLabel = getVariableLabel(xVariable);
    const yLabel = getVariableLabel(yVariable);

    // Créer un nouveau graphique
    window.correlationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: `Corrélation entre ${xLabel} et ${yLabel}`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.label}: (${point.x.toLocaleString('fr-FR')}, ${point.y.toLocaleString('fr-FR')})`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Corrélation entre ${xLabel} et ${yLabel}`
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xLabel
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yLabel
                    }
                }
            }
        }
    });
}

// Créer un graphique spécial lorsque les variables sont identiques
function createIdentityPlot(data, variable) {
    const ctx = document.getElementById('correlation-chart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (window.correlationChart) {
        window.correlationChart.destroy();
    }

    const label = getVariableLabel(variable);

    // Créer un nouveau graphique
    window.correlationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: `${label} (variables identiques)`,
                data: data,
                backgroundColor: 'rgba(255, 165, 0, 0.6)',
                borderColor: 'rgba(255, 165, 0, 1)',
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.label}: ${point.x.toLocaleString('fr-FR')}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Distribution de ${label}`
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: label
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: label
                    }
                }
            }
        }
    });
}

// Obtenir le libellé d'une variable
function getVariableLabel(variable) {
    switch(variable) {
        case 'vehicules':
            return 'Nombre de véhicules électriques';
        case 'bornes':
            return 'Nombre de bornes';
        case 'stations':
            return 'Nombre de stations';
        case 'thermiques':
            return 'Nombre de véhicules thermiques';
        case 'population':
            return 'Population';
        case 'densite':
            return 'Densité de population';
        case 'superficie':
            return 'Superficie';
        default:
            return variable;
    }
}

// Calculer le coefficient de corrélation de Pearson
function calculateCorrelation(x, y) {
    const n = x.length;

    // Vérifier qu'il y a suffisamment de données
    if (n < 2) return 0;

    // Calculer les moyennes
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;

    // Calculer les termes de la corrélation
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = y[i] - yMean;

        numerator += xDiff * yDiff;
        denomX += xDiff * xDiff;
        denomY += yDiff * yDiff;
    }

    // Calculer le coefficient de corrélation
    if (denomX === 0 || denomY === 0) return 0;
    return numerator / Math.sqrt(denomX * denomY);
}

// Analyser le ratio d'équipement (bornes/véhicules)
function analyzeEquipmentRatio(items, filterType) {
    // Filtrer les éléments avec des véhicules et des bornes
    const validItems = items.filter(item => {
        const vehicules = filterType === 'departements' ? item.somme_NB_VP_RECHARGEABLES_EL : item.totalVehiculesElectriques;
        const bornes = filterType === 'departements' ? item.Nombre_Bornes : item.totalBornes;
        return vehicules > 0 && bornes > 0;
    });

    // Calculer le ratio pour chaque élément
    validItems.forEach(item => {
        const vehicules = filterType === 'departements' ? item.somme_NB_VP_RECHARGEABLES_EL : item.totalVehiculesElectriques;
        const bornes = filterType === 'departements' ? item.Nombre_Bornes : item.totalBornes;
        item.ratio = (bornes / vehicules) * 1000;
    });

    // Calculer la moyenne des ratios
    const totalRatio = validItems.reduce((sum, item) => sum + item.ratio, 0);
    const averageRatio = totalRatio / validItems.length;

    // Séparer les éléments bien équipés et sous-équipés
    const wellEquipped = validItems.filter(item => item.ratio >= averageRatio);
    const underEquipped = validItems.filter(item => item.ratio < averageRatio);

    // Trier par ratio
    wellEquipped.sort((a, b) => b.ratio - a.ratio);
    underEquipped.sort((a, b) => a.ratio - b.ratio);

    // Mettre à jour les compteurs
    document.getElementById('well-equipped-count').textContent = wellEquipped.length;
    document.getElementById('under-equipped-count').textContent = underEquipped.length;

    // Remplir les tableaux
    populateEquipmentTable('well-equipped-table', wellEquipped.slice(0, 10), filterType);
    populateEquipmentTable('under-equipped-table', underEquipped.slice(0, 10), filterType);
}

// Remplir un tableau d'équipement
function populateEquipmentTable(tableId, items, filterType) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const tableHead = document.querySelector(`#${tableId} thead`);
    tableBody.innerHTML = '';

    // Modifier le titre de la première colonne
    const firstColumnTitle = filterType === 'departements' ? 'Département' : 'Région';
    tableHead.querySelector('tr').firstElementChild.textContent = firstColumnTitle;

    items.forEach(item => {
        const vehicules = filterType === 'departements' ? item.somme_NB_VP_RECHARGEABLES_EL : item.totalVehiculesElectriques;
        const bornes = filterType === 'departements' ? item.Nombre_Bornes : item.totalBornes;
        const nom = filterType === 'departements' ? `${item.DEPARTEMENT} - ${item.NOM}` : item.region;

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${nom}</td>
      <td class="number">${vehicules.toLocaleString('fr-FR')}</td>
      <td class="number">${bornes.toLocaleString('fr-FR')}</td>
      <td class="number">${item.ratio.toFixed(2)}</td>
    `;
        tableBody.appendChild(row);
    });
}

// Générer une analyse textuelle de la corrélation
function generateCorrelationAnalysis(coefficient, xVariable, yVariable) {
    const analysisContainer = document.getElementById('correlation-analysis');
    const xLabel = getVariableLabel(xVariable);
    const yLabel = getVariableLabel(yVariable);

    let analysisText = '';

    // Interpréter le coefficient de corrélation
    if (coefficient > 0.7) {
        analysisText = `<p>Il existe une <strong>forte corrélation positive</strong> (${coefficient.toFixed(2)}) entre ${xLabel} et ${yLabel}. Cela suggère que lorsque ${xLabel} augmente, ${yLabel} tend également à augmenter de manière significative.</p>`;
    } else if (coefficient > 0.3) {
        analysisText = `<p>Il existe une <strong>corrélation positive modérée</strong> (${coefficient.toFixed(2)}) entre ${xLabel} et ${yLabel}. Cela suggère une tendance où ${yLabel} augmente généralement avec ${xLabel}, mais avec des variations notables.</p>`;
    } else if (coefficient > -0.3) {
        analysisText = `<p>Il existe une <strong>corrélation faible ou négligeable</strong> (${coefficient.toFixed(2)}) entre ${xLabel} et ${yLabel}. Cela suggère que ces deux variables ne sont pas fortement liées.</p>`;
    } else if (coefficient > -0.7) {
        analysisText = `<p>Il existe une <strong>corrélation négative modérée</strong> (${coefficient.toFixed(2)}) entre ${xLabel} et ${yLabel}. Cela suggère une tendance où ${yLabel} diminue généralement quand ${xLabel} augmente.</p>`;
    } else {
        analysisText = `<p>Il existe une <strong>forte corrélation négative</strong> (${coefficient.toFixed(2)}) entre ${xLabel} et ${yLabel}. Cela suggère que lorsque ${xLabel} augmente, ${yLabel} tend à diminuer de manière significative.</p>`;
    }

    // Ajouter des observations spécifiques
    if ((xVariable === 'vehicules' && yVariable === 'bornes') || (xVariable === 'bornes' && yVariable === 'vehicules')) {
        analysisText += `<p>Cette relation entre le nombre de véhicules électriques et le nombre de bornes de recharge est particulièrement importante pour évaluer l'adéquation des infrastructures de recharge par rapport à la demande.</p>`;
    }

    if (xVariable === 'population' || yVariable === 'population') {
        analysisText += `<p>La population d'un territoire est un facteur démographique clé qui peut influencer le déploiement des infrastructures et l'adoption des véhicules électriques.</p>`;
    }

    if (xVariable === 'densite' || yVariable === 'densite') {
        analysisText += `<p>La densité de population peut affecter la stratégie de déploiement des bornes de recharge, avec potentiellement plus de bornes dans les zones urbaines denses.</p>`;
    }

    // Ajouter des recommandations
    analysisText += `<h3>Recommandations</h3>`;

    if (coefficient > 0.3 && ((xVariable === 'vehicules' && yVariable === 'bornes') || (xVariable === 'bornes' && yVariable === 'vehicules'))) {
        analysisText += `<p>La corrélation positive suggère que le déploiement des bornes suit généralement l'adoption des véhicules électriques. Il serait judicieux de continuer à surveiller cette relation pour s'assurer que l'infrastructure de recharge reste adéquate.</p>`;
    } else if (coefficient < 0.3 && ((xVariable === 'vehicules' && yVariable === 'bornes') || (xVariable === 'bornes' && yVariable === 'vehicules'))) {
        analysisText += `<p>La faible corrélation entre les véhicules électriques et les bornes de recharge pourrait indiquer un déséquilibre dans certains territoires. Une analyse plus approfondie des zones sous-équipées serait recommandée.</p>`;
    }

    // Mettre à jour le conteneur d'analyse
    analysisContainer.innerHTML = analysisText;
}

// Exporter les données de corrélation
function exportCorrelationData() {
    const filterType = document.getElementById('correlation-filter').value;
    const endpoint = filterType === 'departements'
        ? '/api/departements/correlation/departements'
        : '/api/departements/correlation/regions';

    // Récupérer les données de corrélation
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Préparer les données pour l'export
                const items = data.data;

                // Créer les en-têtes CSV
                let csvContent = filterType === 'departements'
                    ? 'Departement,Code,Region,Vehicules electriques,Bornes,Stations,Vehicules thermiques,Population,Densite,Superficie\n'
                    : 'Region,Vehicules electriques,Bornes,Stations,Vehicules thermiques,Population,Densite,Superficie\n';

                // Ajouter chaque ligne de données
                items.forEach(item => {
                    if (filterType === 'departements') {
                        csvContent += `"${item.NOM}","${item.DEPARTEMENT}","${item.REGION}",${item.somme_NB_VP_RECHARGEABLES_EL},${item.Nombre_Bornes},${item.Nombre_stations},${item.NB_VP},${item.POPULATION},${item["DENSITE (habitants/km2)"]},${item["SUPERFICIE (km²)"]}\n`;
                    } else {
                        csvContent += `"${item.region}",${item.totalVehiculesElectriques},${item.totalBornes},${item.totalStations},${item.totalVehiculesThermiques},${item.totalPopulation},${item.densite},${item.totalSuperficie}\n`;
                    }
                });

                // Créer un objet Blob avec le contenu CSV
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

                // Créer un lien de téléchargement
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);

                link.setAttribute('href', url);
                link.setAttribute('download', `correlation-donnees-${filterType}.csv`);
                link.style.visibility = 'hidden';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'export des données:', error);
        });
}
