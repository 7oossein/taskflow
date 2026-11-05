
import jwt from "jsonwebtoken";
import { trouverUtilisateurParId } from "../models/auth.model.js";

export async function verifierToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            erreur: "Token manquant."
        });
    }

    const token = authorization.split(" ")[1];

    let decoded;

    // 1. Vérifier le JWT
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );
    } catch (erreur) {
        return res.status(401).json({
            erreur: "Token invalide ou expiré."
        });
    }

    // 2. Vérifier que l'ID est valide
    if (
        !decoded ||
        typeof decoded.id !== "number" ||
        !Number.isInteger(decoded.id) ||
        decoded.id <= 0
    ) {
        return res.status(401).json({
            erreur: "Token invalide."
        });
    }

    // 3. Vérifier que l'utilisateur existe toujours
    try {
        const utilisateur = await trouverUtilisateurParId(decoded.id);

        if (!utilisateur) {
            return res.status(401).json({
                erreur: "Compte utilisateur inexistant."
            });
        }

        req.utilisateurId = utilisateur.id;

        next();

    } catch (erreur) {
        next(erreur);
    }
}
