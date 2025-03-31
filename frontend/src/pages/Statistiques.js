import { renderDashboard } from './Statistiques/Dashboard';
import { renderCommunesData } from './Statistiques/Communes';
import { renderComparaisonData } from './Statistiques/Comparaison';
import { renderCorrelationData } from './Statistiques/Correlation';

export function renderStatistics(container) {
    container.innerHTML = `
    <h1>Statistiques</h1>
    <div class="stats-navigation">
      <ul>
        <li><a href="#" id="nav-dashboard" class="active">Tableau de bord</a></li>
        <li><a href="#" id="nav-communes">Communes et départements</a></li>
        <li><a href="#" id="nav-comparaison">Comparaison</a></li>
        <li><a href="#" id="nav-correlation">Corrélation</a></li>
      </ul>
    </div>
    <div id="stats-content"></div>
  `;

    const contentDiv = document.getElementById('stats-content');
    const navDashboard = document.getElementById('nav-dashboard');
    const navCommunes = document.getElementById('nav-communes');
    const navComparaison = document.getElementById('nav-comparaison');
    const navCorrelation = document.getElementById('nav-correlation');

    // Fonction pour mettre à jour l'onglet actif
    function updateActiveTab(activeTab) {
        [navDashboard, navCommunes, navComparaison, navCorrelation].forEach(tab => {
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

    navCommunes.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navCommunes);
        renderCommunesData(contentDiv);
    });

    navComparaison.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navComparaison);
        renderComparaisonData(contentDiv);
    });

    navCorrelation.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveTab(navCorrelation);
        renderCorrelationData(contentDiv);
    });

    // Afficher le tableau de bord par défaut
    renderDashboard(contentDiv);
}
