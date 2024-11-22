import mssql from "mssql";
import creatorSchema from "../models/creator.js";
import dotenv from "dotenv";
import { getDbConnection } from "../config/db.js";
dotenv.config();

export async function createCreator(req, res) {

  const { userId } = req.params;

  // Vérification si userId et res.locals.userId sont des nombres
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

  // Valider les données d'entrée
  const { error } = creatorSchema.validate({ userId, isPublic });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const pool = await getDbConnection();

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