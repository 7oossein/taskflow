import pool from "../db.js";

export async function trouverUtilisateurParEmail(email) {
    const resultat = await pool.query(
        "SELECT * FROM utilisateurs WHERE email = $1",
        [email]
    );

    return resultat.rows[0];
}

export async function creerUtilisateur(nom, email, motDePasse) {
    const resultat = await pool.query(
        `INSERT INTO utilisateurs (nom, email, mot_de_passe)
         VALUES ($1, $2, $3)
         RETURNING id, nom, email, created_at`,
        [nom, email, motDePasse]
    );

    return resultat.rows[0];
}

export async function trouverUtilisateurParId(id) {
    const resultat = await pool.query(
        "SELECT id FROM utilisateurs WHERE id = $1",
        [id]
    );

    return resultat.rows[0];
}