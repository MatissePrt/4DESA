import mssql from "mssql";
import subRequestSchema from "../models/subRequest.js";
import { getDbConnection } from "../config/db.js";

export async function create(req, res) {
    const { userId, creatorId } = req.params;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId)) || isNaN(Number(creatorId))) {
        return res.status(400).json({
            error: `userId: "${userId}", res.locals.userId: "${res.locals.userId}", ou creatorId: "${creatorId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({
            error: `Non autorisé.`
        });
    }

    const { error } = subRequestSchema.validate({ userId, creatorId });
    if (error) {
        return res.status(400).json({
            error: error.details[0].message,
        });
    }

    const pool = await getDbConnection();
    try {

        const creatorCheck = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT UserId
        FROM Creator
        WHERE CreatorId = @creatorId
      `);

        if (creatorCheck.recordset.length === 0) {
            return res.status(404).json({
                error: "Créateur non trouvé."
            });
        }

        if (creatorCheck.recordset[0].UserId === Number(userId)) {
            return res.status(404).json({
                error: "Un utilisateur ne peux pas se suivre lui même."
            })
        }

        const subRequestCheckPublic = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT 1
        FROM Creator
        WHERE CreatorId = @creatorId AND IsPublic = 1
            `)

        if (subRequestCheckPublic.recordset.length === 1) {
            await pool.request()
                .input("userId", mssql.Int, userId)
                .input("creatorId", mssql.Int, creatorId)
                .input("hasAccess", mssql.Bit, 1)
                .query(`
                    MERGE INTO Subscriber AS target
                    USING (SELECT @userId AS UserId, @creatorId AS CreatorId) AS source
                    ON (target.UserId = source.UserId AND target.CreatorId = source.CreatorId)
                    WHEN MATCHED THEN
                        UPDATE SET HasAccess = 1
                    WHEN NOT MATCHED THEN
                        INSERT (UserId, CreatorId, HasAccess)
                        VALUES (@userId, @creatorId, 1);
                `);

            return res.status(201).json({
                message: "Abonné créé avec succès.",
            });
        }

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
        pool.close();
        console.error("Database error:", err);

        if (err.code === 'EREQUEST' && err.message.includes('UQ_SubRequest')) {
            return res.status(409).json({
                error: "Violation de la contrainte unique : une sous-demande existe déjà pour cet utilisateur et ce créateur."
            });
        }

        res.status(500).json({ error: "Erreur interne du serveur." });
    }
}

export async function readAll(req, res) {
    const { userId, creatorId } = req.params;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId)) || isNaN(Number(creatorId))) {
        return res.status(400).json({
            error: `userId: "${userId}", res.locals.userId: "${res.locals.userId}", ou creatorId: "${creatorId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({
            error: `Non autorisé.`
        });
    }

    let pool;
    try {
        pool = await getDbConnection();

        const creatorCheck = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .input("userId", mssql.Int, userId)
            .query(`
          SELECT CreatorId
          FROM Creator
          WHERE CreatorId = @creatorId AND UserId = @userId
        `);

        if (creatorCheck.recordset.length === 0) {
            return res.status(404).json({ error: "Créateur non trouvé." });
        }

        const subRequests = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
          SELECT 
            SubRequestId,
            UserId,
            CreatorId
          FROM SubRequest
          WHERE CreatorId = @creatorId
        `);

        return res.status(200).json({
            message: "Sous-demandes récupérées avec succès.",
            data: subRequests.recordset,
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    } finally {
        if (pool) {
            pool.close(); 
        }
    }
}

export async function readOne(req, res) {
    const { userId, creatorId, subRequestId } = req.params;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId)) || isNaN(Number(creatorId)) || isNaN(Number(subRequestId))) {
        return res.status(400).json({
            error: `userId: "${userId}", res.locals.userId: "${res.locals.userId}", subRequestId: "${subRequestId}", ou creatorId: "${creatorId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({
            error: `Non autorisé.`
        });
    }

    let pool;
    try {
        pool = await getDbConnection();

        const subRequest = await pool.request()
            .input("subRequestId", mssql.Int, subRequestId)
            .query(`
          SELECT 
            SubRequestId,
            UserId,
            CreatorId
          FROM SubRequest
          WHERE SubRequestId = @subRequestId
        `);

        if (subRequest.recordset.length === 0) {
            return res.status(404).json({
                error: "Sous-demande non trouvée.",
            });
        }

        return res.status(200).json({
            message: "Sous-demande récupérée avec succès.",
            data: subRequest.recordset[0],
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({
            error: "Erreur interne du serveur.",
        });
    } finally {
        if (pool) {
            pool.close(); 
        }
    }
}

export async function deleteSubRequest(req, res) {
    const { userId, creatorId, subRequestId } = req.params;
    const { hasAccepted } = req.body;

    if (
        isNaN(Number(userId)) ||
        isNaN(Number(res.locals.userId)) ||
        isNaN(Number(creatorId)) ||
        isNaN(Number(subRequestId))
    ) {
        return res.status(400).json({
            error: `userId: "${userId}", res.locals.userId: "${res.locals.userId}", creatorId: "${creatorId}", ou subRequestId: "${subRequestId}" n'est pas valide.`,
        });
    }

    if (typeof hasAccepted !== "boolean") {
        return res.status(400).json({
            error: `Le champ "hasAccepted" doit être un booléen.`,
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({ error: "Non autorisé." });
    }

    let pool;
    try {
        pool = await getDbConnection();

        const subRequestCheck = await pool.request()
            .input("subRequestId", mssql.Int, subRequestId)
            .input("creatorId", mssql.Int, creatorId)
            .query(`
                SELECT SubRequestId
                FROM SubRequest
                WHERE SubRequestId = @subRequestId
                AND CreatorId = @creatorId
            `); 

        if (subRequestCheck.recordset.length === 0) {
            return res.status(404).json({ error: "Sous-demande non trouvée." });
        }

        if (hasAccepted) {
            await pool.request()
                .input("userId", mssql.Int, userId)
                .input("creatorId", mssql.Int, creatorId)
                .input("hasAccess", mssql.Bit, 1)
                .query(`
                    MERGE INTO Subscriber AS target
                    USING (SELECT @userId AS UserId, @creatorId AS CreatorId) AS source
                    ON (target.UserId = source.UserId AND target.CreatorId = source.CreatorId)
                    WHEN MATCHED THEN
                        UPDATE SET HasAccess = @hasAccess
                    WHEN NOT MATCHED THEN
                        INSERT (UserId, CreatorId, HasAccess)
                        VALUES (@userId, @creatorId, @hasAccess);
                `);
        }

        await pool.request()
            .input("subRequestId", mssql.Int, subRequestId)
            .query(`
                DELETE FROM SubRequest
                WHERE SubRequestId = @subRequestId
            `);

        res.status(200).json({
            message: hasAccepted
                ? "Sous-demande acceptée et abonné mis à jour ou créé."
                : "Sous-demande refusée et supprimée.",
        });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    } finally {
        if (pool) {
            pool.close();
        }
    }
}
