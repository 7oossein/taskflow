import pool from "../db.js";

export async function trouverToutesLesTaches(utilisateurId) {
    const resultat = await pool.query(
        "SELECT * FROM taches WHERE utilisateur_id = $1 ORDER BY id ASC",
        [utilisateurId]
    );

    return resultat.rows;
}

export async function trouverTacheParId(id, utilisateurId) {
    const resultat = await pool.query(
        "SELECT * FROM taches WHERE id = $1 AND utilisateur_id = $2",
        [id, utilisateurId]
    );

    return resultat.rows[0];
}

export async function creerTache(texte, utilisateurId) {
    const resultat = await pool.query(
        "INSERT INTO taches (texte, utilisateur_id) VALUES ($1, $2) RETURNING *",
        [texte, utilisateurId]
    );
    return resultat.rows[0];
}

export async function modifierTache(id, texte, utilisateurId) {
    const resultat = await pool.query(
        "UPDATE taches SET texte = $1 WHERE id = $2 AND utilisateur_id = $3 RETURNING *",
        [texte, id, utilisateurId]
    );
    return resultat.rows[0];
}

export async function supprimerTache(id, utilisateurId) {
    const resultat = await pool.query(
        "DELETE FROM taches WHERE id = $1 AND utilisateur_id = $2 RETURNING *",
        [id, utilisateurId]
    );
    return resultat.rows[0];
}

export async function terminerTache(id, utilisateurId) {
    const resultat = await pool.query(
        `UPDATE taches
         SET terminee = TRUE
         WHERE id = $1 AND utilisateur_id = $2 AND terminee = FALSE
         RETURNING *`,
        [id, utilisateurId]
    );

    if (resultat.rows.length > 0) {
        return {
            statut: "modifiee",
            tache: resultat.rows[0]
        };
    }

    const verification = await pool.query(
        "SELECT id FROM taches WHERE id = $1 AND utilisateur_id = $2",
        [id, utilisateurId]
    );

    if (verification.rows.length === 0) {
        return { statut: "introuvable" };
    }

    return { statut: "deja_terminee" };
}

export async function reactiverTache(id, utilisateurId) {
    const resultat = await pool.query(
        `UPDATE taches
         SET terminee = FALSE
         WHERE id = $1 AND utilisateur_id = $2 AND terminee = TRUE
         RETURNING *`,
        [id, utilisateurId]
    );

    if (resultat.rows.length > 0) {
        return {
            statut: "modifiee",
            tache: resultat.rows[0]
        };
    }

    const verification = await pool.query(
        "SELECT id FROM taches WHERE id = $1 AND utilisateur_id = $2",
        [id, utilisateurId]
    );

    if (verification.rows.length === 0) {
        return { statut: "introuvable" };
    }
    
    return { statut: "deja_active" };        
}
