/* ==========================================
   FICHIER : assets/js/temoignage.js
   BUT : Lier users.json et data.json pour le slider
========================================== */

let usersData = [];
let actionsData = [];

// 1. Charger les utilisateurs (depuis ton users.json)
async function chargerUtilisateurs() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json");
    const data = await res.json();
    // ATTENTION : Ton JSON a une clé "bénévoles", on récupère donc data.bénévoles
    usersData = data.bénévoles; 
    console.log("✅ Bénévoles chargés :", usersData.length);
  } catch (error) {
    console.error("❌ Erreur chargement users :", error);
  }
}

// 2. Charger les actions (depuis ton data.json)
async function chargerActions() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/data.json");
    const data = await res.json();
    actionsData = data.actions;
    console.log("✅ Actions chargées :", actionsData.length);
  } catch (error) {
    console.error("❌ Erreur chargement actions :", error);
  }
}

// 3. Générer le HTML
function genererTemoignages() {
  const wrapper = document.getElementById("testimonials-wrapper");
  if (!wrapper) return; // Sécurité si la page n'a pas le slider
  
  wrapper.innerHTML = "";

  actionsData.forEach(action => {
    // Si l'action n'a pas de commentaires, on passe à la suivante
    if (!action.comments || action.comments.length === 0) return;

    // Pour chaque commentaire de cette action
    action.comments.forEach(comment => {
      
      // 🔍 LA CLÉ DU SUCCÈS : On cherche le bénévole qui a l'ID = action.creator
      const user = usersData.find(u => u.id === action.creator);

      // Gestion de l'image (Tes images sont des liens https://...)
      // Si user existe et a une image, on la prend. Sinon image par défaut.
      let avatarUrl = "assets/img/testimonials/testimonials-1.jpg"; // Image de secours
      let userName = "Bénévole RadeUP";
      let userRole = "Participant";

      if (user) {
          avatarUrl = user.image; // Ex: https://dummyjson.com/icon/emilys/128
          userName = user.firstName + " " + user.lastName;
          // Petit bonus : afficher le rôle si dispo
          userRole = user.role === "admin" ? "Organisateur" : "Bénévole";
      }

      // Création de la slide
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      slide.innerHTML = `
        <div class="testimonial-item">
            <img src="${avatarUrl}" class="testimonial-img" alt="${userName}" onerror="this.src='assets/img/testimonials/testimonials-1.jpg'">
            <h3>${userName}</h3>
            <h4>${userRole}</h4>
            <div class="stars">
                <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
            </div>
            <p>
                <i class="bi bi-quote quote-icon-left"></i>
                <span>${comment}</span>
                <i class="bi bi-quote quote-icon-right"></i>
            </p>
        </div>
      `;

      wrapper.appendChild(slide);
    });
  });
}

// 4. Lancer le tout
async function initTestimonials() {
  // On attend que les deux chargements soient finis
  await Promise.all([chargerUtilisateurs(), chargerActions()]);

  // On génère le HTML
  genererTemoignages();

  // On relance Swiper pour qu'il prenne en compte les nouvelles slides
  reinitSwiper();
}

// Fonction pour redémarrer Swiper proprement
function reinitSwiper() {
  const swiperElement = document.querySelector('.init-swiper');
  if (swiperElement && swiperElement.swiper) {
    swiperElement.swiper.destroy(true, true); // On détruit l'ancien
    
    // On relit la config et on recrée
    const configScript = swiperElement.querySelector('.swiper-config');
    const config = JSON.parse(configScript.textContent);
    new Swiper(swiperElement, config);
  }
}

// Démarrage au chargement de la page
document.addEventListener("DOMContentLoaded", initTestimonials);