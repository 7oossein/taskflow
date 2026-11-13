const API_URL = "https://taskflow-5hsg.onrender.com";

function verifierReponse(reponse) {
    if (reponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("utilisateur");
        window.location.href = "login.html";
        throw new Error("Session expirée. Veuillez vous reconnecter.");
    }
}
export async function obtenirTaches() {
    const token = localStorage.getItem("token");

    const reponse = await fetch(`${API_URL}/taches`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    verifierReponse(reponse);
    if (!reponse.ok) {
        throw new Error("Impossible de récupérer les tâches");
    }

    return await reponse.json();
}

export async function ajouterTache(texte) {
    const token = localStorage.getItem("token");

    const reponse = await fetch(`${API_URL}/taches`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texte }),
    });
    verifierReponse(reponse);
    const resultat = await reponse.json();

    if (!reponse.ok) {
        throw new Error(
            resultat.message || resultat.erreur || "Erreur lors de l'ajout",
        );
    }

    return resultat.tache;
}

export async function supprimerTache(id) {
    const token = localStorage.getItem("token");

    const reponse = await fetch(`${API_URL}/taches/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    verifierReponse(reponse);
    const resultat = await reponse.json();

    if (!reponse.ok) {
        throw new Error(
            resultat.message ||
                resultat.erreur ||
                "Erreur lors de la suppression",
        );
    }

    return resultat;
}
export async function modifierTache(id, texte) {
    const token = localStorage.getItem("token");

    const reponse = await fetch(`${API_URL}/taches/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texte }),
    });
    verifierReponse(reponse);
    const resultat = await reponse.json();

    if (!reponse.ok) {
        throw new Error(
            resultat.message ||
                resultat.erreur ||
                "Erreur lors de la modification",
        );
    }

    return resultat.tache;
}
export async function terminerTache(id) {
    const token = localStorage.getItem("token");

    const reponse = await fetch(`${API_URL}/taches/${id}/terminer`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    verifierReponse(reponse);
    const resultat = await reponse.json();

    if (!reponse.ok) {
        throw new Error(
            resultat.message ||
                resultat.erreur ||
                "Erreur lors de la modification",
        );
    }

    return resultat.tache;
}
export async function reactiverTache(id) {
    const token = localStorage.getItem("token");

    const reponse = await fetch(`${API_URL}/taches/${id}/reactiver`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    verifierReponse(reponse);
    const resultat = await reponse.json();

    if (!reponse.ok) {
        throw new Error(
            resultat.message ||
                resultat.erreur ||
                "Erreur lors de la réactivation",
        );
    }

    return resultat.tache;
}
