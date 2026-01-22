// Variable globale pour stocker les utilisateurs
let usersData = null;

// Configuration de la bibliothèque de badges
const badgeLibrary = [
    { id: 'expert', name: "Nettoyeur Expert", desc: "3+ collectes réalisées", icon: "bi-star-fill", class: "b-expert" },
    { id: 'admin', name: "Gardien de la Rade", desc: "Rôle Administrateur", icon: "bi-shield-fill-check", class: "b-admin" },
    { id: 'ocean', name: "Ami de l'Océan", desc: "Au moins 1 mission", icon: "bi-droplet-half", class: "b-ocean" }
];

/**
 * Charge les données depuis GitHub ou le LocalStorage
 */
async function chargerEtAfficher() {
    try {
        const localData = localStorage.getItem("usersData");
        
        if (localData) {
            usersData = JSON.parse(localData);
            console.log("✅ Données chargées depuis LocalStorage");
        } else {
            const res = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json");
            usersData = await res.json();
            console.log("✅ Données chargées depuis GitHub");
        }

        afficherProfil();
    } catch (err) {
        console.error("❌ Erreur de chargement :", err);
        const main = document.getElementById('main-content');
        if (main) main.innerHTML = `<div class="container py-5 text-center"><h3>Erreur de connexion aux données.</h3></div>`;
    }
}

/**
 * Extrait l'ID de l'URL et injecte les données dans le HTML
 */
function afficherProfil() {
    const params = new URLSearchParams(window.location.search);
    const userId = parseInt(params.get('id')) || usersData.bénévoles[Math.floor(Math.random() * usersData.bénévoles.length)].id; // ID aléatoire par défaut
    
    const user = usersData.bénévoles.find(u => u.id === userId);

    if (!user) {
        document.getElementById('main-content').innerHTML = `<div class="container py-5 text-center"><h3>Utilisateur non trouvé (ID: ${userId}).</h3></div>`;
        return;
    }

    // 1. Remplissage des textes de base
    document.getElementById('user-fullname').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-role').textContent = user.role.toUpperCase();
    
    // 2. Gestion de l'image (par défaut si vide)
    const imgElement = document.getElementById('user-img');
    imgElement.src = user.image || "assets/img/person/default-user.webp";

    // 3. Génération dynamique de la grille de badges
    const grid = document.getElementById('badges-grid');
    if (grid) {
        grid.innerHTML = "";
        badgeLibrary.forEach(badge => {
            let isOwned = false;
            
            // Logique de déblocage des badges
            if (badge.id === 'expert' && user.actions_id && user.actions_id.length >= 3) isOwned = true;
            if (badge.id === 'admin' && user.role === 'admin') isOwned = true;
            if (badge.id === 'ocean' && user.actions_id && user.actions_id.length >= 1) isOwned = true;

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

    // 4. On cache le spinner et on affiche le profil
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('profile-display').style.display = 'block';
    
    // Réinitialisation de AOS pour les nouveaux éléments injectés
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
}

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", chargerEtAfficher);