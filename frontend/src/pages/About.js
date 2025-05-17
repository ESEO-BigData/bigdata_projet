import nodejsLogo from '../assets/images/nodejs.svg';
import expressLogo from '../assets/images/express.svg';
import mongodbLogo from '../assets/images/MongoDB.svg';
import javascriptLogo from '../assets/images/javascript.svg';
import leafletLogo from '../assets/images/leaflet.svg';
import chartjsLogo from '../assets/images/chartjs.svg';
import webpackLogo from '../assets/images/webpack.svg';
async function loadSplineViewerScript() {
    if (window.customElements.get('spline-viewer')) {
        return Promise.resolve(); // Déjà chargé
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.0.93/build/spline-viewer.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function renderAboutPage(container) {
    try {
        await loadSplineViewerScript();
    } catch (error) {
        console.error("Failed to load Spline Viewer script:", error);
        // Afficher un message d'erreur à l'utilisateur peut-être
    }
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

    const teamMembers = [
        { name: "Maxime Guerin", role: "Développeur Full-Stack & Chef de projet" },
        { name: "Tom Royer", role: "Spécialiste Data & Visualisation Carte" },
        { name: "Corentin Jozwiak", role: "Expert Backend & IA" },
        { name: "Ruben Vardanyan", role: "Expert Data" }
    ];

    let teamListHTML = teamMembers.map(member =>
        `<li class="team-member-item"><strong>${member.name}</strong> - ${member.role}</li>`
    ).join('');

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
      
<div class="team-presentation-card">
        <div class="team-spotlight"></div>
        <div class="team-content-wrapper">
          <div class="team-text-content">
            <h2 class="team-title">Notre Équipe</h2>
            <p class="team-description">
              Ce projet a été rendu possible grâce à la collaboration et à l'expertise de chaque membre de notre équipe. 
              Nous avons combiné nos compétences pour analyser, visualiser et présenter les données sur l'électromobilité en France.
            </p>
            <ul class="team-members-list">
              ${teamListHTML}
            </ul>
          </div>
          <div class="team-spline-scene">
            <spline-viewer 
              url="https://prod.spline.design/lX7nDShXYFmL9hae/scene.splinecode"
              class="spline-viewer-instance"
              events-target="global"
              logo="false">
            </spline-viewer>
            <div class="spline-loader">
                <span class="loader-graphic"></span> Chargement de la scène 3D...
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

    const splineViewerElement = container.querySelector('spline-viewer');
    const splineLoader = container.querySelector('.spline-loader');

    if (splineViewerElement && splineLoader) {
        let sceneReady = false;

        const hideLoaderIfNeeded = () => {
            if (!sceneReady && splineLoader.style.display !== 'none') {
                splineLoader.style.display = 'none';
                console.log('Spline loader hidden.');
                sceneReady = true;
            }
        };

        // Événement 'load' comme principal indicateur
        splineViewerElement.addEventListener('load', () => {
            console.log('Spline scene "load" event triggered.');
            hideLoaderIfNeeded();
        });

        // Événement 'ready' au cas où (certaines versions du viewer)
        splineViewerElement.addEventListener('ready', () => {
            console.log('Spline scene "ready" event triggered.');
            hideLoaderIfNeeded();
        });

        splineViewerElement.addEventListener('error', (e) => {
            console.error("Erreur de chargement de Spline Viewer:", e.detail);
            splineLoader.innerHTML = `<span style="color:red;">❌ Erreur au chargement de la scène 3D.</span>`;
            // Ne pas cacher le loader s'il y a une erreur, pour que l'utilisateur voie le message.
            sceneReady = true; // Marquer comme "prêt" pour éviter le timeout de masquage
        });

        // Tentative de masquage optimiste après un court délai.
        // Si la scène est vraiment rapide, elle sera déjà là.
        // Cela aide si les événements 'load'/'ready' sont manqués pour une raison quelconque.
        setTimeout(() => {
            const internalCanvas = splineViewerElement.shadowRoot
                ? splineViewerElement.shadowRoot.querySelector('canvas')
                : splineViewerElement.querySelector('canvas');
            if (internalCanvas) {
                console.log('Spline internal canvas detected (optimistic check).');
                hideLoaderIfNeeded();
            } else {

                console.log('Fallback (1.5s): Hiding loader.');
                hideLoaderIfNeeded();
            }
        }, 1000);
        const removeSplineLogoInterval = setInterval(() => {
            if (splineViewerElement && splineViewerElement.shadowRoot) {
                const logoElement = splineViewerElement.shadowRoot.querySelector('#logo');
                if (logoElement) {
                    logoElement.remove(); // Ou logoElement.style.display = 'none';
                    console.log("Spline logo removed!");
                    clearInterval(removeSplineLogoInterval); // Arrêter l'intervalle une fois le logo supprimé
                }
            } else if (sceneReady || !splineLoader || splineLoader.style.display === 'none') {}

        }, 300); // Vérifier toutes les 300ms
}
    const spotlightHome = document.getElementById('spotlight-effect');
    if (spotlightHome) {
        spotlightHome.style.opacity = '0';
    }
}