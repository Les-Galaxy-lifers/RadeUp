document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const login = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("🔹 Tentative de connexion avec :", login);

    const user = usersData.users.find(
        u => u.login === login && u.password === password
    );

    if (user) {
        console.log("✅ Utilisateur trouvé :", user);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "index.html";
    } else {
        console.log("❌ Aucun utilisateur correspondant");
        alert("❌ Login ou mot de passe incorrect");
    }
});