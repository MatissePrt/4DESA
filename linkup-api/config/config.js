import { ManagedIdentityCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const url = `https://linkup-vault.vault.azure.net/`;

const credential = new ManagedIdentityCredential();
const client = new SecretClient(url, credential);

async function getSecrets() {
  try {
    const dbUser = await client.getSecret("DB-USER");
    const dbPassword = await client.getSecret("DB-PASSWORD");
    const dbServer = await client.getSecret("DB-SERVER");
    const dbDatabase = await client.getSecret("DB-DATABASE");
    const azureStorageConnection = await client.getSecret("AZURE-STORAGE-CONNECTION");
    const jwtSecret = await client.getSecret("JWT-SECRET");
    const port = await client.getSecret("PORT");

    return {
      DB_USER: dbUser.value,
      DB_PASSWORD: dbPassword.value,
      DB_SERVER: dbServer.value,
      DB_DATABASE: dbDatabase.value,
      AZURE_STORAGE_CONNECTION: azureStorageConnection.value,
      JWT_SECRET: jwtSecret.value,
      PORT: port.value
      
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des secrets:", error);
    throw error;
  }
}

export default getSecrets;
