import express from "express";
import { create, readOne, readAll, update, deleteCreator } from "../controllers/creatorController.js";
import { authentication } from "../middlewares/authentication.js";

const creatorRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Creator
 *     description: API pour gérer les créateurs.
 */

/**
 * @swagger
 * /api/users/{userId}/creators:
 *   post:
 *     summary: Crée un créateur pour un utilisateur donné.
 *     tags: [Creator]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID de l'utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Données du créateur à créer
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublic:
 *                 type: boolean
 *                 description: Statut de visibilité du créateur.
 *             required:
 *               - isPublic
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       201:
 *         description: Créateur créé avec succès.
 *       400:
 *         description: Erreur de validation des données.
 *       409:
 *         description: Un créateur existe déjà pour cet utilisateur.
 *       500:
 *         description: Erreur serveur.
 */
creatorRouter.post("/users/:userId/creators", authentication, create);

/**
 * @swagger
 * /api/users/{userId}/creators:
 *   get:
 *     summary: Récupère tous les créateurs pour un utilisateur donné.
 *     tags: [Creator]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID de l'utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des créateurs récupérée avec succès.
 *       404:
 *         description: Aucun créateur trouvé.
 *       500:
 *         description: Erreur serveur.
 */
creatorRouter.get("/users/:userId/creators", authentication, readAll);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}:
 *   get:
 *     summary: Récupère un créateur spécifique pour un utilisateur donné.
 *     tags: [Creator]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID de l'utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *       - name: creatorId
 *         in: path
 *         description: ID du créateur
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails du créateur récupérés avec succès.
 *       404:
 *         description: Créateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
creatorRouter.get("/users/:userId/creators/:creatorId", authentication, readOne);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}:
 *   put:
 *     summary: Met à jour un créateur pour un utilisateur donné.
 *     tags: [Creator]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID de l'utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *       - name: creatorId
 *         in: path
 *         description: ID du créateur
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Données du créateur à mettre à jour
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublic:
 *                 type: boolean
 *                 description: Statut de visibilité du créateur.
 *             required:
 *               - isPublic
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Créateur mis à jour avec succès.
 *       400:
 *         description: Erreur de validation des données.
 *       404:
 *         description: Créateur non trouvé ou aucune modification nécessaire.
 *       500:
 *         description: Erreur serveur.
 */
creatorRouter.put("/users/:userId/creators/:creatorId", authentication, update);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}:
 *   delete:
 *     summary: Supprime un créateur pour un utilisateur donné.
 *     tags: [Creator]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID de l'utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *       - name: creatorId
 *         in: path
 *         description: ID du créateur
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Créateur supprimé avec succès.
 *       404:
 *         description: Créateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
creatorRouter.delete("/users/:userId/creators/:creatorId", authentication, deleteCreator);

export default creatorRouter;
