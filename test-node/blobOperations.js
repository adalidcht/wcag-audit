require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

// Leer las variables de entorno
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerReportName = process.env.CONTAINER_REPORT_NAME;
const containerRecommendationName = process.env.CONTAINER_RECOMMENDATION_NAME;

// Crear el cliente del servicio Blob
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Función para subir un JSON a Blob Storage
const uploadJsonToBlob = async (containerName, blobName, jsonData) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();

        const blobClient = containerClient.getBlockBlobClient(blobName);
        const jsonString = JSON.stringify(jsonData, null, 4);

        await blobClient.upload(jsonString, Buffer.byteLength(jsonString));
        console.log(`JSON subido al contenedor '${containerName}' con el nombre '${blobName}'`);
    } catch (error) {
        console.error("Error al subir el JSON:", error.message);
        throw error;
    }
};

// Función para descargar un JSON desde Blob Storage
const downloadJsonFromBlob = async (containerName, blobName) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlockBlobClient(blobName);

        const downloadBlockBlobResponse = await blobClient.download();
        const downloadedData = await streamToString(downloadBlockBlobResponse.readableStreamBody);

        const jsonData = JSON.parse(downloadedData);
        console.log(`JSON descargado desde '${containerName}' con el nombre '${blobName}'`);
        return jsonData;
    } catch (error) {
        console.error("Error al descargar el JSON:", error.message);
        throw error;
    }
};

// Función auxiliar para convertir el flujo de datos en una cadena
const streamToString = async (readableStream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => chunks.push(data.toString()));
        readableStream.on("end", () => resolve(chunks.join("")));
        readableStream.on("error", reject);
    });
};

module.exports = {
    uploadJsonToBlob,
    downloadJsonFromBlob,
};