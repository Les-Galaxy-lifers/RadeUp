/* =========================
   VARIABLES GLOBALES
   (Renommées pour éviter le conflit avec users.js)
========================= */
let temoignageUsersData = [];
let temoignageActionsData = [];

/* =========================
   CHARGEMENT DES JSON
========================= */

async function chargerUtilisateurs() {
  const res = await fetch(
    "https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json"
  );
  const data = await res.json();
  // On cible .bénévoles car c'est la structure de ton JSON
  temoignageUsersData = data.bénévoles; 
}

async function chargerActions() {
  const res = await fetch(
    "https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/data.json"
  );
  const data = await res.json();
  // On cible .actions car c'est la structure de ton JSON
  temoignageActionsData = data.actions; 
}

/* =========================
   GÉNÉRATION DES SLIDES
========================= */

function genererTemoignages() {
  const wrapper = document.getElementById("testimonials-wrapper");
  if (!wrapper) return;
  
  wrapper.innerHTML = "";

  temoignageActionsData.forEach(action => {
    // S'il n'y a pas de commentaires, on passe
    if (!action.comments) return;
    console.log(usersData);
    action.comments.forEach(comment => {
      // On trouve l'utilisateur correspondant
      const user = temoignageUsersData.find(u => u.id === action.creator);

      // Préparation des données d'affichage
      const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur Inconnu";
      const userRole = user && user.role === "admin" ? "Organisateur" : "Bénévole";
      // Utilise l'image du JSON ou une image par défaut locale si vide
      const userImg = user && user.image ? user.image : "assets/img/testimonials/testimonials-1.jpg";

      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      // --- C'EST ICI LA CORRECTION D'AFFICHAGE ---
      // J'utilise la structure HTML native du template Nexa (testimonial-item)
      slide.innerHTML = `
        <div class="testimonial-item">
          <img src="${userImg}" class="testimonial-img" alt="${userName}" onerror="this.src='assets/img/testimonials/testimonials-1.jpg'">
          <h3>${userName}</h3>
          <h4>${userRole}</h4>
          <div class="stars">
            <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
          </div>

          <div class="testimonial-profile">
            <div class="rating">
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star"></i>
            </div>

            <div class="profile-info">
              <img src="${user?.image || 'assets/img/person/default.webp'}"
                   alt="Profile Image">
              <div>
                <h3>
                  ${user ? `${user.firstName} ${user.lastName}` : "Anonyme"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      `;
      // -------------------------------------------

      wrapper.appendChild(slide);
    });
  });
}

/* =========================
   INITIALISATION
========================= */

async function initTestimonials() {
  try {
    await Promise.all([
      chargerUtilisateurs(),
      chargerActions()
    ]);

    genererTemoignages();
    reinitSwiper(); 
  } catch (error) {
    console.error("Erreur lors de l'initialisation des témoignages :", error);
  }
}

document.addEventListener("DOMContentLoaded", initTestimonials);

function reinitSwiper() {
  document.querySelectorAll('.init-swiper').forEach(el => {
    if (el.swiper) {
      el.swiper.destroy(true, true);
    }
    const configScript = el.querySelector('.swiper-config');
    const config = JSON.parse(configScript.textContent);
    new Swiper(el, config);
  });
}