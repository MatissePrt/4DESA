import express from "express";
import userRouter from "./routes/userRouter.js";
import creatorRouter from "./routes/creatorRouter.js";
import postRouter from "./routes/postRouter.js";
import subRequestRouter from "./routes/subRequestRouter.js";
import subscriberRouter from "./routes/subscriberRouter.js";
import { getDbConnection } from "./config/db.js";
import { initBlobClient } from "./config/blobStorage.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

// Initialisation de l'application
const app = express();

const PORT = process.env.PORT || 3000;

// Configuration Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LinkUp API Documentation",
            version: "1.0.0",
            description: "Documentation de l’API backend pour LinkUp",
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: "Serveur local",
            },
            {
                url: "https://linkup-app-f8guebe2dfddaggt.francecentral-01.azurewebsites.net/",
                description: "Serveur de production",
            }

        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                }
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./routes/*.js"], // Chemin vers les fichiers contenant les endpoints
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation Swagger sur /api/docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log(`Swagger est disponible sur http://localhost:${PORT}/api/docs`);

// Routes
app.use("/api", userRouter);
app.use("/api", creatorRouter);
app.use("/api", postRouter);
app.use("/api", subRequestRouter);
app.use("/api", subscriberRouter);
app.get("/", (req, res) => {
    res.send("Bonjour, bienvenue sur l'API de linkup-app !");
});

// Initialisation de l'application
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
