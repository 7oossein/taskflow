
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE taches (
    id SERIAL PRIMARY KEY,
    texte VARCHAR(255) NOT NULL,
    terminee BOOLEAN DEFAULT FALSE,
    utilisateur_id INTEGER NOT NULL,

    CONSTRAINT fk_taches_utilisateurs
        FOREIGN KEY (utilisateur_id)
        REFERENCES utilisateurs(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_tache_par_utilisateur
        UNIQUE (utilisateur_id, texte)
);
