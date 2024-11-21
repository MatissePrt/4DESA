import express from "express";
import mssql from "mssql";
import UserRoute from "../routes/UserRoute.js"; // Importer les routes pour les utilisateurs

import dotenv from "dotenv";
dotenv.config(); // Charger les variables d'environnement

// Configuration de la base de données
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Utilisé pour Azure SQL
    enableArithAbort: true, // Recommandé par mssql
  },
};

export async function getDbConnection() {
    try {
      const pool = await mssql.connect(dbConfig);
      console.log('Connexion à la base de données réussie.')
      return pool;
    } catch (err) {
      console.error("Database connection failed:", err.message);
      throw err;
    }
  }

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Pour analyser les requêtes au format JSON
app.use(express.urlencoded({ extended: true })); // Pour analyser les données URL encodées

// Routes
app.use("/api/users", UserRoute); // Ajouter les routes définies pour les utilisateurs

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
