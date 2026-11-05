
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const variablesObligatoires = [
    "DB_USER",
    "DB_HOST",
    "DB_PASSWORD",
    "DB_PORT"
];

for (const variable of variablesObligatoires) {
    if (!process.env[variable]) {
        throw new Error(`Variable d'environnement manquante : ${variable}`);
    }
}

const nomBase = process.env.NODE_ENV === "test"
    ? "gestion_taches_test"
    : process.env.DB_NAME;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: nomBase,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});

export default pool;
