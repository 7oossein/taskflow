const form = document.querySelector("#form-connexion");
const emailInput = document.querySelector("#email");
const motDePasseInput = document.querySelector("#motDePasse");
const message = document.querySelector("#message");

const API_URL = "https://taskflow-5hsg.onrender.com";
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const motDePasse = motDePasseInput.value;

    message.textContent = "";
    message.className = "";

    try {
        const reponse = await fetch(`${API_URL}/auth/connexion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                motDePasse,
            }),
        });

        const resultat = await reponse.json();

        if (!reponse.ok) {
            throw new Error(resultat.message || "Erreur de connexion");
        }

        // Enregistrer le token
        localStorage.setItem("token", resultat.token);

        // Rediriger vers la liste des tâches
        window.location.href = "index.html";
    } catch (erreur) {
        message.textContent = erreur.message;
        message.className = "erreur";
    }
});
