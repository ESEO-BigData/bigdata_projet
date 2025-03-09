// src/pages/BornesMap.js
import L from 'leaflet';

export function renderBornesMap(container) {
    container.innerHTML = `
    <section class="map-section">
      <h1>Carte des bornes de recharge</h1>
      <div id="map-container" class="map-container"></div>
      <div class="map-controls">
        <div class="filter-group">
          <label for="filter-departement">Filtrer par département:</label>
          <select id="filter-departement">
            <option value="">Tous les départements</option>
          </select>
        </div>
      </div>
    </section>
  `;

    // Initialiser la carte Leaflet
    const map = L.map('map-container').setView([46.603354, 1.888334], 6); // Centre de la France

    // Ajouter une couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Charger les données des bornes depuis notre API
    fetch('/api/bornes?limit=1000')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.bornes) {
                // Ajouter des marqueurs pour chaque borne
                data.data.bornes.forEach(borne => {
                    if (borne.properties && borne.properties.consolidated_latitude && borne.properties.consolidated_longitude) {
                        const marker = L.marker([
                            borne.properties.consolidated_latitude,
                            borne.properties.consolidated_longitude
                        ]).addTo(map);

                        marker.bindPopup(`
              <strong>${borne.properties.nom_station || 'Borne de recharge'}</strong><br>
              ${borne.properties.adresse_station || ''}<br>
              ${borne.properties.consolidated_commune || ''}<br>
              Points de charge: ${borne.properties.nbre_pdc || 'Non spécifié'}<br>
              Puissance: ${borne.properties.puissance_nominale || 'Non spécifiée'} kW
            `);
                    }
                });
            }
        })
        .catch(error => console.error('Erreur lors du chargement des bornes:', error));
}
