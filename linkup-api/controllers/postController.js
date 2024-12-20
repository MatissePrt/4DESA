import mssql from "mssql";
import postSchema from "../models/post.js";
import { getDbConnection } from "../config/db.js";
import { blobServiceClient } from "../config/blobStorage.js";
import { v4 as uuidv4 } from "uuid"; 
import path from "path";

export async function create(req, res) {

    const { userId, creatorId } = req.params;
    let { type, content, blobUrl } = req.body;


    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId))) {
        return res.status(400).json({
            error: `userId: "${userId}" et/ou res.locals.userId: "${res.locals.userId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403)
            .json({
                error: `Non autorisé.`
            })
    }


    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .input("userId", mssql.Int, userId)
            .query(`
        SELECT c.CreatorId
        FROM Creator c
        WHERE c.CreatorId = @creatorId AND c.UserId = @userId
      `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: "Créateur non trouvé."
            });
        }

        pool.close();
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }


    if (type === "image" || type === "video") {
        if (!req.file) {
            return res.status(400).json({ error: "Fichier manquant." });
        }

        try {
            const containerName = "media";
            const containerClient = blobServiceClient.getContainerClient(containerName);

            const fileExtension = path.extname(req.file.originalname);
            const blobName = `${uuidv4()}${fileExtension}`;


            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(req.file.buffer, req.file.size, {
                blobHTTPHeaders: {
                    blobContentType: req.file.mimetype 
                }
            });

            blobUrl = blockBlobClient.url;

            console.log("Fichier uploadé :", blobUrl);
        } catch (err) {
            console.error("Erreur lors de l'upload sur Azure Blob Storage :", err);
            return res.status(500).json({ error: "Erreur lors de l'upload du fichier.", err });
        }
    } else if (type === "text") {
        if (blobUrl) {
            return res.status(400).json({ error: "Le champ 'blobUrl' n'est pas requis pour le type 'text'.", err });
        }
        if (!content) {
            return res.status(400).json({ error: "Le champ 'content' est requis pour le type 'text'.", err});
        }
        blobUrl = null;
    }

    const { error } = postSchema.validate({ creatorId, type, content, blobUrl });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }



    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .input("type", mssql.VarChar, type)
            .input("content", mssql.VarChar, content)
            .input("blobUrl", mssql.VarChar, blobUrl)
            .query(`
        INSERT INTO Post (CreatorId, Type, Content, BlobUrl)
        OUTPUT INSERTED.PostId
        VALUES (@creatorId, @type, @content, @blobUrl)
      `);

        res.status(201).json({
            message: "Post créé avec succès.",
            postId: result.recordset[0].PostId,
        });

        pool.close();
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }


}

export async function readOne(req, res) {
    const { userId, creatorId, postId } = req.params;
    let isReadible = false;


    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId))) {
        return res.status(400).json({
            error: `userId: "${userId}" et/ou res.locals.userId: "${res.locals.userId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403)
            .json({
                error: `Non autorisé.`
            })
    }


    if (isNaN(Number(postId))) {
        return res.status(400).json({
            error: `postId: "${postId}" n'est pas un nombre adapté.`
        });
    }


    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
            SELECT c.IsPublic
            FROM Creator c
            WHERE c.CreatorId = @creatorId
          `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: "Créateur non trouvé."
            });
        }

        const creator = result.recordset[0];

        if (creator.IsPublic) {
            isReadible = true;
        }
        else {
            console.error("Le créateur n'est pas public.");
        }

        pool.close();
    }
    catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }




    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("userId", mssql.Int, userId)
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT s.SubscriberId
        FROM Subscriber s
        WHERE s.UserId = @userId AND s.CreatorId = @creatorId AND s.HasAccess = 1
      `);

        if (result.recordset.length > 0) {
            isReadible = true;
        } else {
            console.error("Le requeteur n'est pas abonné au créateur.");
        }

        pool.close();
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }

    if (isReadible) {
        try {
            const pool = await getDbConnection();

            const result = await pool.request()
                .input("postId", mssql.Int, postId)
                .query(`
            SELECT p.PostId, p.CreatorId, p.Type, p.Content, p.BlobUrl, p.CreatedAt, p.UpdatedAt
            FROM Post p
            WHERE p.PostId = @postId
        `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    error: "Post non trouvé."
                });
            }

            const post = result.recordset[0];

            res.json(post);

            pool.close();
        } catch (err) {
            console.error("Database error:", err);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }


}


export async function readAll(req, res) {
    const { userId, creatorId } = req.params;
    let isReadible = false;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId))) {
        return res.status(400).json({
            error: `userId: "${userId}" et/ou res.locals.userId: "${res.locals.userId}" ne sont pas des nombres adaptés.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({
            error: `Non autorisé.`
        });
    }

    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT c.IsPublic
        FROM Creator c
        WHERE c.CreatorId = @creatorId
      `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: "Créateur non trouvé."
            });
        }

        const creator = result.recordset[0];

        if (creator.IsPublic) {
            isReadible = true;
        }
        else {
            console.error("Le créateur n'est pas public.");
        }

        pool.close();
    }
    catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }

    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("userId", mssql.Int, userId)
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT s.SubscriberId
        FROM Subscriber s
        WHERE s.UserId = @userId AND s.CreatorId = @creatorId AND s.HasAccess = 1
      `);

        if (result.recordset.length > 0) {
            isReadible = true;
        } else {
            console.error("Le requeteur n'est pas abonné au créateur.");
        }

        pool.close();
    }
    catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }


    if (isReadible) {
        try {
            const pool = await getDbConnection();

            const result = await pool.request()
                .input("creatorId", mssql.Int, creatorId)
                .query(`
            SELECT p.PostId, p.CreatorId, p.Type, p.Content, p.BlobUrl, p.CreatedAt, p.UpdatedAt
            FROM Post p
            WHERE p.CreatorId = @creatorId
        `);

            res.json(result.recordset);

            pool.close();
        } catch (err) {
            console.error("Database error:", err);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
}

export async function deleteOne(req, res) {
    const { userId, creatorId, postId } = req.params;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId))) {
        return res.status(400).json({
            error: `userId: "${userId}" et/ou res.locals.userId: "${res.locals.userId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({ error: "Non autorisé." });
    }

    if (isNaN(Number(postId))) {
        return res.status(400).json({
            error: `postId: "${postId}" n'est pas un nombre adapté.`
        });
    }

    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input("postId", mssql.Int, postId)
            .query(`SELECT p.BlobUrl FROM Post p WHERE p.PostId = @postId`);

        if (result.recordset.length === 0) {
            pool.close();
            return res.status(404).json({ error: "Post non trouvé." });
        }

        const post = result.recordset[0];
        if (post.BlobUrl) {
            const containerName = "media";
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobName = path.basename(post.BlobUrl);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.delete();
        }
        pool.close();

        const poolDelete = await getDbConnection();
        const deleteResult = await poolDelete.request()
            .input("postId", mssql.Int, postId)
            .query(`DELETE FROM Post WHERE PostId = @postId`);

        poolDelete.close();

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Post non trouvé." });
        }

        return res.json({ message: "Post et media associé (si existant) supprimés avec succès." });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
}

export async function deleteAll(req, res) {
    const { userId, creatorId } = req.params;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId))) {
        return res.status(400).json({
            error: `userId: "${userId}" et/ou res.locals.userId: "${res.locals.userId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({ error: "Non autorisé." });
    }

    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`
        SELECT p.BlobUrl
        FROM Post p
        WHERE p.CreatorId = @creatorId
      `);

        const containerName = "media";
        const containerClient = blobServiceClient.getContainerClient(containerName);

        for (const post of result.recordset) {
            if (post.BlobUrl) {
                const blobName = path.basename(post.BlobUrl);
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.delete();
            }
        }

        pool.close();

        const poolDelete = await getDbConnection();
        const deleteResult = await poolDelete.request()
            .input("creatorId", mssql.Int, creatorId)
            .query(`DELETE FROM Post WHERE CreatorId = @creatorId`);

        poolDelete.close();

        return res.json({ message: "Posts et médias associés supprimés avec succès." });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
}

export async function update(req, res) {
    const { userId, creatorId, postId } = req.params;
    let { type, content, blobUrl } = req.body;

    if (isNaN(Number(userId)) || isNaN(Number(res.locals.userId))) {
        return res.status(400).json({
            error: `userId: "${userId}" et/ou res.locals.userId: "${res.locals.userId}" n'est pas un nombre adapté.`
        });
    }

    if (Number(userId) !== Number(res.locals.userId)) {
        return res.status(403).json({ error: "Non autorisé." });
    }

    if (isNaN(Number(postId))) {
        return res.status(400).json({
            error: `postId: "${postId}" n'est pas un nombre adapté.`
        });
    }

    if (type === "text") {
        if (blobUrl) {
            return res.status(400).json({ error: "Le champ 'blobUrl' n'est pas requis pour le type 'text'." });
        }
        if (!content) {
            return res.status(400).json({ error: "Le champ 'content' est requis pour le type 'text'." });
        }
        blobUrl = null;
    } else if (type === "image" || type === "video") {
        if (!req.file) {
            return res.status(400).json({ error: "Fichier manquant." });
        }

        try {
            const containerName = "media";
            const containerClient = blobServiceClient.getContainerClient(containerName);

            const fileExtension = path.extname(req.file.originalname);
            const blobName = `${uuidv4()}${fileExtension}`;

            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(req.file.buffer, req.file.size, {
                blobHTTPHeaders: {
                    blobContentType: req.file.mimetype
                }
            });

            blobUrl = blockBlobClient.url;

            console.log("Fichier uploadé :", blobUrl);
        } catch (err) {
            console.error("Erreur lors de l'upload sur Azure Blob Storage :", err);
            return res.status(500).json({ error: "Erreur lors de l'upload du fichier." });
        }
    }

    const { error } = postSchema.validate({ creatorId, type, content, blobUrl });
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }

    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .input("postId", mssql.Int, postId)
            .query(`
        SELECT p.BlobUrl
        FROM Post p
        WHERE p.PostId = @postId AND p.CreatorId = @creatorId
      `);

        if (result.recordset.length === 0) {
            pool.close();
            return res.status(404).json({ error: "Post non trouvé." });
        }

        const post = result.recordset[0];

        if (post.BlobUrl) {
            const containerName = "media";
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobName = path.basename(post.BlobUrl);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.delete();
        }

        pool.close();
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }

    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input("creatorId", mssql.Int, creatorId)
            .input("postId", mssql.Int, postId)
            .input("type", mssql.VarChar, type)
            .input("content", mssql.VarChar, content)
            .input("blobUrl", mssql.VarChar, blobUrl)
            .query(`
        UPDATE Post
        SET Type = @type, Content = @content, BlobUrl = @blobUrl
        WHERE PostId = @postId AND CreatorId = @creatorId
      `);

        pool.close();

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Post non trouvé." });
        }

        return res.json({ message: "Post mis à jour avec succès." });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
}