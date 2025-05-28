import Chart from 'chart.js/auto';
import { animateTextStreamByWord } from '../../utils/animateTextStream';
import correlationTexts from '../../utils/correlationTexts.json';

// Variables globales au module pour stocker les données actuelles
let currentScatterData = [];
let currentXVariable = '';
let currentYVariable = '';
let currentFilterType = '';
let currentCoefficient = 0;
let currentXLabel = '';
let currentYLabel = '';

export function renderCorrelationData(container) {
    container.innerHTML = `
    <section class="correlation-section">
      <h1>Analyse des corrélations</h1>
      
        <div class="kpi-row">
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
      
      <div class="ai-analysis-section" style="margin-top: 25px;">
    <h2>Analyse par l'IA (Gemini)</h2>
    <button id="analyze-ai-btn" class="btn ai-btn" style="margin-bottom: 15px;">
       🧠 Analyser avec l'IA
    </button>
    <div id="ai-analysis-container" class="ai-analysis-results">
       <!-- L'analyse de l'IA sera affichée ici -->
    </div>
</div>
      
      <div class="data-tables-container">
        <div> <!-- Conteneur pour le titre et le tableau des bien équipés -->
            <h2>Top 10 des départements bien équipés</h2>
        <div class="data-table-container">
      <table id="well-equipped-table" class="data-table">
        <thead>
          <tr>
            <th>Département</th>
            <th class="numeric">Véhicules électriques</th>
            <th class="numeric">Bornes</th>
            <th class="numeric">Ratio (bornes/1000 véhicules)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Les données seront injectées ici -->
        </tbody>
      </table>
        </div>
        <div>
        
     <div> <!-- Conteneur pour le titre et le tableau des sous-équipés -->
       <h2>Top 10 des départements sous-équipés</h2>
       <div class="data-table-container">
         <table id="under-equipped-table" class="data-table">
           <thead>
             <tr>
               <th>Département</th>
               <th class="numeric">Véhicules électriques</th>
              <th class="numeric">Bornes</th>
              <th class="numeric">Ratio (bornes/1000 véhicules)</th>
             </tr>
           </thead>
           <tbody></tbody>
         </table>
       </div>
     </div>
   </div>
      
      <div class="export-container">
        <button id="export-correlation-data" class="btn btn-primary hero-btn">Exporter les données</button>
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

    const aiButton = document.getElementById('analyze-ai-btn');
    aiButton.addEventListener('click', handleAIAnalysis); // Ajout de l'appel à la nouvelle fonction
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
                x = filterType === 'departements' ? item.DENSITE : item.densite;
                break;
            case 'superficie':
                x = filterType === 'departements' ? item.SUPERFICIE : item.totalSuperficie;
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
                y = filterType === 'departements' ? item.DENSITE : item.densite;
                break;
            case 'superficie':
                y = filterType === 'departements' ? item.SUPERFICIE : item.totalSuperficie;
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

    // Stocker les données actuelles pour l'analyse IA
    currentScatterData = scatterData; // Contient { x, y, label }
    currentXVariable = xVariable;
    currentYVariable = yVariable;
    currentFilterType = filterType;
    currentXLabel = getVariableLabel(xVariable); // Assurez-vous d'appeler cette fonction
    currentYLabel = getVariableLabel(yVariable); // Assurez-vous d'appeler cette fonction

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
    currentCoefficient = coefficient; // Stocker le coefficient

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
      <!-- MODIFICATION: class="number" -> class="numeric" -->
      <td class="numeric">${vehicules.toLocaleString('fr-FR')}</td>
      <td class="numeric">${bornes.toLocaleString('fr-FR')}</td>
      <td class="numeric">${item.ratio.toFixed(2)}</td>
    `;
        tableBody.appendChild(row);
    });
}

// Fonction utilitaire pour remplacer les placeholders dans les textes
function replacePlaceholders(text, variables) {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    return result;
}

// Déterminer les observations spécifiques à ajouter
function getSpecificObservations(xVariable, yVariable) {
    const observations = [];
    
    // Vérifier la relation véhicules/bornes
    if ((xVariable === 'vehicules' && yVariable === 'bornes') || 
        (xVariable === 'bornes' && yVariable === 'vehicules')) {
        observations.push(correlationTexts.observations_specifiques.vehicules_bornes);
    }
    
    // Vérifier si la population est impliquée
    if (xVariable === 'population' || yVariable === 'population') {
        observations.push(correlationTexts.observations_specifiques.population);
    }
    
    // Vérifier si la densité est impliquée
    if (xVariable === 'densite' || yVariable === 'densite') {
        observations.push(correlationTexts.observations_specifiques.densite);
    }
    
    // Vérifier si la superficie est impliquée
    if (xVariable === 'superficie' || yVariable === 'superficie') {
        observations.push(correlationTexts.observations_specifiques.superficie);
    }
    
    // Vérifier si les véhicules thermiques sont impliqués
    if (xVariable === 'thermiques' || yVariable === 'thermiques') {
        observations.push(correlationTexts.observations_specifiques.vehicules_thermiques);
    }
    
    // Vérifier si les stations sont impliquées
    if (xVariable === 'stations' || yVariable === 'stations') {
        observations.push(correlationTexts.observations_specifiques.stations);
    }
    
    return observations;
}

// Déterminer les recommandations à ajouter
function getRecommendations(coefficient, xVariable, yVariable) {
    const recommendations = [];
    
    // Recommandations spécifiques pour véhicules/bornes
    if ((xVariable === 'vehicules' && yVariable === 'bornes') || 
        (xVariable === 'bornes' && yVariable === 'vehicules')) {
        if (coefficient > 0.3) {
            recommendations.push(correlationTexts.recommandations.vehicules_bornes_positive);
        } else {
            recommendations.push(correlationTexts.recommandations.vehicules_bornes_faible);
        }
    }
    
    // Recommandations pour la population
    if ((xVariable === 'population' || yVariable === 'population') && Math.abs(coefficient) > 0.7) {
        recommendations.push(correlationTexts.recommandations.population_forte);
    }
    
    // Recommandations pour la densité
    if ((xVariable === 'densite' || yVariable === 'densite') && coefficient > 0.3) {
        recommendations.push(correlationTexts.recommandations.densite_positive);
    }
    
    // Recommandations générales
    if (Math.abs(coefficient) > 0.7) {
        recommendations.push(correlationTexts.recommandations.generale_forte);
    } else if (Math.abs(coefficient) < 0.3) {
        recommendations.push(correlationTexts.recommandations.generale_faible);
    }
    
    return recommendations;
}

// Générer une analyse textuelle de la corrélation
function generateCorrelationAnalysis(coefficient, xVariable, yVariable) {
    const analysisContainer = document.getElementById('correlation-analysis');
    const xLabel = getVariableLabel(xVariable);
    const yLabel = getVariableLabel(yVariable);

    let analysisText = '';

    // Variables pour le templating
    const templateVars = {
        coefficient: coefficient.toFixed(2),
        xLabel: xLabel,
        yLabel: yLabel
    };

    // Déterminer le type de corrélation et obtenir le texte correspondant
    let interpretationKey;
    if (coefficient > 0.7) {
        interpretationKey = 'forte_positive';
    } else if (coefficient > 0.3) {
        interpretationKey = 'moderee_positive';
    } else if (coefficient > -0.3) {
        interpretationKey = 'faible';
    } else if (coefficient > -0.7) {
        interpretationKey = 'moderee_negative';
    } else {
        interpretationKey = 'forte_negative';
    }

    // Générer le texte d'interprétation
    const interpretationText = replacePlaceholders(
        correlationTexts.interpretations[interpretationKey], 
        templateVars
    );
    analysisText += `<p>${interpretationText}</p>`;

    // Ajouter les observations spécifiques
    const observations = getSpecificObservations(xVariable, yVariable);
    observations.forEach(observation => {
        analysisText += `<p>${observation}</p>`;
    });

    // Ajouter les recommandations
    const recommendations = getRecommendations(coefficient, xVariable, yVariable);
    if (recommendations.length > 0) {
        analysisText += `<h3>${correlationTexts.titre_recommandations}</h3>`;
        recommendations.forEach(recommendation => {
            analysisText += `<p>${recommendation}</p>`;
        });
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
                        csvContent += `"${item.NOM}","${item.DEPARTEMENT}","${item.REGION}",${item.somme_NB_VP_RECHARGEABLES_EL},${item.Nombre_Bornes},${item.Nombre_stations},${item.NB_VP},${item.POPULATION},${item.DENSITE},${item.SUPERFICIE}\n`;
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

async function handleAIAnalysis() {
    const aiContainer = document.getElementById('ai-analysis-container');
    const aiButton = document.getElementById('analyze-ai-btn');

    // Vérifier si des données sont disponibles
    if (!currentScatterData || currentScatterData.length === 0) {
        aiContainer.innerHTML = '<p style="color: red;">Veuillez d\'abord générer un graphique de corrélation.</p>';
        return;
    }
    // Vérifier si les variables sont identiques (l'analyse IA n'est pas très utile ici)
    if (currentXVariable === currentYVariable) {
        aiContainer.innerHTML = `<p style="color: orange;">L'analyse IA n'est pas pertinente lorsque les deux variables sont identiques (corrélation parfaite de 1).</p>`;
        return;
    }


    // Afficher un état de chargement et désactiver le bouton
    aiButton.disabled = true;
    aiButton.innerHTML = `<span class="shining-text-container"><span class="shining-text">Analyse en cours...</span></span>`;
    aiButton.classList.add('analyzing-ai'); // Optionnel, pour styler le bouton lui-même si besoin

    // Préparer les données à envoyer (on peut envoyer un échantillon si la liste est trop grande)
    // Pour l'instant, envoyons tout, mais gardons à l'esprit la limite de taille potentielle.
    const payload = {
        xVariable: currentXVariable,
        yVariable: currentYVariable,
        xLabel: currentXLabel,
        yLabel: currentYLabel,
        filterType: currentFilterType,
        coefficient: currentCoefficient,
        // Envoyons les données brutes, le backend peut décider de résumer si besoin
        scatterData: currentScatterData
    };

    try {
        // Appel à la nouvelle route backend (à créer)
        const response = await fetch('/api/ai/analyze-correlation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // Essayer de récupérer un message d'erreur du backend
            const errorData = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` }));
            throw new Error(errorData.message || `Erreur lors de l'appel à l'IA.`);
        }

        const result = await response.json();

        if (result.success && result.data.analysis) {
            animateTextStreamByWord(aiContainer, result.data.analysis, {
                fadeDuration: 150, // Durée du fondu pour chaque mot (ms)
                segmentDelay: 20   // Délai entre l'apparition de chaque mot (ms)
            });
        } else {
            throw new Error(result.message || 'Réponse invalide de l\'API d\'analyse.');
        }

    } catch (error) {
        console.error("Erreur lors de l'analyse IA:", error);
        aiContainer.innerHTML = `<p style="color: red;">❌ Erreur : ${error.message}</p>`;
    } finally {
        aiButton.disabled = false;
        aiButton.innerHTML = "🧠 Analyser avec l'IA";
        aiButton.classList.remove('analyzing-ai');
    }
}