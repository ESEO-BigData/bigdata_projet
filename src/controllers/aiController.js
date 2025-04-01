require('dotenv').config(); // Charger les variables d'environnement du .env
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { success, error } = require('../utils/responseFormatter');
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