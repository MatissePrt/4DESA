import mssql from "mssql";
import subRequestSchema from "../models/subRequest.js";
import dotenv from "dotenv";
import { getDbConnection } from "../config/db.js";
dotenv.config();

export async function create(req, res) {
    const { userId, creatorId } = req.params;

    // Vérification si userId, creatorId, et res.locals.userId sont des nombres
    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId)) || isNaN(Number(creatorId))) {
        return res.status(400).json({
            error: `userId: "${userId}", res.locals.userId: "${res.locals.userId}", ou creatorId: "${creatorId}" n'est pas un nombre adapté.`
        });
    }

    // Vérification si userId correspond à res.locals.userId
    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({
            error: `Non autorisé.`
        });
    }

    // Valider les données du corps
    const { error } = subRequestSchema.validate({ userId, creatorId });
    if (error) {
        return res.status(400).json({
            error: error.details[0].message,
        });
    }

    try {
        const pool = await getDbConnection();

        // Vérifier que le CreatorId existe et appartient à cet utilisateur
        const creatorCheck = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT 1
        FROM Creator
        WHERE CreatorId = @creatorId
      `);

        if (creatorCheck.recordset.length === 0) {
            return res.status(404).json({
                error: "Créateur non trouvé."
            });
        }

        // Vérifier si une sous-demande existe déjà pour cet utilisateur et ce créateur
        const subRequestCheck = await pool.request()
            .input("userId", mssql.Int, userId)
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT 1
        FROM SubRequest
        WHERE UserId = @userId AND CreatorId = @creatorId
      `);

        if (subRequestCheck.recordset.length > 0) {
            return res.status(409).json({
                error: "Une sous-demande existe déjà pour cet utilisateur et ce créateur."
            });
        }

        // Créer la sous-demande
        const result = await pool.request()
            .input("userId", mssql.Int, userId)
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        INSERT INTO SubRequest (UserId, CreatorId)
        OUTPUT INSERTED.SubRequestId
        VALUES (@userId, @creatorId)
      `);

        res.status(201).json({
            message: "Sous-demande créée avec succès.",
            subRequestId: result.recordset[0].SubRequestId,
        });

        pool.close();
    } catch (err) {
        console.error("Database error:", err);

        // Vérification des erreurs spécifiques SQL
        if (err.code === 'EREQUEST' && err.message.includes('UQ_SubRequest')) {
            return res.status(409).json({
                error: "Violation de la contrainte unique : une sous-demande existe déjà pour cet utilisateur et ce créateur."
            });
        }

        res.status(500).json({ error: "Erreur interne du serveur." });
    }
}

export async function readAll(req, res) {
    

}