// src/index.js
import './assets/styles/main.css';
import { renderHomePage } from './pages/Home';
import { renderBornesMap } from './pages/BornesMap';
import { renderStatistics } from './pages/Statistiques';
import { renderAboutPage } from './pages/About';

// Fonction pour gérer la navigation
function handleNavigation() {
    const navHome = document.getElementById('nav-home');
    const navMap = document.getElementById('nav-map');
    const navStats = document.getElementById('nav-stats');
    const navAbout = document.getElementById('nav-about');
    const contentDiv = document.getElementById('content');

    // Fonction pour mettre à jour l'état actif du menu
    function updateActiveNav(activeNav) {
        [navHome, navMap, navStats, navAbout].forEach(nav => {
            nav.removeAttribute('aria-current');
        });
        activeNav.setAttribute('aria-current', 'page');
    }

    // Afficher la page d'accueil par défaut
    renderHomePage(contentDiv);

    // Gestionnaires d'événements pour la navigation
    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveNav(navHome);
        renderHomePage(contentDiv);
    });

    navMap.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveNav(navMap);
        renderBornesMap(contentDiv);
    });

    navStats.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveNav(navStats);
        renderStatistics(contentDiv);
    });

    navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveNav(navAbout);
        renderAboutPage(contentDiv);
    });
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();
});
