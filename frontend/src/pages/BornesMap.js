import L from 'leaflet';

const normalizeString = str =>
    str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
    let departementMarkers = [];
    let regionMarkers = [];
    let departementLayer = null;
    let departementGeojson = null;
    let departementInfos = {};

    const domTomRegions = [
        'martinique', 'guadeloupe', 'guyane', 'mayotte',
        'la reunion', 'réunion', 'saint-pierre-et-miquelon'
    ];

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

    fetch('https://france-geojson.gregoiredavid.fr/repo/departements.geojson')
        .then(res => res.json())
        .then(geojson => {
            departementGeojson = geojson;
        });

    fetch('/api/vehicules/regions')
        .then(res => res.json())
        .then(vehiculesRes => {
            const vehiculesByRegion = {};
            (vehiculesRes.data || []).forEach(item => {
                const regionKey = normalizeString(item.REGION);
                vehiculesByRegion[regionKey] = item.somme_NB_VP_RECHARGEABLES_EL;
            });

            let totalVehicules = 0;
            Object.values(vehiculesByRegion).forEach(count => {
                totalVehicules += Number(count || 0);
            });
            console.log(`🚗 Total de véhicules électriques (métropole uniquement) : ${totalVehicules}`);

            fetch('/api/departements')
                .then(res => res.json())
                .then(deptRes => {
                    (deptRes.data || []).forEach(dep => {
                        departementInfos[dep.NOM] = {
                            lat: dep.latitude_chef_lieu,
                            lon: dep.longitude_chef_lieu,
                            vehicules: dep.somme_NB_VP_RECHARGEABLES_EL || 0
                        };
                    });

                    fetch('/api/points-de-charge')
                        .then(res => res.json())
                        .then(result => {
                            const data = result.data?.data || result.data || result;
                            if (!Array.isArray(data)) return;

                            allBornesData = data;
                            const regionsMap = {};
                            const departementsMap = {};

                            data.forEach(borne => {
                                const region = borne.region;
                                const dept = borne.departement;
                                const nbBornes = Number(borne.nombre_bornes || 0);

                                if (region) {
                                    if (!regionsMap[region]) {
                                        regionsMap[region] = {
                                            totalBornes: 0,
                                            totalPointsDeCharge: 0,
                                            latitudes: [],
                                            longitudes: []
                                        };
                                    }
                                    regionsMap[region].totalBornes += nbBornes;
                                    regionsMap[region].totalPointsDeCharge += 1;
                                    if (borne.consolidated_latitude && borne.consolidated_longitude) {
                                        regionsMap[region].latitudes.push(borne.consolidated_latitude);
                                        regionsMap[region].longitudes.push(borne.consolidated_longitude);
                                    }
                                }

                                if (dept) {
                                    if (!departementsMap[dept]) {
                                        departementsMap[dept] = {
                                            totalBornes: 0,
                                            totalPointsDeCharge: 0
                                        };
                                    }
                                    departementsMap[dept].totalBornes += nbBornes;
                                    departementsMap[dept].totalPointsDeCharge += 1;
                                }
                            });

                            let totalDomTomVehicules = 0;

                            Object.entries(regionsMap).forEach(([region, info]) => {
                                const avgLat = info.latitudes.reduce((a, b) => a + b, 0) / info.latitudes.length;
                                const avgLon = info.longitudes.reduce((a, b) => a + b, 0) / info.longitudes.length;

                                const regionKey = normalizeString(region);
                                const marker = L.marker([avgLat, avgLon]).addTo(map);

                                if (domTomRegions.includes(regionKey)) {
                                    fetch(`/api/bornes-communes/vehiculesEL/region/${encodeURIComponent(region)}`)
                                        .then(res => res.json())
                                        .then(data => {
                                            const nbVeh = data.data?.totalVehiculesElectriques || 0;
                                            totalDomTomVehicules += nbVeh;

                                            marker.bindPopup(`
                                                <strong>${region}</strong><br>
                                                Total de bornes : ${info.totalBornes}<br>
                                                Total de points de charge : ${info.totalPointsDeCharge}<br>
                                                Véhicules électriques : ${nbVeh}
                                            `);

                                            console.log(`🌴 [DOM-TOM] ${region} → ${nbVeh} véhicules électriques`);
                                            console.log(`🔢 Total DOM-TOM (cumulé) : ${totalDomTomVehicules}`);
                                            console.log(`🔢 Total global (Métropole + DOM-TOM) : ${totalVehicules + totalDomTomVehicules}`);
                                        })

                                        .catch(err => {
                                            console.error('Erreur chargement véhicules DOM-TOM', err);
                                            marker.bindPopup(`
                                                <strong>${region}</strong><br>
                                                Total de bornes : ${info.totalBornes}<br>
                                                Total de points de charge : ${info.totalPointsDeCharge}<br>
                                                Véhicules électriques : N/A
                                            `);
                                        });
                                } else {
                                    const nbVehicules = vehiculesByRegion[regionKey] || 0;
                                    marker.bindPopup(`
                                        <strong>${region}</strong><br>
                                        Total de bornes : ${info.totalBornes}<br>
                                        Total de points de charge : ${info.totalPointsDeCharge}<br>
                                        Véhicules électriques : ${nbVehicules}
                                    `);
                                }

                                regionMarkers.push(marker);
                            });

                            function updateMapDisplay() {
                                const zoom = map.getZoom();
                                const bounds = map.getBounds();

                                if (zoom >= 8) {
                                    regionMarkers.forEach(m => map.removeLayer(m));
                                } else {
                                    regionMarkers.forEach(m => m.addTo(map));
                                }

                                if (zoom >= 8) {
                                    if (!departementLayer && departementGeojson) {
                                        departementLayer = L.geoJSON(departementGeojson, {
                                            style: {
                                                color: 'black',
                                                weight: 2,
                                                opacity: 0.8,
                                                dashArray: '4,4',
                                                fillOpacity: 0
                                            }
                                        }).addTo(map);
                                    }

                                    departementMarkers.forEach(m => map.removeLayer(m));
                                    departementMarkers = [];

                                    Object.entries(departementsMap).forEach(([deptName, info]) => {
                                        const deptInfo = departementInfos[deptName];
                                        if (!deptInfo || !deptInfo.lat || !deptInfo.lon) return;

                                        const marker = L.marker([deptInfo.lat, deptInfo.lon]).addTo(map);
                                        marker.bindPopup(`
                                            <strong>${deptName}</strong><br>
                                            Total de bornes : ${info.totalBornes}<br>
                                            Total de points de charge : ${info.totalPointsDeCharge}<br>
                                            Véhicules électriques : ${deptInfo.vehicules}
                                        `);
                                        departementMarkers.push(marker);
                                    });
                                } else {
                                    if (departementLayer) {
                                        map.removeLayer(departementLayer);
                                        departementLayer = null;
                                    }
                                    departementMarkers.forEach(m => map.removeLayer(m));
                                    departementMarkers = [];
                                }

                                individualMarkers.forEach(m => map.removeLayer(m));
                                individualMarkers = [];

                                if (zoom >= 9) {
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

                                        marker.bindPopup('<em>Chargement des détails...</em>');

                                        marker.on('click', () => {
                                            const adresse = encodeURIComponent(borne.adresse_station || '');
                                            const idStation = encodeURIComponent(borne.id_station_itinerance || '');

                                            fetch(`/api/bornes/details?adresse=${adresse}&id=${idStation}`)
                                                .then(res => res.json())
                                                .then(detailRes => {
                                                    const bornesInfos = detailRes.data;
                                                    const paiementsSet = new Set();
                                                    const typesSet = new Set();
                                                    const puissancesSet = new Set();

                                                    bornesInfos.forEach(info => {
                                                        if (info.paiement.acte) paiementsSet.add('Paiement à l’acte');
                                                        if (info.paiement.cb) paiementsSet.add('Carte bancaire');
                                                        if (info.paiement.autre) paiementsSet.add('Autres méthodes');
                                                        if (info.types_prise.type2) typesSet.add('Type 2');
                                                        if (info.types_prise.chademo) typesSet.add('CHAdeMO');
                                                        if (info.types_prise.combo_ccs) typesSet.add('Combo CCS');
                                                        if (info.types_prise.ef) typesSet.add('Prise E/F');
                                                        if (info.puissance_kw) puissancesSet.add(info.puissance_kw + ' kW');
                                                    });

                                                    const paiementsText = paiementsSet.size > 0 ? Array.from(paiementsSet).join(', ') : 'Carte Bancaire';
                                                    const typesText = typesSet.size > 0 ? Array.from(typesSet).join(', ') : 'Standard';
                                                    const puissancesText = puissancesSet.size > 0 ? Array.from(puissancesSet).join(', ') : 'Non renseigné';

                                                    const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(borne.consolidated_latitude)},${encodeURIComponent(borne.consolidated_longitude)}`;

                                                    marker.setPopupContent(`
                                                        <strong>${borne.consolidated_commune || 'Commune inconnue'}</strong><br>
                                                        <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">${borne.adresse_station || 'Voir itinéraire'}</a><br>
                                                        <strong>Nombre de bornes :</strong> ${borne.nombre_bornes || 'N/A'}<br>
                                                        <strong>Méthodes de paiement :</strong> ${paiementsText}<br>
                                                        <strong>Types de prises :</strong> ${typesText}<br>
                                                        <strong>Puissance :</strong> ${puissancesText}
                                                    `);
                                                });
                                        });

                                        individualMarkers.push(marker);
                                    });
                                }
                            }

                            map.on('zoomend', updateMapDisplay);
                            map.on('moveend', updateMapDisplay);
                        });
                });
        });
}
