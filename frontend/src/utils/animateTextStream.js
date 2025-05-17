// frontend/src/utils/animateTextStream.js

/**
 * Anime l'affichage d'un texte mot par mot avec un effet de fondu.
 * @param {HTMLElement} container L'élément HTML où afficher le texte.
 * @param {string} text Le texte à animer.
 * @param {object} options Options d'animation.
 * @param {number} [options.fadeDuration=800] Durée du fondu pour chaque mot en ms.
 * @param {number} [options.segmentDelay=100] Délai entre l'apparition de chaque mot en ms.
 */
export function animateTextStreamByWord(container, text, options = {}) {
    if (!container || typeof text !== 'string') {
        if (container) container.textContent = text || ''; // Fallback si texte invalide
        console.error('animateTextStreamByWord: Conteneur ou texte invalide.');
        return;
    }

    const {
        fadeDuration = 500, // Durée du fondu par mot
        segmentDelay = 80   // Délai entre chaque mot
    } = options;

    container.innerHTML = ''; // Vider le conteneur

    // Gérer les sauts de ligne du texte original
    const lines = text.split(/\n/);
    let globalWordIndex = 0;

    lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
            container.appendChild(document.createElement('br'));
        }

        // Utiliser Intl.Segmenter si disponible pour une meilleure segmentation des mots
        let segments;
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            try {
                const segmenter = new Intl.Segmenter(navigator.language || 'fr', { granularity: 'word' });
                segments = Array.from(segmenter.segment(line)).map(s => s.segment);
            } catch (e) {
                // Fallback si Intl.Segmenter échoue ou n'est pas supporté avec 'word'
                segments = line.split(/(\s+)/).filter(Boolean); // Sépare par mots et espaces
            }
        } else {
            // Fallback pour les navigateurs plus anciens
            segments = line.split(/(\s+)/).filter(Boolean); // Sépare par mots et espaces
        }

        segments.forEach((segmentText) => {
            const span = document.createElement('span');
            span.textContent = segmentText;
            span.classList.add('fade-segment');
            if (/^\s+$/.test(segmentText)) { // Si le segment est uniquement des espaces
                span.classList.add('is-space');
            }

            span.style.animationDuration = `${fadeDuration}ms`;
            span.style.animationDelay = `${globalWordIndex * segmentDelay}ms`;

            container.appendChild(span);
            globalWordIndex++;
        });
    });
}