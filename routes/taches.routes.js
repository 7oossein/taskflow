import express from "express";
import {
    obtenirToutesLesTaches,
    obtenirTacheParId,
    ajouterTache,
    changerTexteTache,
    effacerTache,
    marquerTacheCommeTerminee,
    marquerTacheCommeReactive
} from "../controllers/taches.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import {verifierToken} from "../middlewares/auth.middleware.js";

const router = express.Router();
/**
 * @swagger
 * security:
 *   - bearerAuth: []
 */
router.use(verifierToken);

/**
 * @swagger
 * /taches:
 *   get:
 *     summary: Récupérer toutes les tâches de l'utilisateur connecté
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   texte:
 *                     type: string
 *                     example: Réviser JavaScript
 *                   terminee:
 *                     type: boolean
 *                     example: false
 *                   utilisateur_id:
 *                     type: integer
 *                     example: 1
 *       401:
 *         description: Token manquant, invalide ou expiré
 */

router.get("/", asyncHandler(obtenirToutesLesTaches));

/**
 * @swagger
 * /taches/{id}:
 *   get:
 *     summary: Récupérer une tâche par son identifiant
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de la tâche
 *     responses:
 *       200:
 *         description: Tâche récupérée avec succès
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Tâche introuvable
 */

router.get("/:id", asyncHandler(obtenirTacheParId));

/**
 * @swagger
 * /taches:
 *   post:
 *     summary: Ajouter une nouvelle tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texte
 *             properties:
 *               texte:
 *                 type: string
 *                 example: Réviser PostgreSQL
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *       400:
 *         description: Texte obligatoire
 *       401:
 *         description: Token manquant ou invalide
 *       409:
 *         description: Une tâche avec ce texte existe déjà
 */

router.post("/", asyncHandler(ajouterTache));

/**
 * @swagger
 * /taches/{id}:
 *   put:
 *     summary: Modifier une tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de la tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texte
 *             properties:
 *               texte:
 *                 type: string
 *                 example: Réviser Node.js
 *     responses:
 *       200:
 *         description: Tâche modifiée avec succès
 *       400:
 *         description: Texte obligatoire ou identifiant invalide
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Tâche introuvable
 */

router.put("/:id", asyncHandler(changerTexteTache));

/**
 * @swagger
 * /taches/{id}:
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de la tâche à supprimer
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Tâche introuvable
 */

router.delete("/:id", asyncHandler(effacerTache));

/**
 * @swagger
 * /taches/{id}/terminer:
 *   patch:
 *     summary: Marquer une tâche comme terminée
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de la tâche
 *     responses:
 *       200:
 *         description: Tâche marquée comme terminée
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Tâche introuvable
 *       409:
 *         description: Tâche déjà terminée
 */

router.patch("/:id/terminer", asyncHandler(marquerTacheCommeTerminee));

/**
 * @swagger
 * /taches/{id}/reactiver:
 *   patch:
 *     summary: Réactiver une tâche
 *     tags: [Tâches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de la tâche
 *     responses:
 *       200:
 *         description: Tâche réactivée
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Tâche introuvable
 *       409:
 *         description: Tâche déjà active
 */

router.patch("/:id/reactiver", asyncHandler(marquerTacheCommeReactive));

export default router;