import express from "express";
import { inscription,
        connexion
} from "../controllers/auth.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * @swagger
 * /auth/inscription:
 *   post:
 *     summary: Créer un nouveau compte
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - motDePasse
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Houssein
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               motDePasse:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       400:
 *         description: Champs obligatoires manquants
 *       409:
 *         description: Email déjà utilisé
 */

router.post("/inscription", asyncHandler(inscription));

/**
 * @swagger
 * /auth/connexion:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - motDePasse
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               motDePasse:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie, token JWT retourné
 *       400:
 *         description: Champs obligatoires manquants
 *       401:
 *         description: Email ou mot de passe incorrect
 */

router.post("/connexion", asyncHandler(connexion));

export default router;