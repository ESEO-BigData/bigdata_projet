export function renderHomePage(container) {
    const titles = ["innovante", "interactive", "détaillée", "essentielle", "moderne"];
    let titleNumber = 0;

    container.innerHTML = `
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <!-- Bouton "Launch Article" adapté -->
          <button class="hero-launch-btn" id="nav-about-link">
            Découvrez le projet
          </button>
          
          <div class="hero-title-container">
            <h1 class="hero-main-title">
              <span class="hero-title-static">Votre plateforme</span>
              <span class="hero-title-animated-wrapper">
                <!-- Les spans animés seront injectés ici par JS -->
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

    // Pré-créer les spans pour les titres animés
    titles.forEach((title, index) => {
        const span = document.createElement('span');
        span.className = 'hero-animated-word';
        span.textContent = title;
        span.style.opacity = '0'; // Caché initialement
        span.style.position = 'absolute'; // Pour la superposition
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
            } else { // index > titleNumber
                span.style.transform = 'translateY(100%)';
                span.style.opacity = '0';
            }
        });

        titleNumber = (titleNumber + 1) % titles.length;
        setTimeout(animateTitles, 2000); // Change de mot toutes les 2 secondes
    }

    // Démarrer l'animation
    if (animatedSpans.length > 0) {
        setTimeout(animateTitles, 100); // Petit délai initial
    }


    // Gestionnaires d'événements pour les boutons
    document.getElementById('explore-map-home').addEventListener('click', () => {
        document.getElementById('nav-map').click(); // Simule un clic sur le lien de navigation
    });

    document.getElementById('view-stats-home').addEventListener('click', () => {
        document.getElementById('nav-stats').click(); // Simule un clic sur le lien de navigation
    });

    document.getElementById('nav-about-link').addEventListener('click', () => {
        document.getElementById('nav-about').click(); // Simule un clic sur le lien de navigation "À propos"
    });
}