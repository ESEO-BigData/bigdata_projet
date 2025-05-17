import nodejsLogo from '../assets/images/nodejs.svg';
import expressLogo from '../assets/images/express.svg';
import mongodbLogo from '../assets/images/MongoDB.svg';
import javascriptLogo from '../assets/images/javascript.svg';
import leafletLogo from '../assets/images/leaflet.svg';
import chartjsLogo from '../assets/images/chartjs.svg';
import webpackLogo from '../assets/images/webpack.svg';
export function renderAboutPage(container) {
    const backgroundEffectHTML = `
    <div id="hero-background-effect">
      <svg id="grid-pattern-svg">
        <defs>
          <pattern id="grid-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6H6M6 6V0M6 6H12M6 6V12" stroke="var(--grid-pattern-color, rgba(128,128,128,0.2))" stroke-opacity="0.3" />
            <rect x="5" y="5" width="2" height="2" fill="var(--grid-pattern-color, rgba(128,128,128,0.1))" fill-opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
      {/* Pas de <div id="spotlight-effect"></div> ici */}
    </div>
    `;

    container.innerHTML = `
    ${backgroundEffectHTML}
    <section class="about-section page-content">
      <h1>À propos du projet</h1>
      
      <div class="about-card">
        <p>Ce projet a été développé dans le cadre d'un cours sur le Big Data. Il vise à analyser et visualiser les données sur les véhicules électriques en France.</p>
      </div>
      
      <div class="about-card">
        <h2>Sources de données</h2>
        <ul>
          <li>Bornes de recharge électrique (API publiques et contributions)</li>
          <li>Nombre de véhicules électriques par région (Données INSEE, Ministère de la Transition Écologique)</li>
          <li>Nombre de véhicules électriques par commune (Données locales, OpenDataFrance)</li>
          <li>Informations géographiques et administratives (GeoJSON France, IGN)</li>
        </ul>
      </div>
      
      <div class="about-card tech-stack-section">
        <h2>Technologies utilisées</h2>
        
        <div class="tech-category">
          <h3>Backend</h3>
          <div class="logos-carousel-container">
            <div class="logos-grid logos-scrolling" id="backend-logos">
              <div class="logo-item"><img src="${nodejsLogo}" alt="Node.js" title="Node.js"><span class="logo-name">Node.js</span></div>
              <div class="logo-item"><img src="${expressLogo}" alt="Express.js" title="Express.js"><span class="logo-name">Express.js</span></div>
              <div class="logo-item"><img src="${mongodbLogo}" alt="MongoDB" title="MongoDB"><span class="logo-name">MongoDB</span></div>
              <div class="logo-item"><img src="${nodejsLogo}" alt="Node.js" title="Node.js"><span class="logo-name">Node.js</span></div>
              <div class="logo-item"><img src="${expressLogo}" alt="Express.js" title="Express.js"><span class="logo-name">Express.js</span></div>
              <div class="logo-item"><img src="${mongodbLogo}" alt="MongoDB" title="MongoDB"><span class="logo-name">MongoDB</span></div>
              <div class="logo-item"><img src="${nodejsLogo}" alt="Node.js" title="Node.js"><span class="logo-name">Node.js</span></div>
              <div class="logo-item"><img src="${expressLogo}" alt="Express.js" title="Express.js"><span class="logo-name">Express.js</span></div>
              <div class="logo-item"><img src="${mongodbLogo}" alt="MongoDB" title="MongoDB"><span class="logo-name">MongoDB</span></div>
              <div class="logo-item"><img src="${nodejsLogo}" alt="Node.js" title="Node.js"><span class="logo-name">Node.js</span></div>
              <div class="logo-item"><img src="${expressLogo}" alt="Express.js" title="Express.js"><span class="logo-name">Express.js</span></div>
              <div class="logo-item"><img src="${mongodbLogo}" alt="MongoDB" title="MongoDB"><span class="logo-name">MongoDB</span></div>
            </div>
          </div>
        </div>

        <div class="tech-category">
          <h3>Frontend</h3>
          <div class="logos-carousel-container">
            <div class="logos-grid logos-scrolling" id="frontend-logos">
              <div class="logo-item"><img src="${javascriptLogo}" alt="JavaScript" title="JavaScript"><span class="logo-name">JavaScript</span></div>
              <div class="logo-item"><img src="${leafletLogo}" alt="Leaflet" title="Leaflet"><span class="logo-name">Leaflet</span></div>
              <div class="logo-item"><img src="${chartjsLogo}" alt="Chart.js" title="Chart.js"><span class="logo-name">Chart.js</span></div>
              <div class="logo-item"><img src="${webpackLogo}" alt="Webpack" title="Webpack"><span class="logo-name">Webpack</span></div>
              <div class="logo-item"><img src="${javascriptLogo}" alt="JavaScript" title="JavaScript"><span class="logo-name">JavaScript</span></div>
              <div class="logo-item"><img src="${leafletLogo}" alt="Leaflet" title="Leaflet"><span class="logo-name">Leaflet</span></div>
              <div class="logo-item"><img src="${chartjsLogo}" alt="Chart.js" title="Chart.js"><span class="logo-name">Chart.js</span></div>
              <div class="logo-item"><img src="${webpackLogo}" alt="Webpack" title="Webpack"><span class="logo-name">Webpack</span></div>
              <div class="logo-item"><img src="${javascriptLogo}" alt="JavaScript" title="JavaScript"><span class="logo-name">JavaScript</span></div>
              <div class="logo-item"><img src="${leafletLogo}" alt="Leaflet" title="Leaflet"><span class="logo-name">Leaflet</span></div>
              <div class="logo-item"><img src="${chartjsLogo}" alt="Chart.js" title="Chart.js"><span class="logo-name">Chart.js</span></div>
              <div class="logo-item"><img src="${webpackLogo}" alt="Webpack" title="Webpack"><span class="logo-name">Webpack</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="about-card team-section">
        <h2>Équipe</h2>
        <p>Projet réalisé par l'équipe BigData de l'ESEO.</p>
      </div>
    </section>
  `;

    // Assurer que le spotlight de la page Home est désactivé si on navigue ici
    const spotlight = document.getElementById('spotlight-effect');
    if (spotlight) {
        spotlight.style.opacity = '0';
    }
}