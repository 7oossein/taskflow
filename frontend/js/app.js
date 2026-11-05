import {
    obtenirTaches,
    ajouterTache,
    supprimerTache,
    modifierTache,
    terminerTache,
    reactiverTache,
} from "./api.js";

// Vérifier si l'utilisateur est connecté
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

// Récupérer les éléments HTML
const message = document.querySelector("#message");
const formulaire = document.querySelector("#form-tache");
const inputTache = document.querySelector("#texte-tache");
const liste = document.querySelector("#liste-taches");
const compteur = document.querySelector("#compteur");
const boutonsFiltre = document.querySelectorAll(".filtre");

// Gestion des messages temporaires
let temporisateurMessage;

function afficherMessage(texte, type = "erreur") {
    clearTimeout(temporisateurMessage);

    message.textContent = texte;
    message.className = type;

    temporisateurMessage = setTimeout(() => {
        message.textContent = "";
        message.className = "";
    }, 3000);
}

// Données de l'application
let taches = [];
let filtreActuel = "toutes";

// Afficher toutes les tâches
function afficherToutesLesTaches() {
    liste.innerHTML = "";

    taches.forEach((tache) => {
        afficherTache(tache);
    });

    mettreAJourCompteur();
    appliquerFiltre();
}

// Créer et afficher une tâche
function afficherTache(tache) {
    const li = document.createElement("li");
    li.dataset.id = tache.id;

    const span = document.createElement("span");
    span.textContent = tache.texte;

    const boutonModifier = document.createElement("button");
    boutonModifier.type = "button";
    boutonModifier.textContent = "Modifier";
    boutonModifier.dataset.action = "modifier";

    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.type = "button";
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.dataset.action = "supprimer";

    li.appendChild(span);
    li.appendChild(boutonModifier);
    li.appendChild(boutonSupprimer);

    if (tache.terminee) {
        li.classList.add("terminee");
    }

    liste.appendChild(li);
}

// Charger les tâches depuis le serveur
async function initialiserApplication() {
    try {
        taches = await obtenirTaches();
        afficherToutesLesTaches();
    } catch (erreur) {
        console.error(erreur);
        afficherMessage(erreur.message);
    }
}

// Gestion des clics sur les tâches
liste.addEventListener("click", async (event) => {
    // Récupérer les boutons concernés
    const boutonModifier = event.target.closest('[data-action="modifier"]');
    const boutonSupprimer = event.target.closest('[data-action="supprimer"]');

    // MODIFIER UNE TÂCHE
    if (boutonModifier) {
        const elementTache = boutonModifier.closest("li");

        // Éviter plusieurs éditions simultanées de la même tâche
        if (elementTache.dataset.edition === "true") {
            return;
        }

        elementTache.dataset.edition = "true";

        const id = Number(elementTache.dataset.id);

        const tacheTrouvee = taches.find((tache) => tache.id === id);

        if (!tacheTrouvee) {
            return;
        }

        // Masquer les boutons Modifier et Supprimer
        boutonModifier.style.display = "none";

        const boutonSupprimer = elementTache.querySelector(
            '[data-action="supprimer"]',
        );

        boutonSupprimer.style.display = "none";

        // Créer le champ de modification
        const nouveauTexteInput = document.createElement("input");

        nouveauTexteInput.type = "text";
        nouveauTexteInput.placeholder = "Modifier la tâche";

        // Préremplir avec le texte actuel
        nouveauTexteInput.value = tacheTrouvee.texte;

        elementTache.appendChild(nouveauTexteInput);

        // Créer le bouton Enregistrer
        const boutonEnregistrer = document.createElement("button");

        boutonEnregistrer.type = "button";
        boutonEnregistrer.textContent = "Enregistrer";

        // Créer le bouton Annuler
        const boutonAnnuler = document.createElement("button");

        boutonAnnuler.type = "button";
        boutonAnnuler.textContent = "Annuler";

        elementTache.appendChild(boutonEnregistrer);
        elementTache.appendChild(boutonAnnuler);

        // ENREGISTRER LA MODIFICATION
        boutonEnregistrer.addEventListener("click", async () => {
            const nouveauTexte = nouveauTexteInput.value.trim();

            if (nouveauTexte === "") {
                afficherMessage("Le texte ne peut pas être vide.", "erreur");
                return;
            }

            try {
                const tacheModifiee = await modifierTache(id, nouveauTexte);

                // Mettre à jour la tâche dans le tableau
                Object.assign(tacheTrouvee, tacheModifiee);

                // Mettre à jour le texte affiché
                elementTache.querySelector("span").textContent =
                    tacheModifiee.texte;

                // Supprimer les éléments d'édition
                nouveauTexteInput.remove();
                boutonEnregistrer.remove();
                boutonAnnuler.remove();

                delete elementTache.dataset.edition;

                // Réafficher les boutons
                boutonModifier.style.display = "inline-block";
                boutonSupprimer.style.display = "inline-block";

                afficherMessage("Tâche modifiée avec succès !", "succes");
            } catch (erreur) {
                console.error(erreur);
                afficherMessage(erreur.message, "erreur");
            }
        });

        // ANNULER LA MODIFICATION
        boutonAnnuler.addEventListener("click", () => {
            nouveauTexteInput.remove();
            boutonEnregistrer.remove();
            boutonAnnuler.remove();

            delete elementTache.dataset.edition;

            boutonModifier.style.display = "inline-block";
            boutonSupprimer.style.display = "inline-block";
        });

        return;
    }

    // SUPPRIMER UNE TÂCHE
    if (boutonSupprimer) {
        const elementTache = boutonSupprimer.closest("li");
        const id = Number(elementTache.dataset.id);

        try {
            await supprimerTache(id);

            taches = taches.filter((tache) => tache.id !== id);

            elementTache.remove();

            mettreAJourCompteur();
            appliquerFiltre();

            afficherMessage("Tâche supprimée avec succès !", "succes");
        } catch (erreur) {
            console.error(erreur);
            afficherMessage(erreur.message, "erreur");
        }

        return;
    }

    // TERMINER OU RÉACTIVER UNE TÂCHE
    const elementTache = event.target.closest("li");

    if (elementTache && event.target === elementTache.querySelector("span")) {
        const id = Number(elementTache.dataset.id);

        const tacheTrouvee = taches.find((tache) => tache.id === id);

        if (!tacheTrouvee) {
            return;
        }

        try {
            let resultat;

            if (tacheTrouvee.terminee) {
                resultat = await reactiverTache(id);

                afficherMessage("Tâche réactivée avec succès !", "succes");
            } else {
                resultat = await terminerTache(id);

                afficherMessage("Tâche terminée avec succès !", "succes");
            }

            Object.assign(tacheTrouvee, resultat);

            elementTache.classList.toggle("terminee", resultat.terminee);

            mettreAJourCompteur();
            appliquerFiltre();
        } catch (erreur) {
            console.error(erreur);
            afficherMessage(erreur.message, "erreur");
        }
    }
});

// AJOUTER UNE TÂCHE
formulaire.addEventListener("submit", async (event) => {
    event.preventDefault();

    const texte = inputTache.value.trim();

    if (texte === "") {
        afficherMessage("Veuillez saisir une tâche.", "erreur");
        return;
    }

    try {
        const nouvelleTache = await ajouterTache(texte);

        taches.push(nouvelleTache);

        afficherToutesLesTaches();

        inputTache.value = "";

        afficherMessage("Tâche ajoutée avec succès !", "succes");
    } catch (erreur) {
        console.error(erreur);
        afficherMessage(erreur.message, "erreur");
    }
});

// METTRE À JOUR LE COMPTEUR
function mettreAJourCompteur() {
    const nombreTachesEnCours = taches.filter(
        (tache) => !tache.terminee,
    ).length;

    compteur.textContent = `${nombreTachesEnCours} tâche(s) en cours`;
}

// APPLIQUER LE FILTRE
function appliquerFiltre() {
    const elementsTaches = liste.querySelectorAll("li");

    elementsTaches.forEach((element) => {
        const estTerminee = element.classList.contains("terminee");

        if (filtreActuel === "toutes") {
            element.style.display = "flex";
        } else if (filtreActuel === "en-cours") {
            element.style.display = estTerminee ? "none" : "flex";
        } else if (filtreActuel === "terminees") {
            element.style.display = estTerminee ? "flex" : "none";
        }
    });
}

// ÉCOUTER LES BOUTONS DE FILTRE
boutonsFiltre.forEach((bouton) => {
    bouton.addEventListener("click", () => {
        filtreActuel = bouton.dataset.filtre;

        boutonsFiltre.forEach((b) => {
            b.classList.remove("actif");
        });

        bouton.classList.add("actif");

        appliquerFiltre();
    });
});

// DÉCONNEXION
const boutonDeconnexion = document.querySelector("#btn-deconnexion");

boutonDeconnexion.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

// LANCER L'APPLICATION
initialiserApplication();
