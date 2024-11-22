import { BlobServiceClient } from '@azure/storage-blob';

// Remplacez par votre vraie chaîne de connexion
const connectionString = "DefaultEndpointsProtocol=https;AccountName=linkupdb;AccountKey=RrU7xPpMeyUfm0Fq7cCp0q8QfOJJGIUKSWxRBLVYI6O1qXGHmpBiPPrzxZiVOUlM/0ichcTKoQMu+ASty8jb/A==;EndpointSuffix=core.windows.net";
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const testConnection = async () => {
    try {
        const containerName = 'media'; // Nom du conteneur
        const containerClient = blobServiceClient.getContainerClient(containerName);

        console.log(`Vérification de l'accès au container "${containerName}"...`);
        const properties = await containerClient.getProperties();
        console.log(`Container trouvé :`, properties);
    } catch (error) {
        console.error('Erreur de connexion ou de configuration :', error.message);
    }
};

// Appeler la fonction
testConnection();
