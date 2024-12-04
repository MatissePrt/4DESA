import express from "express";
import { create, readAll, readOne, deleteSubRequest } from "../controllers/subRequestController.js";
import { authentication } from "../middlewares/authentication.js";

const subRequestRouter = express.Router();

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subRequests:
 *   post:
 *     summary: Créer une nouvelle demande d'abonnement
 *     description: Crée une nouvelle demande d'abonnement pour un utilisateur spécifique.
 *     tags: [SubRequests]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur authentifié.
 *       - name: creatorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du créateur.
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       201:
 *         description: Demande d'abonnement créée avec succès.
 *       400:
 *         description: Paramètres invalides.
 *       403:
 *         description: Accès non autorisé.
 *       500:
 *         description: Erreur interne du serveur.
 */
subRequestRouter.post("/users/:userId/creators/:creatorId/subRequests", authentication, create);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subRequests:
 *   get:
 *     summary: Récupérer toutes les demandes d'abonnement
 *     description: Retourne toutes les demandes d'abonnement pour un créateur spécifique d'un utilisateur authentifié.
 *     tags: [SubRequests]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur authentifié.
 *       - name: creatorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du créateur.
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès, retourne la liste des demandes d'abonnement.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subRequestId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   creatorId:
 *                     type: integer
 *                   status:
 *                     type: string
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Créateur ou demandes d'abonnement non trouvés.
 *       500:
 *         description: Erreur interne du serveur.
 */
subRequestRouter.get("/users/:userId/creators/:creatorId/subRequests", authentication, readAll);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subRequests/{subRequestId}:
 *   get:
 *     summary: Récupérer une demande d'abonnement spécifique
 *     description: Retourne une demande d'abonnement spécifique pour un créateur et un utilisateur donnés.
 *     tags: [SubRequests]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur authentifié.
 *       - name: creatorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du créateur.
 *       - name: subRequestId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande d'abonnement.
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès, retourne la demande d'abonnement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subRequestId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 creatorId:
 *                   type: integer
 *                 status:
 *                   type: string
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Demande d'abonnement non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
subRequestRouter.get("/users/:userId/creators/:creatorId/subRequests/:subRequestId", authentication, readOne);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subRequests/{subRequestId}:
 *   delete:
 *     summary: Supprimer une demande d'abonnement
 *     description: Supprime une demande d'abonnement spécifique pour un créateur et un utilisateur donnés.
 *     tags: [SubRequests]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur authentifié.
 *       - name: creatorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du créateur.
 *       - name: subRequestId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande d'abonnement.
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès, demande d'abonnement supprimée.
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Demande d'abonnement non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
subRequestRouter.delete("/users/:userId/creators/:creatorId/subRequests/:subRequestId", authentication, deleteSubRequest);

export default subRequestRouter;
