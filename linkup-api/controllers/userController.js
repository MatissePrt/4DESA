import mssql from "mssql";
import userSchema from "../models/user.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { getDbConnection } from "../config/db.js";
dotenv.config();

export async function register(req, res) {
  const { name, email, password } = req.body;

  // Valider les données d'entrée
  const { error } = userSchema.validate({ name, email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Hacher le mot de passe avant de le stocker
    const hashedPassword = await bcrypt.hash(password, 10); // Le "10" est le facteur de coût (sécurité)

    // const pool = await mssql.connect(dbConfig);

    const pool = await getDbConnection();

    const result = await pool.request()
      .input("name", mssql.VarChar, name)
      .input("email", mssql.VarChar, email)
      .input("password", mssql.VarChar, hashedPassword) // Utiliser le mot de passe haché
      .query(`
          INSERT INTO [User] (name, email, password)
          OUTPUT INSERTED.userId
          VALUES (@name, @email, @password)
        `);

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      userId: result.recordset[0].userId,
    });

    pool.close();
  } catch (err) {
    if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
      // Erreur de violation de contrainte UNIQUE (email déjà utilisé)
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}



export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const pool = await getDbConnection();

    if (!pool) {
      return res.status(400).json({ message: "Echec de la connexion à la base de données." })
    }

    // Vérifier si l'utilisateur existe
    const result = await pool.request()
      .input("email", mssql.VarChar, email)
      .query(`
        SELECT userId, name, password FROM [User] WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe invalide." });
    }

    const user = result.recordset[0];

    // Vérification du mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou mot de passe invalide." });
    }
    // REGARDER POUR REFAIRE LE TOKEN => STACK L'ID USER EN CLAIR
    // Générer un token JWT
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Connexion réussie.",
      token
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function update(req, res) {
  const { name, email } = req.body;
  const userId = res.locals.userId;
  if (!userId) {
    return res.status(401).json({ error: "Action non autorisée." });
  }
  // Valider les données d'entrée
  const { error } = userSchema.validate({ name, email});
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {

    const pool = await getDbConnection();

    const result = await pool.request()
      .input("name", mssql.VarChar, name)
      .input("email", mssql.VarChar, email)
      .query(`
          UPDATE [User] 
          SET name = @name, email = @email
          WHERE userId = @userId
        `);

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès.",
    });

    pool.close();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}