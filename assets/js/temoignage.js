/* ==========================================
   FICHIER : assets/js/temoignage.js
   CORRIGÉ : Variables renommées + Structure HTML Nexa
========================================== */

// 1. On utilise des noms de variables UNIQUES pour éviter les conflits avec users.js
let temoignageUsers = [];   
let temoignageActions = []; 

/* =========================
   CHARGEMENT DES JSON
========================= */

async function chargerDonneesTemoignages() {
  try {
    // Chargement des utilisateurs
    const resUsers = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json");
    const dataUsers = await resUsers.json();
    temoignageUsers = dataUsers.bénévoles;

    // Chargement des actions
    const resActions = await fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/data.json");
    const dataActions = await resActions.json();
    temoignageActions = dataActions.actions;
    
    console.log("✅ Témoignages : Données chargées avec succès.");
  } catch (error) {
    console.error("❌ Erreur chargement témoignages :", error);
  }
}

/* =========================
   GÉNÉRATION DES SLIDES
========================= */

function genererTemoignages() {
  const wrapper = document.getElementById("testimonials-wrapper");
  if (!wrapper) return;
  
  wrapper.innerHTML = "";

  temoignageActions.forEach(action => {
    // Si pas de commentaire, on passe
    if (!action.comments) return;

    action.comments.forEach(comment => {
      // On cherche l'utilisateur correspondant (ID Creator = ID User)
      const user = temoignageUsers.find(u => u.id === action.creator);

      // Gestion de l'image et du nom
      let userImg = "assets/img/testimonials/testimonials-1.jpg"; // Image par défaut locale
      let userName = "Bénévole RadeUP";
      let userRole = "Participant";

      if (user) {
          // Si l'utilisateur a une image valide, on la prend
          if(user.image && user.image.startsWith('http')) {
              userImg = user.image;
          }
          userName = user.firstName + " " + user.lastName;
          // Petit bonus : Rôle basé sur le JSON
          userRole = user.role === "admin" ? "Organisateur" : "Bénévole";
      }

      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      // IMPORTANT : Utilisation de la structure HTML du template NEXA (testimonial-item)
      slide.innerHTML = `
        <div class="testimonial-item">
            <img src="${userImg}" class="testimonial-img" alt="${userName}" onerror="this.src='assets/img/testimonials/testimonials-1.jpg'">
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

/* =========================
   INITIALISATION ET SWIPER
========================= */

// Fonction pour redémarrer Swiper proprement après injection du HTML
function reinitSwiper() {
  document.querySelectorAll('.init-swiper').forEach(el => {
    if (el.swiper) {
      el.swiper.destroy(true, true); // On détruit l'instance existante (vide)
    }
    
    const configScript = el.querySelector('.swiper-config');
    const config = JSON.parse(configScript.textContent);
    
    new Swiper(el, config); // On recrée avec les nouvelles slides
  });
}

async function initTestimonials() {
  await chargerDonneesTemoignages(); // On attend les données
  genererTemoignages();              // On crée le HTML
  reinitSwiper();                    // On lance le carrousel
}

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", initTestimonials);