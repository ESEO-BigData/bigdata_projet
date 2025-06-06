export function renderHomePage(container) {
    const titles = ["innovante", "interactive", "détaillée", "essentielle", "moderne"];
    let titleNumber = 0;

    // AJOUT: Structure pour le fond et le spotlight
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
      <div id="spotlight-effect"></div>
    </div>
    `;

    container.innerHTML = `
    ${backgroundEffectHTML}
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <button class="hero-launch-btn" id="nav-about-link">
            Découvrez le projet
          </button>
          
          <div class="hero-title-container">
            <h1 class="hero-main-title">
              <span class="hero-title-static">Votre plateforme</span>
              <span class="hero-title-animated-wrapper">
              </span>
              <span class="hero-title-static">sur les véhicules électriques.</span>
            </h1>
          </div>

          <p class="hero-description">
            Plongez au cœur des données sur l'électromobilité en France. Visualisez la répartition des bornes, analysez les tendances et comparez les territoires. Notre objectif est de rendre ces informations accessibles et compréhensibles pour tous.
          </p>
          
          <div class="hero-actions">
            <button class="btn btn-primary hero-btn" id="explore-map-home">
              Explorer la carte
            </button>
            <button class="btn btn-secondary hero-btn" id="view-stats-home">
              Voir les statistiques
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

    const animatedWrapper = container.querySelector('.hero-title-animated-wrapper');
    titles.forEach((title) => {
        const span = document.createElement('span');
        span.className = 'hero-animated-word';
        span.textContent = title;
        span.style.opacity = '0';
        span.style.position = 'absolute';
        animatedWrapper.appendChild(span);
    });

    const animatedSpans = animatedWrapper.querySelectorAll('.hero-animated-word');
    function animateTitles() {
        animatedSpans.forEach((span, index) => {
            if (index === titleNumber) {
                span.style.transform = 'translateY(0)';
                span.style.opacity = '1';
            } else if (index < titleNumber) {
                span.style.transform = 'translateY(-100%)';
                span.style.opacity = '0';
            } else {
                span.style.transform = 'translateY(100%)';
                span.style.opacity = '0';
            }
        });
        titleNumber = (titleNumber + 1) % titles.length;
        setTimeout(animateTitles, 2000);
    }
    if (animatedSpans.length > 0) {
        setTimeout(animateTitles, 100);
    }

    document.getElementById('explore-map-home').addEventListener('click', () => {
        document.getElementById('nav-map').click();
    });
    document.getElementById('view-stats-home').addEventListener('click', () => {
        document.getElementById('nav-stats').click();
    });
    document.getElementById('nav-about-link').addEventListener('click', () => {
        document.getElementById('nav-about').click();
    });

    // --- AJOUT: Logique du Spotlight ---
    const spotlight = document.getElementById('spotlight-effect');
    const spotlightSize = 300; // Taille du spotlight en pixels, similaire au `size = 200` (mais ici blur le rend plus grand)

    // Utiliser document.body pour tracker la souris sur toute la page
    const bodyElement = document.body;

    function handleMouseMove(event) {
        if (!spotlight) return;
        // Les coordonnées clientX/clientY sont relatives au viewport
        const x = event.clientX;
        const y = event.clientY;

        spotlight.style.left = `${x - spotlightSize / 2}px`;
        spotlight.style.top = `${y - spotlightSize / 2}px`;
    }

    function handleMouseEnter() {
        if (spotlight) spotlight.style.opacity = '1';
    }

    function handleMouseLeave() {
        if (spotlight) spotlight.style.opacity = '0';
    }

    // Attacher les écouteurs à bodyElement
    bodyElement.addEventListener('mousemove', handleMouseMove);
    bodyElement.addEventListener('mouseenter', handleMouseEnter);
    bodyElement.addEventListener('mouseleave', handleMouseLeave);

    // Optionnel: Nettoyage des écouteurs si la page Home était "démontable"
    // Dans ce cas, comme renderHomePage remplace innerHTML, les anciens éléments du DOM sont retirés
    // MAIS les écouteurs sur `bodyElement` PERSISTENT.
    // Si on navigue vers une autre "page" SPA qui appelle une autre fonction renderXYZ,
    // ces écouteurs resteront actifs. Pour une SPA simple où on change le contenu de #content,
    // il faudrait une logique de nettoyage globale au changement de route.
    // Pour l'instant, on les laisse, car ils n'affecteront que la page d'accueil
    // où le spotlight est visible.
    //
    // Pour un nettoyage propre si nécessaire (par exemple, dans `handleNavigation` de `index.js`):
    //
    // let currentCleanupFunction = null;
    //
    // function cleanupSpotlightListeners() {
    //     bodyElement.removeEventListener('mousemove', handleMouseMove);
    //     bodyElement.removeEventListener('mouseenter', handleMouseEnter);
    //     bodyElement.removeEventListener('mouseleave', handleMouseLeave);
    //     if (spotlight) spotlight.style.opacity = '0'; // Cacher en sortant
    // }
    //
    // Dans handleNavigation (index.js), avant d'appeler un nouveau render:
    // if (typeof currentCleanupFunction === 'function') {
    //    currentCleanupFunction();
    //    currentCleanupFunction = null;
    // }
    //
    // Si renderHomePage est appelée:
    // currentCleanupFunction = cleanupSpotlightListeners;
    //
    // C'est une gestion d'état plus avancée, pour l'instant on simplifie.
}