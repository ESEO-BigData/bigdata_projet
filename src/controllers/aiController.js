require('dotenv').config(); // Charger les variables d'environnement du .env
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { success, error: formatErrorUtil } = require('../utils/responseFormatter');
// Vérifier si la clé API est chargée
if (!process.env.GEMINI_API_KEY) {
    console.error("Erreur: Clé API Gemini (GEMINI_API_KEY) non trouvée dans les variables d'environnement.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

exports.analyzeCorrelation = async (req, res) => {
    try {
        const { xVariable, yVariable, xLabel, yLabel, filterType, coefficient, scatterData } = req.body;

        // Valider les entrées de base
        if (!xVariable || !yVariable || !scatterData || typeof coefficient === 'undefined') {
            // Utilise formatErrorUtil (qui est le 'error' du formatter) et passe 'res'
            return formatErrorUtil(res, "Données manquantes pour l'analyse IA.", null, 400);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });

        const dataSample = scatterData.length > 20
            ? JSON.stringify(scatterData.slice(0, 10)) + `... (Total ${scatterData.length} points)`
            : JSON.stringify(scatterData);

        const prompt = `
        Tu es un assistant d'analyse de données spécialisé dans les véhicules électriques en France.
        Analyse la corrélation suivante entre deux variables, calculée au niveau des ${filterType}.

        Contexte: Analyse de la relation entre ${xLabel} et ${yLabel} pour les ${filterType} français.
        Variable X (${xVariable}): ${xLabel}
        Variable Y (${yVariable}): ${yLabel}
        Type de regroupement: ${filterType}
        Coefficient de corrélation de Pearson (r): ${coefficient.toFixed(3)}

        Voici un échantillon des données utilisées pour le graphique de dispersion (format: {x: valeur_x, y: valeur_y, label: nom_territoire}):
        ${dataSample}

        Tâche: Fournis une analyse concise et pertinente en 2 ou 3 paragraphes maximum, en français.
        - Interprète la force et la direction de la corrélation (${coefficient.toFixed(3)}) dans le contexte spécifique des ${xLabel} et ${yLabel} en France.
        - Ne te contente PAS de définir ce qu'est un coefficient de corrélation. Apporte une valeur ajoutée en suggérant des implications ou des observations spécifiques au domaine (véhicules électriques, infrastructure de recharge, démographie, etc., selon les variables).
        - Si la corrélation est faible, explique pourquoi cela pourrait être le cas.
        - Termine par une ou deux pistes de réflexion ou d'analyse complémentaire qui pourraient être intéressantes.
        - Adopte un ton informatif et neutre.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
            const blockReason = response?.promptFeedback?.blockReason || 'Raison inconnue';
            console.warn(`Réponse de Gemini bloquée. Raison: ${blockReason}`);
            const safetyRatings = JSON.stringify(response?.promptFeedback?.safetyRatings || {});
            console.warn(`Safety Ratings: ${safetyRatings}`);
            // ----- CORRECTION APPEL -----
            return formatErrorUtil(res, `La réponse de l'IA a été bloquée (Raison: ${blockReason}). Veuillez ajuster les variables ou contacter le support si le problème persiste.`, null, 400);
        }

        const analysisText = response.text();

        // ----- CORRECTION APPEL -----
        // Utilise la fonction 'success' importée et passe 'res' et les données
        return success(res, { analysis: analysisText }); // statusCode 200 est par défaut

    } catch (error) { // La variable 'error' ici est l'erreur attrapée par le catch
        console.error("Erreur lors de l'appel à l'API Gemini:", error);
        // ----- CORRECTION APPEL -----
        // Utilise formatErrorUtil et passe 'res', le message, et l'objet 'error' du catch
        return formatErrorUtil(res, "Une erreur interne est survenue lors de l'analyse par l'IA.", error, 500);
    }
};

exports.analyzeComparison = async (req, res) => {
    try {
        const { territoryType, territory1Name, territory2Name, comparisonData } = req.body;

        // Valider les entrées
        if (!territoryType || !territory1Name || !territory2Name || !comparisonData) {
            return formatErrorUtil(res, "Données manquantes pour l'analyse de comparaison IA.", null, 400);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });

        // --- Construction du Prompt ---
        // Adapter le prompt pour la comparaison
        // Rendre les données plus lisibles pour l'IA
        let dataText = '';
        try {
            // Formatter les données pour les rendre plus claires dans le prompt
            const formatValue = (val) => (typeof val === 'number' ? val.toLocaleString('fr-FR') : val);
            let data1, data2;

            if (territoryType === 'regions') {
                data1 = comparisonData.region1;
                data2 = comparisonData.region2;
            } else if (territoryType === 'departements') {
                data1 = comparisonData.departement1;
                data2 = comparisonData.departement2;
            } else if (territoryType === 'communes') {
                data1 = comparisonData.commune1;
                data2 = comparisonData.commune2;
            } else {
                throw new Error("Type de territoire inconnu pour le formatage");
            }

            dataText = `
Données pour ${territory1Name}:
- Véhicules Électriques: ${formatValue(data1.totalVehiculesElectriques)}
- Bornes de Recharge: ${formatValue(data1.totalBornes)}
- Points de Charge: ${formatValue(data1.totalPointsCharge)}
- Ratio Véhicules/Borne: ${formatValue(data1.ratioVehiculesParBorne)}
- % Véhicules Électriques: ${formatValue(data1.pourcentageVehiculesElectriques)}${territoryType === 'communes' ? ` (sur ${formatValue(data1.totalVehicules)} total)` : ''}

Données pour ${territory2Name}:
- Véhicules Électriques: ${formatValue(data2.totalVehiculesElectriques)}
- Bornes de Recharge: ${formatValue(data2.totalBornes)}
- Points de Charge: ${formatValue(data2.totalPointsCharge)}
- Ratio Véhicules/Borne: ${formatValue(data2.ratioVehiculesParBorne)}
- % Véhicules Électriques: ${formatValue(data2.pourcentageVehiculesElectriques)}${territoryType === 'communes' ? ` (sur ${formatValue(data2.totalVehicules)} total)` : ''}
  `;
        } catch (fmtError) {
            console.error("Erreur de formatage des données pour le prompt:", fmtError);
            dataText = "Erreur lors du formatage des données. Données brutes: " + JSON.stringify(comparisonData);
        }


        const prompt = `
      Tu es un assistant d'analyse de données spécialisé dans la mobilité électrique et les territoires français (Régions, Départements, Communes).
      Analyse et explique les différences entre les deux territoires suivants, basées sur les données fournies.

      Territoire 1: ${territory1Name} (${territoryType})
      Territoire 2: ${territory2Name} (${territoryType})

      Données Comparatives:
      ${dataText}

      Tâche: Fournis une analyse concise (2-4 paragraphes) en français.
      1.  **Synthétise** les différences clés observées dans les chiffres (ex: quel territoire a significativement plus de véhicules, un meilleur ratio, etc.).
      2.  **Propose des explications possibles** pour ces différences. Ne te limite pas aux chiffres. Évoque des facteurs contextuels pertinents tels que :
          *   Urbanisation vs Ruralité
          *   Densité de population
          *   Caractéristiques économiques (zone industrielle, tertiaire, agricole...)
          *   Attractivité touristique
          *   Politiques locales de mobilité
          *   Topographie (montagne, plaine...) - si pertinent et imaginable.
          *   Revenu moyen (si tu peux faire une hypothèse plausible).
      3.  **Conclus** par une brève perspective ou une observation générale sur la situation de ces deux territoires en matière de mobilité électrique.
      4.  Adopte un ton informatif, analytique et nuancé. Évite les affirmations trop catégoriques si elles ne sont pas directement supportées par les chiffres. Ne te contente pas de répéter les données.
      `;

        const result = await model.generateContent(prompt);
        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
            const blockReason = response?.promptFeedback?.blockReason || 'Raison inconnue';
            console.warn(`Réponse de Gemini bloquée (Comparaison). Raison: ${blockReason}`);
            const safetyRatings = JSON.stringify(response?.promptFeedback?.safetyRatings || {});
            console.warn(`Safety Ratings: ${safetyRatings}`);
            return formatErrorUtil(res, `La réponse de l'IA a été bloquée (Raison: ${blockReason}).`, null, 400);
        }

        const analysisText = response.text();

        return success(res, { analysis: analysisText });

    } catch (error) {
        console.error("Erreur lors de l'analyse de comparaison IA:", error);
        return formatErrorUtil(res, "Une erreur interne est survenue lors de l'analyse de comparaison par l'IA.", error, 500);
    }
};