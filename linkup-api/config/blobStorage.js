import { BlobServiceClient } from '@azure/storage-blob';
import getSecrets from "./config.js";

let blobServiceClient;

async function initBlobClient() {
    const secrets = await getSecrets();
    const AZURE_STORAGE_CONNECTION = secrets.AZURE_STORAGE_CONNECTION;
  
    if (!AZURE_STORAGE_CONNECTION) {
      throw new Error("Azure Storage Connection string not found");
    }
  
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION);
  }
  
  export { blobServiceClient, initBlobClient };
