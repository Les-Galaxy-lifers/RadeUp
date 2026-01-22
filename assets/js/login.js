document.addEventListener("DOMContentLoaded", () => {
    // Charger les utilisateurs
    chargerUtilisateurs();

    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const login = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log("🔹 Tentative de connexion avec :", login);
        console.log("🔹 Données disponibles :", usersData);

        const user = usersData.bénévoles.find(
            u => u.email === login && u.password === password
        );

        if (user) {
            console.log("✅ Utilisateur trouvé :", user);
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "login.html";
        } else {
            console.log("❌ Aucun utilisateur correspondant");
            alert("❌ Email ou mot de passe incorrect");
        }
    });
});
