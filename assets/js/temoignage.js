let usersData = [];
let actionsData = [];

/* =========================
   CHARGEMENT DES JSON
========================= */

async function chargerUtilisateurs() {
  const res = await fetch(
    "https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json"
  );
  const data = await res.json();
  usersData = data.bénévoles;
}

async function chargerActions() {
  const res = await fetch(
    "https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/data.json"
  );
  const data = await res.json();
  actionsData = data.actions;
}

/* =========================
   GÉNÉRATION DES SLIDES
========================= */

function genererTemoignages() {
  const wrapper = document.getElementById("testimonials-wrapper");
  wrapper.innerHTML = "";

  actionsData.forEach(action => {
    if (!action.comments) return;
    console.log(usersData);
    action.comments.forEach(comment => {
      const user = usersData.find(u => u.id === action.creator);

      const slide = document.createElement("div");
      slide.className = "swiper-slide";

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
   INITIALISATION
========================= */

async function initTestimonials() {
  await Promise.all([
    chargerUtilisateurs(),
    chargerActions()
  ]);

  genererTemoignages();
  reinitSwiper(); // 🔥 OBLIGATOIRE
}

document.addEventListener("DOMContentLoaded", initTestimonials);
function reinitSwiper() {
  document.querySelectorAll('.init-swiper').forEach(el => {

    // Détruire l'ancien Swiper
    if (el.swiper) {
      el.swiper.destroy(true, true);
    }

    // Lire la config JSON du template
    const configScript = el.querySelector('.swiper-config');
    const config = JSON.parse(configScript.textContent);

    // Recréer Swiper
    new Swiper(el, config);
  });
}
