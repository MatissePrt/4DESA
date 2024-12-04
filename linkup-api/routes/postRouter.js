import express from 'express';
import multer from 'multer';
import { create, readOne, readAll, update, deleteOne, deleteAll } from '../controllers/postController.js';

const upload = multer(); // Initialisation de multer sans configuration particulière (ajusté selon les besoins)

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Post
 *     description: API pour gérer les posts.
 */

/**
 * @swagger
 * /posts/{userId}/{creatorId}:
 *   post:
 *     summary: Crée un post pour un créateur donné avec la possibilité d'ajouter un fichier multimédia.
 *     tags: [Post]
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
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     requestBody:
 *       description: Données nécessaires pour créer un post, incluant un fichier multimédia.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Le type de post (image, vidéo, texte).
 *                 required: true
 *                 enum: [image, video, text]
 *                 default: text
 *                 example: "image"
 *               content:
 *                 type: string
 *                 description: Le contenu textuel du post (optionnel si le type est autre que 'texte').
 *                 nullable: true
 *                 default: ""
 *                 example: "Voici une belle image !"
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Fichier multimédia à associer au post (optionnel si le type est 'texte').
 *                 example: "image.jpg"
 *             required:
 *               - type
 *     responses:
 *       201:
 *         description: Post créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post créé avec succès."
 *                 postId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Erreur de validation des données (par exemple, type de fichier non valide ou champ requis manquant).
 *       500:
 *         description: Erreur interne du serveur.
 */



router.post('/:userId/:creatorId', upload.single('media'), create);


/**
 * @swagger
 * /posts/{userId}/{creatorId}/{postId}:
 *   get:
 *     summary: Récupère un post spécifique pour un créateur donné.
 *     tags: [Post]
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
 *       - name: postId
 *         in: path
 *         description: ID du post
 *         required: true
 *         schema:
 *           type: integer
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Détails du post récupérés avec succès.
 *       404:
 *         description: Post non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/:userId/:creatorId/:postId', readOne);

/**
 * @swagger
 * /posts/{userId}/{creatorId}:
 *   get:
 *     summary: Récupère tous les posts pour un créateur donné.
 *     tags: [Post]
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
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Liste des posts récupérés avec succès.
 *       404:
 *         description: Aucun post trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/:userId/:creatorId', readAll);

/**
 * @swagger
 * /posts/{userId}/{creatorId}/{postId}:
 *   put:
 *     summary: Met à jour un post pour un créateur donné.
 *     tags: [Post]
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
 *       - name: postId
 *         in: path
 *         description: ID du post
 *         required: true
 *         schema:
 *           type: integer
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     requestBody:
 *       description: Données du post à mettre à jour
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Le type de post (image, video, text).
 *                 required: true
 *                 enum: [image, video, text]
 *                 default: text
 *               content:
 *                 type: string
 *                 description: Le contenu du post (facultatif si le type est autre que 'text').
 *                 example: "Voici une belle image mise à jour !"
 *                 default: ""
 *                 nullable: true
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Fichier multimédia (facultatif, utilisé si type est 'image' ou 'vidéo').
 *             required:
 *               - type
 *     responses:
 *       200:
 *         description: Post mis à jour avec succès.
 *       400:
 *         description: Erreur de validation des données.
 *       404:
 *         description: Post non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.put('/:userId/:creatorId/:postId', upload.single('media'), update);


/**
 * @swagger
 * /posts/{userId}/{creatorId}/{postId}:
 *   delete:
 *     summary: Supprime un post spécifique.
 *     tags: [Post]
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
 *       - name: postId
 *         in: path
 *         description: ID du post
 *         required: true
 *         schema:
 *           type: integer
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Post supprimé avec succès.
 *       404:
 *         description: Post non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.delete('/:userId/:creatorId/:postId', deleteOne);

/**
 * @swagger
 * /posts/{userId}/{creatorId}:
 *   delete:
 *     summary: Supprime tous les posts pour un créateur donné.
 *     tags: [Post]
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
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT pour l'authentification.
 *     responses:
 *       200:
 *         description: Tous les posts supprimés avec succès.
 *       500:
 *         description: Erreur serveur.
 */
router.delete('/:userId/:creatorId', deleteAll);

export default router;