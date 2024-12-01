import express from "express";
import userRouter from "./routes/userRouter.js";
import creatorRouter from "./routes/creatorRouter.js";
import postRouter from "./routes/postRouter.js";
import subRequestRouter from "./routes/subRequestRouter.js"
import subscriberRouter from "./routes/subscriberRouter.js";
import { getDbConnection } from "./config/db.js";
import { initBlobClient } from "./config/blobStorage.js";

// Initialisation de l'application
const app = express();

const PORT =  process.env.PORT

// Middleware
app.use(express.json()); // Pour analyser les requêtes au format JSON
app.use(express.urlencoded({ extended: true })); // Pour analyser les données URL encodées

// Routes
app.use("/api", userRouter);
app.use("/api", creatorRouter);
app.use("/api", postRouter);
app.use("/api", subRequestRouter);
app.use("/api", subscriberRouter);



async function initApp() {
    try {
        await initBlobClient();
        await getDbConnection();
        console.log("Application initialisée avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application:", error);
    }
}

initApp();


// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
