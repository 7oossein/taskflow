import {
    trouverToutesLesTaches,
    trouverTacheParId,
    creerTache,
    modifierTache,
    supprimerTache,
    terminerTache,
    reactiverTache
} from "../models/taches.model.js";
import ErreurAPI from "../utils/ErreurAPI.js";

export async function obtenirToutesLesTaches(req, res) {
    
    const taches = await trouverToutesLesTaches(req.utilisateurId);
    res.json(taches);
}

export async function obtenirTacheParId(req, res) {
    const id = Number(req.params.id);
    
    if (!Number.isInteger(id) || id <= 0) {
        throw new ErreurAPI("Identifiant invalide.", 400);
    }
   
    const tache = await trouverTacheParId(id, req.utilisateurId);

    if (!tache) {
        throw new ErreurAPI("Tâche introuvable.", 404);
    }

    res.json(tache);   
}

export async function ajouterTache(req, res) {
    const texte = req.body?.texte;

    if (typeof texte !== "string" || texte.trim() === "") {
        throw new ErreurAPI("Le texte est obligatoire.", 400);
    }
 
    const resultat = await creerTache(texte.trim(), req.utilisateurId);

    res.status(201).json({
        message: "Tâche créée avec succès.",
        tache: resultat
    });

}

export async function changerTexteTache(req, res) {
    const id = Number(req.params.id);
    const nouveauTexte = req.body?.texte;

    if (!Number.isInteger(id) || id <= 0) {
        throw new ErreurAPI("Identifiant invalide.", 400);
    }

    if (typeof nouveauTexte !== "string" || nouveauTexte.trim() === "") {
        throw new ErreurAPI("Le texte est obligatoire.", 400);
    }

    const resultat = await modifierTache(id, nouveauTexte.trim(), req.utilisateurId);

    if (!resultat) {
        throw new ErreurAPI("Tâche introuvable.", 404);
    }

    res.json({
        message: "Tâche modifiée avec succès.",
        tache: resultat
    });
}

export async function effacerTache(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new ErreurAPI("Identifiant invalide.", 400);
    }

    const resultat = await supprimerTache(id, req.utilisateurId);

    if (!resultat) {
        throw new ErreurAPI("Tâche introuvable.", 404);
    }

    res.json({
        message: "Tâche supprimée avec succès.",
        tache: resultat
    });
}


export async function marquerTacheCommeTerminee(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new ErreurAPI("Identifiant invalide.", 400);
    }

    const resultat = await terminerTache(id, req.utilisateurId);

    if (resultat.statut === "introuvable") {
        throw new ErreurAPI("Tâche introuvable.", 404);
    }

    if (resultat.statut === "deja_terminee") {
        throw new ErreurAPI("Cette tâche est déjà terminée.", 400);
    }

    return res.json({
        message: "Tâche marquée comme terminée.",
        tache: resultat.tache
    });
}

export async function marquerTacheCommeReactive(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new ErreurAPI("Identifiant invalide.", 400);
    }

    const resultat = await reactiverTache(id, req.utilisateurId);

    if (resultat.statut === "introuvable") {
        throw new ErreurAPI("Tâche introuvable.", 404);
    }  

    if (resultat.statut === "deja_active") {
        throw new ErreurAPI("Cette tâche est déjà active.", 400);
    }

    return res.json({
        message: "Tâche réactivée avec succès.",
        tache: resultat.tache
    });
}
 