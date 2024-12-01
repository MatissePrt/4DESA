import mssql from "mssql";
import getSecrets from "./config.js";

let dbConfig;

// Configuration de la base de données
async function initDbConfig() {
  const secrets = await getSecrets();
  dbConfig = {
    user: secrets.DB_USER,
    password: secrets.DB_PASSWORD,
    server: secrets.DB_SERVER,
    database: secrets.DB_DATABASE,
    options: {
      encrypt: true, // Utilisé pour Azure SQL
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
  };
}

export async function getDbConnection() {
  if (!dbConfig) {
    await initDbConfig();
  }

  try {
    const pool = await mssql.connect(dbConfig);
    console.log("Connexion à la base de données réussie.");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  }
}
