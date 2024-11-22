import express from "express";
import dotenv from "dotenv";
import UserRoute from "./routes/userRoute.js";
import { getDbConnection } from "./config/db.js";

const result = dotenv.config();
if (result.error) {
    console.error("Erreur lors du chargement du fichier .env :", result.error);
    process.exit(1);
}

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Pour analyser les requêtes au format JSON
app.use(express.urlencoded({ extended: true })); // Pour analyser les données URL encodées

// Routes
app.use("/api/users", UserRoute);

// Vérifier la connexion à la base de données
getDbConnection().catch((err) => {
    console.error("Erreur lors de la connexion à la base de données :", err);
    process.exit(1); // Arrêter le serveur si la connexion échoue
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
