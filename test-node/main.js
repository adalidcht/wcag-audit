require('dotenv').config();
const { uploadJsonToBlob, downloadJsonFromBlob } = require('./blobOperations');

// Archivo JSON de ejemplo
const reportBlobName = 'reporte_www.urlcom.json'; #URL del archivo
const recommendationBlobName = 'example_recommendation.json';

// JSON de ejemplo para subir
const exampleReportJson = {
    title: "Accessibility Report",
    issues: [
        { id: 1, description: "Low contrast text" },
        { id: 2, description: "Missing alt text" }
    ]
};

const exampleRecommendationJson = {
    recommendations: [
        { id: 1, action: "Increase text contrast" },
        { id: 2, action: "Add alt text to images" }
    ]
};

const containerReportName = process.env.CONTAINER_REPORT_NAME;
const containerRecommendationName = process.env.CONTAINER_RECOMMENDATION_NAME;

// Función principal
(async () => {
    try {
        // Subir JSON al contenedor de reportes
        console.log("Subiendo reporte...");
        await uploadJsonToBlob(containerReportName, reportBlobName, exampleReportJson);

        // Descargar JSON del contenedor de reportes
        console.log("Descargando reporte...");
        const downloadedReport = await downloadJsonFromBlob(containerReportName, reportBlobName);
        console.log("Reporte descargado:", downloadedReport);

        // Subir JSON al contenedor de recomendaciones
        console.log("Subiendo recomendación...");
        await uploadJsonToBlob(containerRecommendationName, recommendationBlobName, exampleRecommendationJson);

        // Descargar JSON del contenedor de recomendaciones
        console.log("Descargando recomendación...");
        const downloadedRecommendation = await downloadJsonFromBlob(containerRecommendationName, recommendationBlobName);
        console.log("Recomendación descargada:", downloadedRecommendation);
    } catch (error) {
        console.error("Error en el script principal:", error.message);
    }
})();
