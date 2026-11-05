import bcrypt from "bcrypt";
import {
  trouverUtilisateurParEmail,
  creerUtilisateur,
} from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import ErreurAPI from "../utils/ErreurAPI.js";

export async function inscription(req, res, next) {
  const { nom, email, motDePasse } = req.body;

  if (!nom || !email || !motDePasse) {
    throw new ErreurAPI("Tous les champs sont obligatoires.", 400);
  }

  const utilisateurExistant = await trouverUtilisateurParEmail(email);

  if (utilisateurExistant) {
    throw new ErreurAPI("Cet email est déjà utilisé.", 409);
  }

  const motDePasseHache = await bcrypt.hash(motDePasse, 10);

  const utilisateur = await creerUtilisateur(nom, email, motDePasseHache);

  return res.status(201).json({
    message: "Compte créé avec succès.",
    utilisateur,
  });
}

export async function connexion(req, res, next) {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    throw new ErreurAPI("Email et mot de passe obligatoires.", 400);
  }

  const utilisateur = await trouverUtilisateurParEmail(email);

  if (!utilisateur) {
    throw new ErreurAPI("Email ou mot de passe incorrect.", 401);
  }

  const valide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);

  if (!valide) {
    throw new ErreurAPI("Email ou mot de passe incorrect.", 401);
  }

  const token = jwt.sign(
    { id: utilisateur.id, email: utilisateur.email, nom: utilisateur.nom },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return res.status(200).json({
    message: "Connexion réussie.",
    token,
    utilisateur: {
      id: utilisateur.id,
      nom: utilisateur.nom,
      email: utilisateur.email,
    },
  });
}
