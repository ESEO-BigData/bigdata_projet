// Formatage des réponses réussies
exports.success = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data
    });
};

// Formatage des erreurs
exports.error = (res, message, error = null, statusCode = 500) => {
    const response = {
        success: false,
        message
    };

    if (process.env.NODE_ENV !== 'production' && error) {
        response.error = error.toString();
    }

    return res.status(statusCode).json(response);
};

// Ressource non trouvée
exports.notFound = (res, message = 'Ressource non trouvée') => {
    return res.status(404).json({
        success: false,
        message
    });
};

// Requête incorrecte
exports.badRequest = (res, message = 'Requête incorrecte') => {
    return res.status(400).json({
        success: false,
        message
    });
};
