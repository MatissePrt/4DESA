const { BlobServiceClient } = require('@azure/storage-blob');

// Remplace par ta chaîne de connexion Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = "Ta_chaine_de_connexion";

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage Connection string not found');
}

// Initialiser le client BlobService
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

module.exports = { blobServiceClient };
