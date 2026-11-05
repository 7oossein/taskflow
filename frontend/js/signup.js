
const form = document.querySelector("#form-inscription");

const nomInput = document.querySelector("#nom");
const emailInput = document.querySelector("#email");
const motDePasseInput = document.querySelector("#motDePasse");

const message = document.querySelector("#message");

const API_URL = "https://taskflow-5hsg.onrender.com";

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Récupérer les valeurs du formulaire
    const nom = nomInput.value.trim();
    const email = emailInput.value.trim();
    const motDePasse = motDePasseInput.value;

    try {
        const reponse = await fetch(`${API_URL}/auth/inscription`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nom,
                email,
                motDePasse
            })
        });

        const resultat = await reponse.json();

        // Vérifier la réponse du serveur
        if (!reponse.ok) {
            throw new Error(
                resultat.message || "Registration failed."
            );
        }

        message.style.color = "green";
        message.textContent = "Account created successfully!";

        // Rediriger vers la page de connexion
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (erreur) {
        message.style.color = "red";
        message.textContent = erreur.message;
    }
});
