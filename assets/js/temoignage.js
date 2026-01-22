let usersData = [];
let actionsData = [];

/* =========================
   CHARGEMENT DES JSON
========================= */

async function chargerUtilisateurs() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json"
    );
    const data = await res.json();
    usersData = data.bénévoles ?? [];
  } catch (err) {
    console.error("Erreur chargement utilisateurs :", err);
  }
}

async function chargerActions() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/data.json"
    );
    const data = await res.json();
    actionsData = data.actions ?? [];
  } catch (err) {
    console.error("Erreur chargement actions :", err);
  }
}

/* =========================
   GÉNÉRATION DES SLIDES
========================= */

function genererTemoignages() {
  const wrapper = document.getElementById("testimonials-wrapper");
  wrapper.innerHTML = "";

  actionsData.forEach(action => {
    if (!action.comments || action.comments.length === 0) return;

    action.comments.forEach(comment => {

      // 🔹 Adapter "comment.userId" si nécessaire
      const user = usersData.find(u => u.id === comment.userId);

      const userName = user?.name ?? "Utilisateur inconnu";
      const userRole = user?.role ?? "Bénévole";
      const userImg = user?.photo ?? "assets/img/testimonials/testimonials-1.jpg";

      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      slide.innerHTML = `
<<<<<<< HEAD
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p>
              <i class="bi bi-quote quote-icon"></i>
              ${comment}
            </p>
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
              <img src="${user?.image || 'assets/img/person/canard.jpg'}"
                   alt="Profile Image">
              <div>
                <h3>
                  ${user ? `${user.firstName} ${user.lastName}` : "Bernard"}
                </h3>
              </div>
            </div>
=======
        <div class="testimonial-item">
          <img src="${userImg}" 
               class="testimonial-img" 
               alt="${userName}"
               onerror="this.src='assets/img/testimonials/testimonials-1.jpg'">
          <h3>${userName}</h3>
          <h4>${userRole}</h4>
          <div class="stars">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
>>>>>>> 4c274f1ebf5dc3011ff2c231ae3222f5ca2aa32a
          </div>
          <p>
            <i class="bi bi-quote quote-icon-left"></i>
            <span>${comment.text ?? comment}</span>
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
  reinitSwiper(); // obligatoire
}

document.addEventListener("DOMContentLoaded", initTestimonials);

/* =========================
   SWIPER
========================= */

function reinitSwiper() {
  document.querySelectorAll(".init-swiper").forEach(el => {

    if (el.swiper) {
      el.swiper.destroy(true, true);
    }

    const configScript = el.querySelector(".swiper-config");
    if (!configScript) return;

    const config = JSON.parse(configScript.textContent);
    new Swiper(el, config);
  });
}