import jwt from "jsonwebtoken";
import mssql from "mssql";
import { getDbConnection } from "../config/db.js";
import getSecrets from "../config/config.js"; // Importation de la fonction pour obtenir les secrets

export async function authentication(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            error: "Le jeton est manquant.",
        });
    }

    try {
        // Récupérer les secrets depuis Key Vault
        const secrets = await getSecrets();
        const jwtSecret = secrets.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(401).json({
                error: "JwtSecret inaccessible.",
            });
        }

        // Vérification du jeton avec la clé secrète récupérée
        jwt.verify(token, jwtSecret, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: `Erreur d'authentification : ${err.message}`,
                });
            }

            if (!decoded || typeof decoded !== "object") {
                return res.status(401).json({
                    error: "Le jeton n'est pas valide.",
                });
            }

            const userId = decoded.userId;

            try {
                const pool = await getDbConnection();

                if (!pool) {
                    return res.status(500).json({error: "Erreur de connexion à la base de données."});
                }

                const result = await pool.request()
                    .input("userId", mssql.Int, userId)
                    .query("SELECT userId FROM [User] WHERE userId = @userId");

                if (result.recordset.length === 0) {
                    return res.status(401).json({
                        error: "Utilisateur non trouvé.",
                    });
                }

                const user = result.recordset[0];

                res.locals.userId = user.userId;

                return next();
            } catch (error) {
                console.error("Erreur lors de la vérification de l'utilisateur :", error);
                return res.status(500).json({
                    error: "Erreur interne du serveur.",
                });
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des secrets ou vérification du token :", error);
        return res.status(500).json({
            error: "Erreur interne du serveur.",
        });
    }
}
