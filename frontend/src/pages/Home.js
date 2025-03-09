// src/pages/Home.js
export function renderHomePage(container) {
    container.innerHTML = `
    <section class="home-section">
      <h1>Véhicules Électriques en France</h1>
      <p>Bienvenue sur notre plateforme d'analyse des véhicules électriques en France.</p>
      
      <div class="features">
        <div class="feature-card">
          <h2>Carte des bornes</h2>
          <p>Explorez la répartition des bornes de recharge électrique sur le territoire français.</p>
          <button id="explore-map" class="btn">Explorer la carte</button>
        </div>
        
        <div class="feature-card">
          <h2>Statistiques</h2>
          <p>Découvrez des statistiques détaillées sur les véhicules électriques par région et département.</p>
          <button id="view-stats" class="btn">Voir les statistiques</button>
        </div>
      </div>
    </section>
  `;

    // Ajouter des gestionnaires d'événements pour les boutons
    document.getElementById('explore-map').addEventListener('click', () => {
        document.getElementById('nav-map').click();
    });

    document.getElementById('view-stats').addEventListener('click', () => {
        document.getElementById('nav-stats').click();
    });
}
