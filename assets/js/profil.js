// ==========================================
// VARIABLES GLOBALES
// ==========================================
let usersData = null;
let actionsData = null;

const badgeLibrary = [
    { id: 'expert', name: "Nettoyeur Expert", desc: "3+ collectes réalisées", icon: "bi-star-fill", class: "b-expert" },
    { id: 'admin', name: "Gardien de la Rade", desc: "Rôle Administrateur", icon: "bi-shield-fill-check", class: "b-admin" },
    { id: 'ocean', name: "Ami de l'Océan", desc: "Au moins 1 mission", icon: "bi-droplet-half", class: "b-ocean" }
];

// ==========================================
// 1. FONCTION PRINCIPALE DE CHARGEMENT (FUSIONNÉE)
// ==========================================
/**
 * Charge les Utilisateurs ET les Activités depuis GitHub uniquement, 
 * puis lance l'affichage.
 */
async function initialiserDonnees() {
    try {
        // --- A. Chargement des Utilisateurs (GitHub) ---
        const resUser = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json");
        usersData = await resUser.json(); // On garde la structure complète pour accéder à .bénévoles plus tard
        console.log("✅ (1/2) Utilisateurs chargés depuis GitHub");

        // --- B. Chargement des Activités (GitHub) ---
        const resAction = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/data.json");
        const jsonAction = await resAction.json();
        actionsData = jsonAction.actions; // Extraction directe du tableau 'actions'
        console.log("✅ (2/2) Activités chargées depuis GitHub");

        // --- C. Lancement de l'affichage ---
        afficherProfil();
        afficherActivites();

    } catch (err) {
        console.error("❌ Erreur critique de chargement :", err);
        const main = document.getElementById('main-content');
        if (main) main.innerHTML = `<div class="container py-5 text-center"><h3>Erreur de connexion aux données.</h3><p class="text-muted">${err.message}</p></div>`;
    }
}

// ==========================================
// 2. FONCTIONS D'AFFICHAGE
// ==========================================

function afficherProfil() {
    if (!usersData) return;

    const params = new URLSearchParams(window.location.search);
    
    // LOGIQUE ALÉATOIRE : Si pas d'ID, on prend un user au hasard
    const randomId = usersData.bénévoles[Math.floor(Math.random() * usersData.bénévoles.length)].id;
    const userId = parseInt(params.get('id')) || randomId;
    
    const user = usersData.bénévoles.find(u => u.id === userId);

    if (!user) {
        document.getElementById('main-content').innerHTML = `<div class="container py-5 text-center"><h3>Utilisateur introuvable.</h3></div>`;
        return;
    }

    // Mise à jour du DOM
    document.getElementById('user-fullname').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-role').textContent = user.role.toUpperCase();
    document.getElementById('user-img').src = user.image || "assets/img/person/default-user.webp";

    // Génération des badges
    const grid = document.getElementById('badges-grid');
    if (grid) {
        grid.innerHTML = "";
        badgeLibrary.forEach(badge => {
            let isOwned = false;
            if (badge.id === 'expert' && user.actions_id.length >= 3) isOwned = true;
            if (badge.id === 'admin' && user.role === 'admin') isOwned = true;
            if (badge.id === 'ocean' && user.actions_id.length >= 1) isOwned = true;

            grid.innerHTML += `
              <div class="col-lg-4 col-md-6" data-aos="zoom-in">
                <div class="badge-card ${isOwned ? '' : 'badge-locked'}">
                  <i class="bi ${badge.icon} badge-icon ${badge.class}"></i>
                  <h5>${badge.name}</h5>
                  <p class="small text-muted">${badge.desc}</p>
                  ${isOwned ? 
                    '<span class="text-success small fw-bold"><i class="bi bi-check-circle"></i> Débloqué</span>' : 
                    '<span class="text-muted small"><i class="bi bi-lock"></i> Verrouillé</span>'}
                </div>
              </div>
            `;
        });
    }

    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('profile-display').style.display = 'block';
    if (typeof AOS !== 'undefined') AOS.init();
}

function afficherActivites() {
    // Plus besoin de setTimeout ou de vérification complexe, car cette fonction
    // est appelée uniquement quand usersData ET actionsData sont prêts.
    
    const params = new URLSearchParams(window.location.search);
    // On réutilise la logique pour retrouver le même user que dans afficherProfil
    // Note: Dans une vraie app, on stockerait l'ID user dans une variable globale pour éviter de recalculer le random
    const userIdInUrl = parseInt(params.get('id'));
    
    // Si l'ID est dans l'URL, on le prend, sinon on doit retrouver l'utilisateur affiché 
    // (Astuce : ici on filtre par rapport au nom affiché ou on refait la recherche, 
    // mais pour simplifier, si c'est aléatoire, le tableau risque de ne pas correspondre au profil 
    // si on ne stocke pas l'ID. Pour ce code, on suppose que l'URL a l'ID ou on prend le premier pour éviter le crash).
    
    // Amélioration : Récupérer l'ID directement depuis usersData si on a stocké "currentUser"
    // Pour ton exercice, on va chercher l'ID en fonction du nom affiché dans le DOM ou on prend le user de l'URL
    
    let user = null;
    if (userIdInUrl) {
        user = usersData.bénévoles.find(u => u.id === userIdInUrl);
    } else {
        // Si c'est aléatoire, on essaye de retrouver le user affiché par son nom
        const nameDisplayed = document.getElementById('user-fullname').textContent;
        user = usersData.bénévoles.find(u => `${u.firstName} ${u.lastName}` === nameDisplayed);
    }

    if (!user) return; // Sécurité

    const tbody = document.getElementById('actions-list');
    const noActionsMsg = document.getElementById('no-actions-message');
    tbody.innerHTML = ""; 

    // Filtrage : On compare user.actions_id (tableau d'entiers) avec action.id
    const mesActions = actionsData.filter(action => user.actions_id.includes(action.id));

    if (mesActions.length === 0) {
        noActionsMsg.style.display = "block";
        if(document.querySelector('.table-responsive')) 
            document.querySelector('.table-responsive').style.display = "none";
    } else {
        noActionsMsg.style.display = "none";
        if(document.querySelector('.table-responsive')) 
            document.querySelector('.table-responsive').style.display = "block";

        mesActions.forEach(action => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${action.start_date}</td>
                <td class="fw-bold">${action.name}</td>
                <td>${action.address.address}</td>
                <td><span class="badge bg-primary">${action.type}</span></td>
                <td><span class="badge ${getDifficultyColor(action.difficulty)}">${action.difficulty}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function getDifficultyColor(diff) {
    if (diff === 'Facile') return 'bg-success';
    if (diff === 'Modérée') return 'bg-warning text-dark';
    if (diff === 'Difficile') return 'bg-danger';
    return 'bg-secondary';
}

// ==========================================
// 3. LANCEMENT UNIQUE
// ==========================================
document.addEventListener("DOMContentLoaded", initialiserDonnees);