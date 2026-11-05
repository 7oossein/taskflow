
import request from "supertest";
import app, { gestionnaireErreurs } from "../app.js";
import pool from "../db.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

describe("API des tâches", () => {
    let token;
    let utilisateurId;

    const api = {
        get: (url) => request(app).get(url)
            .set("Authorization", `Bearer ${token}`),
        post: (url) => request(app).post(url)
            .set("Authorization", `Bearer ${token}`),
        put: (url) => request(app).put(url)
            .set("Authorization", `Bearer ${token}`),
        patch: (url) => request(app).patch(url)
            .set("Authorization", `Bearer ${token}`),
        delete: (url) => request(app).delete(url)
            .set("Authorization", `Bearer ${token}`)
    };

    beforeEach(async () => {
        await pool.query("DELETE FROM utilisateurs");

        const resultat = await pool.query(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe)
             VALUES ($1, $2, $3)
             RETURNING id`,
            ["Test", "test@example.com", "mot-de-passe-test"]
        );

        utilisateurId = resultat.rows[0].id;

        token = jwt.sign(
            { id: utilisateurId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    });

    afterAll(async () => {
        await pool.end();
    });

    // AUTHENTIFICATION

    test("GET /taches doit refuser un token absent", async () => {
        const reponse = await request(app).get("/taches");

        expect(reponse.status).toBe(401);
        expect(reponse.body.erreur).toBe("Token manquant.");
    });

    test("GET /taches doit refuser un token invalide", async () => {
        const reponse = await request(app)
            .get("/taches")
            .set("Authorization", "Bearer faux-token");

        expect(reponse.status).toBe(401);
        expect(reponse.body.erreur).toBe("Token invalide ou expiré.");
    });

    test("GET /taches doit refuser un token expiré", async () => {
        const tokenExpire = jwt.sign(
            { id: utilisateurId },
            process.env.JWT_SECRET,
            { expiresIn: "-1s" }
        );

        const reponse = await request(app)
            .get("/taches")
            .set("Authorization", `Bearer ${tokenExpire}`);

        expect(reponse.status).toBe(401);
    });

    // CRÉATION

    test("POST /taches doit créer une tâche", async () => {
        const texte = `Tâche ${Date.now()}`;

        const reponse = await api.post("/taches").send({ texte });

        expect(reponse.status).toBe(201);
        expect(reponse.body.tache.texte).toBe(texte);
        expect(reponse.body.tache.utilisateur_id).toBe(utilisateurId);
    });

    test("POST /taches doit refuser un texte vide", async () => {
        const reponse = await api.post("/taches")
            .send({ texte: "   " });

        expect(reponse.status).toBe(400);
        expect(reponse.body).toHaveProperty("erreur");
    });

    test("POST /taches doit refuser une tâche en doublon", async () => {
        const texte = `Doublon ${Date.now()}`;

        await api.post("/taches").send({ texte });

        const reponse = await api.post("/taches").send({ texte });

        expect(reponse.status).toBe(409);
    });

    // LECTURE

    test("GET /taches doit retourner les tâches de l'utilisateur", async () => {
        await api.post("/taches")
            .send({ texte: "Tâche de lecture" });

        const reponse = await api.get("/taches");

        expect(reponse.status).toBe(200);
        expect(Array.isArray(reponse.body)).toBe(true);
        expect(reponse.body).toHaveLength(1);
    });

    test("GET /taches/:id doit retourner une tâche", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche à rechercher" });

        const id = creation.body.tache.id;

        const reponse = await api.get(`/taches/${id}`);

        expect(reponse.status).toBe(200);
        expect(reponse.body.texte).toBe("Tâche à rechercher");
    });

    test("GET /taches/:id doit retourner 404 si la tâche n'existe pas", async () => {
        const reponse = await api.get("/taches/999999");

        expect(reponse.status).toBe(404);
    });

    test("GET /taches/:id doit refuser un identifiant invalide", async () => {
        const reponse = await api.get("/taches/abc");

        expect(reponse.status).toBe(400);
    });

    // MODIFICATION

    test("PUT /taches/:id doit modifier une tâche", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Ancienne tâche" });

        const id = creation.body.tache.id;

        const reponse = await api.put(`/taches/${id}`)
            .send({ texte: "Nouvelle tâche" });

        expect(reponse.status).toBe(200);
        expect(reponse.body.tache.texte).toBe("Nouvelle tâche");
    });

    test("PUT /taches/:id doit refuser un texte vide", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Ancienne tâche" });

        const reponse = await api.put(
            `/taches/${creation.body.tache.id}`
        ).send({ texte: "   " });

        expect(reponse.status).toBe(400);
        expect(reponse.body.erreur).toBe("Le texte est obligatoire.");
    });

    test("PUT /taches/:id doit refuser un identifiant invalide", async () => {
        const reponse = await api.put("/taches/abc")
            .send({ texte: "Nouvelle tâche" });

        expect(reponse.status).toBe(400);
    });

    test("PUT /taches/:id doit retourner 404 si la tâche n'existe pas", async () => {
        const reponse = await api.put("/taches/999999")
            .send({ texte: "Nouvelle tâche" });

        expect(reponse.status).toBe(404);
    });

    // SUPPRESSION

    test("DELETE /taches/:id doit supprimer une tâche", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche à supprimer" });

        const id = creation.body.tache.id;

        const reponse = await api.delete(`/taches/${id}`);

        expect(reponse.status).toBe(200);

        const recherche = await api.get(`/taches/${id}`);

        expect(recherche.status).toBe(404);
    });

    test("DELETE /taches/:id doit refuser un identifiant invalide", async () => {
        const reponse = await api.delete("/taches/abc");

        expect(reponse.status).toBe(400);
    });

    test("DELETE /taches/:id doit retourner 404 si la tâche n'existe pas", async () => {
        const reponse = await api.delete("/taches/999999");

        expect(reponse.status).toBe(404);
    });

    // TERMINER UNE TÂCHE

    test("PATCH /taches/:id/terminer doit terminer une tâche", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche à terminer" });

        const id = creation.body.tache.id;

        const reponse = await api.patch(`/taches/${id}/terminer`);

        expect(reponse.status).toBe(200);
        expect(reponse.body.tache.terminee).toBe(true);
    });

    test("PATCH /taches/:id/terminer doit détecter une tâche déjà terminée", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche déjà terminée" });

        const id = creation.body.tache.id;

        await api.patch(`/taches/${id}/terminer`);

        const reponse = await api.patch(`/taches/${id}/terminer`);

        expect(reponse.status).toBe(400);
    });

    test("PATCH /taches/:id/terminer doit retourner 404 si la tâche n'existe pas", async () => {
        const reponse = await api.patch("/taches/999999/terminer");

        expect(reponse.status).toBe(404);
    });

    test("PATCH /taches/:id/terminer doit refuser un identifiant invalide", async () => {
        const reponse = await api.patch("/taches/abc/terminer");

        expect(reponse.status).toBe(400);
    });

    // RÉACTIVER UNE TÂCHE

    test("PATCH /taches/:id/reactiver doit réactiver une tâche", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche à réactiver" });

        const id = creation.body.tache.id;

        await api.patch(`/taches/${id}/terminer`);

        const reponse = await api.patch(`/taches/${id}/reactiver`);

        expect(reponse.status).toBe(200);
        expect(reponse.body.tache.terminee).toBe(false);
    });

    test("PATCH /taches/:id/reactiver doit détecter une tâche déjà active", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche déjà active" });

        const id = creation.body.tache.id;

        const reponse = await api.patch(`/taches/${id}/reactiver`);

        expect(reponse.status).toBe(400);
    });

    test("PATCH /taches/:id/reactiver doit retourner 404 si la tâche n'existe pas", async () => {
        const reponse = await api.patch("/taches/999999/reactiver");

        expect(reponse.status).toBe(404);
    });

    test("PATCH /taches/:id/reactiver doit refuser un identifiant invalide", async () => {
        const reponse = await api.patch("/taches/abc/reactiver");

        expect(reponse.status).toBe(400);
    });

    // ISOLATION ENTRE UTILISATEURS

    test("Un utilisateur ne doit pas voir les tâches d'un autre", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche privée" });

        const id = creation.body.tache.id;

        const autreUtilisateur = await pool.query(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe)
             VALUES ($1, $2, $3)
             RETURNING id`,
            ["Autre", "autre@example.com", "mot-de-passe-test"]
        );

        const autreToken = jwt.sign(
            { id: autreUtilisateur.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const reponse = await request(app)
            .get(`/taches/${id}`)
            .set("Authorization", `Bearer ${autreToken}`);

        expect(reponse.status).toBe(404);
    });

    test("Un utilisateur ne doit pas modifier les tâches d'un autre", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche privée" });

        const id = creation.body.tache.id;

        const autreUtilisateur = await pool.query(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe)
             VALUES ($1, $2, $3)
             RETURNING id`,
            ["Autre", "autre@example.com", "mot-de-passe-test"]
        );

        const autreToken = jwt.sign(
            { id: autreUtilisateur.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const reponse = await request(app)
            .put(`/taches/${id}`)
            .set("Authorization", `Bearer ${autreToken}`)
            .send({ texte: "Tentative de modification" });

        expect(reponse.status).toBe(404);
    });

    test("Un utilisateur ne doit pas supprimer les tâches d'un autre", async () => {
        const creation = await api.post("/taches")
            .send({ texte: "Tâche privée" });

        const id = creation.body.tache.id;

        const autreUtilisateur = await pool.query(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe)
             VALUES ($1, $2, $3)
             RETURNING id`,
            ["Autre", "autre@example.com", "mot-de-passe-test"]
        );

        const autreToken = jwt.sign(
            { id: autreUtilisateur.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const reponse = await request(app)
            .delete(`/taches/${id}`)
            .set("Authorization", `Bearer ${autreToken}`);

        expect(reponse.status).toBe(404);
    });

    // GESTIONNAIRE D'ERREURS

    test("Le middleware doit utiliser le message par défaut si message est absent", () => {
        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const erreur = {
            message: "",
            statutCode: 500
        };

        gestionnaireErreurs(erreur, req, res, () => {});

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            erreur: "Erreur interne du serveur."
        });
    });
});
