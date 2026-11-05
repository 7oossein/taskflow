import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

// Simuler le modèle d'authentification
jest.unstable_mockModule("../models/auth.model.js", () => ({
    trouverUtilisateurParEmail: jest.fn(),
    creerUtilisateur: jest.fn(),
    trouverUtilisateurParId: jest.fn()
}));

// Importer les modules après la déclaration du mock
const { default: app } = await import("../app.js");
const { default: pool } = await import("../db.js");

const { trouverUtilisateurParEmail, trouverUtilisateurParId } =
    await import("../models/auth.model.js");

const request = (await import("supertest")).default;

describe("Gestion des erreurs d'authentification", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        // Simuler une erreur provenant de la base de données
        trouverUtilisateurParEmail.mockRejectedValue(
            new Error("Erreur simulée")
        );
    });

    afterAll(async () => {
        await pool.end();
    });

    test("L'inscription doit transmettre l'erreur à Express", async () => {
        const reponse = await request(app)
            .post("/auth/inscription")
            .send({
                nom: "Test",
                email: "test@example.com",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(500);
        expect(reponse.body.erreur).toBe("Erreur simulée");
        expect(trouverUtilisateurParEmail).toHaveBeenCalled();
    });

    test("La connexion doit transmettre l'erreur à Express", async () => {
        const reponse = await request(app)
            .post("/auth/connexion")
            .send({
                email: "test@example.com",
                motDePasse: "password123"
            });

        expect(reponse.status).toBe(500);
        expect(reponse.body.erreur).toBe("Erreur simulée");
        expect(trouverUtilisateurParEmail).toHaveBeenCalled();
    });

test("Un utilisateur supprimé ne peut plus accéder à ses tâches", async () => {
    // Simuler un utilisateur qui n'existe plus
    trouverUtilisateurParId.mockResolvedValue(undefined);

    // Créer un token valide avec un ID
    const token = jwt.sign(
        { id: 999 },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const reponse = await request(app)
        .get("/taches")
        .set("Authorization", `Bearer ${token}`);

    expect(reponse.status).toBe(401);

    expect(reponse.body.erreur)
        .toBe("Compte utilisateur inexistant.");

    expect(trouverUtilisateurParId)
        .toHaveBeenCalledWith(999);
});

test("Un token avec un identifiant négatif doit être refusé", async () => {
    const token = jwt.sign(
        { id: -1 },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const reponse = await request(app)
        .get("/taches")
        .set("Authorization", `Bearer ${token}`);

    expect(reponse.status).toBe(401);
    expect(reponse.body.erreur).toBe("Token invalide.");

    // La recherche en base ne doit même pas être effectuée.
    expect(trouverUtilisateurParId).not.toHaveBeenCalled();
});

test("Une erreur PostgreSQL doit être transmise à Express", async () => {
    trouverUtilisateurParId.mockRejectedValue(
        new Error("Erreur simulée de PostgreSQL")
    );

    const token = jwt.sign(
        { id: 999 },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const reponse = await request(app)
        .get("/taches")
        .set("Authorization", `Bearer ${token}`);

    expect(reponse.status).toBe(500);
    expect(reponse.body.erreur)
        .toBe("Erreur simulée de PostgreSQL");
});

});
