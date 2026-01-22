// Attendre que les données soient chargées avant d'écouter le formulaire
chargerUtilisateurs().then(() => {
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

        // Vérification que l'email n'existe pas déjà (utilise email au lieu de login)
        const emailExiste = usersData.bénévoles.some(u => u.email === email);
        if (emailExiste) {
            alert("❌ Cet email est déjà utilisé");
            return;
        }

        // Ajout du nouvel utilisateur (prénom = firstName, nom = lastName)
        const nouvelUtilisateur = ajouterUtilisateur(prenom, nom, email, password);
        
        console.log("✅ Nouvel utilisateur créé :", nouvelUtilisateur);
        alert("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");
        
        // Redirection vers la page de connexion
        window.location.href = "index.html";
    });
});