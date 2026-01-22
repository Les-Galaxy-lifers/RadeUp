document.getElementById("inscriptionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
        alert("❌ Les mots de passe ne correspondent pas");
        return;
    }

    // Vérification que l'email n'existe pas déjà
    const emailExiste = usersData.users.some(u => u.login === email);
    if (emailExiste) {
        alert("❌ Cet email est déjà utilisé");
        return;
    }

    // Ajout du nouvel utilisateur
    const nouvelUtilisateur = ajouterUtilisateur(nom, prenom, email, password);
    
    console.log("✅ Nouvel utilisateur créé :", nouvelUtilisateur);
    alert("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");
    
    // Redirection vers la page de connexion
    window.location.href = "login.html";
});