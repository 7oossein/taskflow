import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const estTest = process.env.NODE_ENV === "test";

let pool;

if (estTest) {
    // Base locale réservée aux tests
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: "gestion_taches_test",
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
    });
} else {
    // Base PostgreSQL hébergée sur Neon
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL est manquante.");
    }

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
}

export default pool;