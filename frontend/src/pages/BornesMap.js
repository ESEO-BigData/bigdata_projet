// src/pages/BornesMap.js
import L from 'leaflet';

export function renderBornesMap(container) {
    container.innerHTML = `
    <section class="map-section">
      <h1>Carte des bornes de recharge par région</h1>
      <div id="map-container" class="map-container"></div>
    </section>
  `;

    const map = L.map('map-container').setView([46.603354, 2.3308], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let allBornesData = [];
    let individualMarkers = [];

    // Charger les limites régionales
    fetch('https://france-geojson.gregoiredavid.fr/repo/regions.geojson')
        .then(res => res.json())
        .then(geojson => {
            L.geoJSON(geojson, {
                style: {
                    color: 'black',
                    weight: 2,
                    opacity: 0.8,
                    dashArray: '5,5',
                    fillOpacity: 0
                }
            }).addTo(map);
        });

    // Charger les bornes
    fetch('/api/points-de-charge')
        .then(res => res.json())
        .then(result => {
            const data = result.data?.data || result.data || result;

            if (!Array.isArray(data)) {
                console.error("❌ Données non valides : attend un tableau.");
                return;
            }

            allBornesData = data;
            console.log("📦 Total de lignes de points de charge récupérées :", data.length);

            const regionsMap = {};
            let totalGlobalBornes = 0;
            let totalGlobalPointsDeCharge = 0;
            let totalBornesMissingRegion = 0;
            let totalBornesInvalid = 0;

            // Regrouper par région
            data.forEach((borne, index) => {
                const region = borne.region;
                const nbBornes = Number(borne.nombre_bornes || 0);

                if (!region) {
                    console.warn(`❌ Région manquante [ligne ${index}] :`, borne);
                    totalBornesMissingRegion++;
                    return;
                }

                if (!regionsMap[region]) {
                    regionsMap[region] = {
                        totalBornes: 0,
                        totalPointsDeCharge: 0,
                        latitudes: [],
                        longitudes: []
                    };
                }

                if (isNaN(nbBornes)) {
                    console.warn(`⚠️ nombre_bornes invalide [ligne ${index}] :`, borne.nombre_bornes);
                    totalBornesInvalid++;
                }

                regionsMap[region].totalBornes += nbBornes;
                regionsMap[region].totalPointsDeCharge += 1;
                totalGlobalBornes += nbBornes;
                totalGlobalPointsDeCharge += 1;

                if (borne.consolidated_latitude && borne.consolidated_longitude) {
                    regionsMap[region].latitudes.push(borne.consolidated_latitude);
                    regionsMap[region].longitudes.push(borne.consolidated_longitude);
                }
            });

            // 💬 Logs finaux
            console.log("✅ Total global des bornes comptabilisées :", totalGlobalBornes);
            console.log("✅ Total global des points de charge comptabilisés :", totalGlobalPointsDeCharge);
            console.log("⚠️ Bornes ignorées car région manquante :", totalBornesMissingRegion);
            console.log("⚠️ Bornes avec valeur invalide dans nombre_bornes :", totalBornesInvalid);

            // Marqueurs région
            Object.entries(regionsMap).forEach(([region, info]) => {
                const avgLat = info.latitudes.reduce((a, b) => a + b, 0) / info.latitudes.length;
                const avgLon = info.longitudes.reduce((a, b) => a + b, 0) / info.longitudes.length;

                const marker = L.marker([avgLat, avgLon]).addTo(map);
                marker.bindPopup(`
          <strong>${region}</strong><br>
          Total de bornes : ${info.totalBornes}<br>
          Total de points de charge : ${info.totalPointsDeCharge}
        `);
            });

            // ✅ Fonction pour mettre à jour les points visibles
            function updateIndividualMarkers() {
                const zoom = map.getZoom();
                const bounds = map.getBounds();

                // Supprimer anciens marqueurs
                individualMarkers.forEach(marker => map.removeLayer(marker));
                individualMarkers = [];

                if (zoom >= 8) {
                    const visibleBornes = allBornesData.filter(borne =>
                        borne.consolidated_latitude &&
                        borne.consolidated_longitude &&
                        bounds.contains([borne.consolidated_latitude, borne.consolidated_longitude])
                    );

                    visibleBornes.forEach(borne => {
                        const marker = L.circleMarker(
                            [borne.consolidated_latitude, borne.consolidated_longitude],
                            { radius: 6 }
                        ).addTo(map);

                        marker.bindPopup(`
              <strong>${borne.consolidated_commune || 'Commune inconnue'}</strong><br>
              ${borne.adresse_station || ''}<br>
              Bornes : ${borne.nombre_bornes || 'N/A'}
            `);

                        individualMarkers.push(marker);
                    });

                    console.log(`🔍 Zoom >=8 → ${visibleBornes.length} points individuels affichés.`);
                } else {
                    console.log("🔎 Zoom <8 → Points individuels masqués.");
                }
            }

            // 👉 Rafraîchir les points sur zoom ET déplacement
            map.on('zoomend', updateIndividualMarkers);
            map.on('moveend', updateIndividualMarkers);
        })
        .catch(err => {
            console.error('❌ Erreur chargement des points de charge :', err);
        });
}
