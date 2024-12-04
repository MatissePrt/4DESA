import express from "express";
import { readAll, readOne, deleteSubscriber } from "../controllers/subscriberController.js";
import { authentication } from "../middlewares/authentication.js";

const subscriberRouter = express.Router();

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subscribers:
 *   get:
 *     summary: Récupérer tous les abonnés d'un créateur
 *     description: Retourne une liste des abonnés d'un créateur spécifique pour un utilisateur authentifié.
 *     tags: [Subscribers]
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
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   SubscriberId:
 *                     type: integer
 *                   SubscriberName:
 *                     type: string
 *                   SubscriberEmail:
 *                     type: string
 *                   HasAccess:
 *                     type: boolean
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Créateur ou abonnés non trouvés.
 *       500:
 *         description: Erreur interne du serveur.
 */
subscriberRouter.get("/users/:userId/creators/:creatorId/subscribers", authentication, readAll);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subscribers/{subcriberId}:
 *   get:
 *     summary: Récupérer un abonné spécifique
 *     description: Retourne les informations d'un abonné spécifique pour un créateur donné.
 *     tags: [Subscribers]
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
 *       - name: subcriberId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'abonné.
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 SubscriberId:
 *                   type: integer
 *                 SubscriberName:
 *                   type: string
 *                 SubscriberEmail:
 *                   type: string
 *                 HasAccess:
 *                   type: boolean
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Abonné non trouvé.
 *       500:
 *         description: Erreur interne du serveur.
 *   delete:
 *     summary: Supprimer un abonné
 *     description: Supprime un abonné spécifique pour un créateur donné.
 *     tags: [Subscribers]
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
 *       - name: subcriberId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'abonné.
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Succès, abonné supprimé.
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Abonné non trouvé.
 *       500:
 *         description: Erreur interne du serveur.
 */
subscriberRouter.get("/users/:userId/creators/:creatorId/subscribers/:subcriberId", authentication, readOne);

/**
 * @swagger
 * /api/users/{userId}/creators/{creatorId}/subscribers/{subcriberId}:
 *   delete:
 *     summary: Supprimer un abonné
 *     description: Supprime un abonné spécifique pour un créateur donné.
 *     tags: [Subscribers]
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
 *       - name: subcriberId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'abonné.
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Succès, abonné supprimé.
 *       403:
 *         description: Accès non autorisé.
 *       404:
 *         description: Abonné non trouvé.
 *       500:
 *         description: Erreur interne du serveur.
 */
subscriberRouter.delete("/users/:userId/creators/:creatorId/subscribers/:subcriberId", authentication, deleteSubscriber);

export default subscriberRouter;
