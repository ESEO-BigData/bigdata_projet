// src/pages/About.js
export function renderAboutPage(container) {
    container.innerHTML = `
    <section class="about-section">
      <h1>À propos du projet</h1>
      
      <p>Ce projet a été développé dans le cadre d'un cours sur le Big Data. Il vise à analyser et visualiser les données sur les véhicules électriques en France.</p>
      
      <h2>Sources de données</h2>
      <ul>
        <li>Bornes de recharge électrique</li>
        <li>Nombre de véhicules électriques par région</li>
        <li>Nombre de véhicules électriques par commune</li>
        <li>Informations démographiques sur les régions et départements</li>
      </ul>
      
      <h2>Technologies utilisées</h2>
      <ul>
        <li>Backend: Node.js, Express, MongoDB</li>
        <li>Frontend: JavaScript, D3.js, Leaflet, Chart.js</li>
      </ul>
      
      <h2>Équipe</h2>
      <p>Projet réalisé par l'équipe BigData.</p>
    </section>
  `;
}
