import './assets/styles/main.css';
import 'leaflet/dist/leaflet.css';
import { renderHomePage } from './pages/Home';
import { renderBornesMap } from './pages/BornesMap';
import { renderStatistics } from './pages/Statistiques';
import { renderAboutPage } from './pages/About';

function handleNavigation() {
    const navLinks = [
        document.getElementById('nav-home'),
        document.getElementById('nav-map'),
        document.getElementById('nav-stats'),
        document.getElementById('nav-about')
    ];
    const contentDiv = document.getElementById('content');
    const navLamp = document.getElementById('nav-lamp-effect');
    const navList = document.querySelector('#main-nav ul'); // Pour le positionnement relatif de la lampe

    function updateActiveNav(activeLink) {
        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
        });
        activeLink.setAttribute('aria-current', 'page');

        // Positionner la lampe
        if (navLamp && navList && activeLink) {
            const activeListItem = activeLink.parentElement; // On cible le <li> pour la position

            // S'assurer que la navList a un positionnement pour que offsetLeft soit correct
            // Normalement, `position: relative` sur #main-nav ul suffit.

            const lampLeft = activeListItem.offsetLeft;
            const lampWidth = activeListItem.offsetWidth;

            navLamp.style.left = `${lampLeft}px`;
            navLamp.style.width = `${lampWidth}px`;
            navLamp.style.opacity = '1'; // Rendre visible
        }
    }

    // Gestionnaires d'événements et rendu initial
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            updateActiveNav(link); // Mettre à jour l'état actif et la lampe

            // Charger le contenu de la page
            if (link.id === 'nav-home') renderHomePage(contentDiv);
            else if (link.id === 'nav-map') renderBornesMap(contentDiv);
            else if (link.id === 'nav-stats') renderStatistics(contentDiv);
            else if (link.id === 'nav-about') renderAboutPage(contentDiv);
        });
    });

    // Afficher la page d'accueil par défaut et positionner la lampe
    renderHomePage(contentDiv);
    // Trouver le lien actif initial (celui avec aria-current) et le passer
    const initialActiveLink = navLinks.find(link => link.hasAttribute('aria-current'));
    if (initialActiveLink) {
        // Petit délai pour s'assurer que le DOM est prêt pour les calculs offset
        setTimeout(() => updateActiveNav(initialActiveLink), 50);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();
});