
import request from "supertest";
import app from "../app.js";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("API d'authentification", () => {

    beforeEach(async () => {
        // Nettoyer les utilisateurs de la base de test
        // ON DELETE CASCADE supprime aussi leurs tâches
        await pool.query("DELETE FROM utilisateurs");
    });

    afterAll(async () => {
        await pool.end();
    });

    // INSCRIPTION

    test("POST /auth/inscription doit créer un compte", async () => {
        const reponse = await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                email: "inscription@example.com",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(201);
        expect(reponse.body.message).toBe("Compte créé avec succès.");
        expect(reponse.body.utilisateur).toHaveProperty("id");
        expect(reponse.body.utilisateur.email)
            .toBe("inscription@example.com");

        // Le mot de passe ne doit pas être retourné
        expect(reponse.body.utilisateur)
            .not.toHaveProperty("mot_de_passe");
    });

    test("POST /auth/inscription doit hacher le mot de passe", async () => {
        await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                email: "hash@example.com",
                motDePasse: "password123"
            });

        const resultat = await pool.query(
            "SELECT mot_de_passe FROM utilisateurs WHERE email = $1",
            ["hash@example.com"]
        );

        const motDePasseHache = resultat.rows[0].mot_de_passe;

        expect(motDePasseHache).not.toBe("password123");

        const valide = await bcrypt.compare(
            "password123",
            motDePasseHache
        );

        expect(valide).toBe(true);
    });

    test("POST /auth/inscription doit refuser les champs manquants", async () => {
        const reponse = await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                email: "incomplet@example.com"
            });

        expect(reponse.status).toBe(400);
        expect(reponse.body.erreur)
            .toBe("Tous les champs sont obligatoires.");
    });

    test("POST /auth/inscription doit refuser un nom manquant", async () => {
        const reponse = await request(app)
            .post("/auth/inscription")
            .send({
                email: "nom@example.com",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(400);
    });

    test("POST /auth/inscription doit refuser un email manquant", async () => {
        const reponse = await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(400);
    });

    test("POST /auth/inscription doit refuser un email déjà utilisé", async () => {
        const donnees = {
            nom: "Test",
            email: "doublon@example.com",
            motDePasse: "password123"
        };

        await request(app)
            .post("/auth/inscription")
            .send(donnees);

        const reponse = await request(app)
            .post("/auth/inscription")
            .send(donnees);

        expect(reponse.status).toBe(409);
        expect(reponse.body.erreur)
            .toBe("Cet email est déjà utilisé.");
    });

    // CONNEXION

    test("POST /auth/connexion doit connecter un utilisateur", async () => {
        await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                email: "connexion@example.com",
                motDePasse: "password123"
            });

        const reponse = await request(app)
            .post("/auth/connexion")
            .send({
                email: "connexion@example.com",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(200);
        expect(reponse.body.message).toBe("Connexion réussie.");
        expect(reponse.body).toHaveProperty("token");

        expect(reponse.body.utilisateur.email)
            .toBe("connexion@example.com");

        // Vérifier le contenu et la validité du JWT
        const decoded = jwt.verify(
            reponse.body.token,
            process.env.JWT_SECRET
        );

        expect(decoded).toHaveProperty("id");
        expect(decoded.email).toBe("connexion@example.com");
    });

    test("POST /auth/connexion doit refuser un mot de passe incorrect", async () => {
        await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                email: "mauvais@example.com",
                motDePasse: "password123"
            });

        const reponse = await request(app)
            .post("/auth/connexion")
            .send({
                email: "mauvais@example.com",
                motDePasse: "mauvais-mot-de-passe"
            });

        expect(reponse.status).toBe(401);
        expect(reponse.body.erreur)
            .toBe("Email ou mot de passe incorrect.");
    });

    test("POST /auth/connexion doit refuser un email inexistant", async () => {
        const reponse = await request(app)
            .post("/auth/connexion")
            .send({
                email: "inexistant@example.com",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(401);
        expect(reponse.body.erreur)
            .toBe("Email ou mot de passe incorrect.");
    });

    test("POST /auth/connexion doit refuser les champs manquants", async () => {
        const reponse = await request(app)
            .post("/auth/connexion")
            .send({
                email: "test@example.com"
            });

        expect(reponse.status).toBe(400);
        expect(reponse.body.erreur)
            .toBe("Email et mot de passe obligatoires.");
    });

});
