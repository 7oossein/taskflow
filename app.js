import express from "express";
import tachesRouter from "./routes/taches.routes.js";
import authRouter from "./routes/auth.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/taches", tachesRouter);
app.use("/auth", authRouter);

export function gestionnaireErreurs(erreur, req, res, next) {
    console.error(erreur.message);

    const statut = erreur.statutCode || 500;

    if (erreur.code === "23505") {
        return res.status(409).json({
            erreur: "Une tâche avec ce texte existe déjà.",
        });
    }

    res.status(statut).json({
        message: erreur.message || "Erreur interne du serveur.",
    });
}

app.use(gestionnaireErreurs);
export default app;
