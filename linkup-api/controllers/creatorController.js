import mssql from "mssql";
import creatorSchema from "../models/creator.js";
import { getDbConnection } from "../config/db.js";

export async function create(req, res) {

  const { userId } = req.params;

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

  const { isPublic } = req.body;

  const { error } = creatorSchema.validate({ userId, isPublic });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const pool = await getDbConnection();

    const existingCreator = await pool.request()
      .input("userId", mssql.Int, userId)
      .query(`SELECT * FROM [Creator] WHERE userId = @userId`);

    if (existingCreator.recordset.length > 0) {
      return res.status(409).json({
        error: "Un créateur existe déjà pour cet utilisateur."
      });
    }

    const result = await pool.request()
      .input("userId", mssql.Int, userId)
      .input("isPublic", mssql.Bit, isPublic)
      .query(`
          INSERT INTO [Creator] (userId, isPublic)
          OUTPUT INSERTED.creatorId
          VALUES (@userId, @isPublic)
        `);

    res.status(201).json({
      message: "Créateur créé avec succès.",
      creatorId: result.recordset[0].creatorId,
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function readOne(req, res) {
  const { userId, creatorId } = req.params;

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

  if (isNaN(Number(creatorId))) {
    return res.status(400).json({
      error: `creatorId: "${creatorId}" n'est pas un nombre adapté.`
    });
  }

  try {
    const pool = await getDbConnection();

    const result = await pool.request()
      .input("creatorId", mssql.Int, creatorId)
      .query(`
        SELECT c.CreatorId, u.Name AS UserName, c.IsPublic
        FROM Creator c JOIN [User] u ON c.UserId = u.UserId
        WHERE c.CreatorId = @creatorId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Créateur non trouvé."
      });
    }

    res.status(200).json({
      message: "Créateur trouvé avec succès.",
      creator: result.recordset[0]
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function readAll(req, res) {
  const { userId } = req.params;

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
      .query(`
        SELECT c.CreatorId, u.Name AS UserName, c.IsPublic
        FROM Creator c JOIN [User] u ON c.UserId = u.UserId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: "Créateur non trouvé."
      });
    }

    res.status(200).json({
      message: "Créateur trouvé avec succès.",
      creator: result.recordset
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function update(req, res) {
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

  const { isPublic } = req.body;

  const { error } = creatorSchema.validate({ userId, isPublic });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const pool = await getDbConnection();

    const result = await pool.request()
      .input("userId", mssql.Int, userId)
      .input("creatorId", mssql.Int, creatorId)
      .input("isPublic", mssql.Bit, isPublic)
      .query(`
        UPDATE Creator
        SET IsPublic = @isPublic
        WHERE CreatorId = @creatorId AND UserId = @userId;
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: "Créateur non trouvé ou aucune modification nécessaire."
      });
    }

    res.status(200).json({
      message: "Créateur mis à jour avec succès.",
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function deleteCreator(req, res) {
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

  try {
    const pool = await getDbConnection();

    await pool.request()
      .input("creatorId", mssql.Int, creatorId)
      .query(`
        DELETE FROM Subscriber
        WHERE CreatorId = @creatorId;
      `);

    await pool.request()
      .input("creatorId", mssql.Int, creatorId)
      .query(`
        DELETE FROM SubRequest
        WHERE CreatorId = @creatorId;
      `);

    const result = await pool.request()
      .input("userId", mssql.Int, userId)
      .input("creatorId", mssql.Int, creatorId)
      .query(`
        DELETE FROM Creator
        WHERE CreatorId = @creatorId AND UserId = @userId;
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: "Créateur non trouvé ou aucune suppression nécessaire."
      });
    }

    res.status(200).json({
      message: "Créateur supprimé avec succès.",
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}