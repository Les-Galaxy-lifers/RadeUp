
// Variable qui contiendra les données
let usersData = null;

function chargerUtilisateurs() {
    fetch("https://raw.githubusercontent.com/Les-Galaxy-lifers/RadeUp/main/BDD/users.json")
        .then(res => res.json())
        .then(data => {
            usersData = data;
            console.log("✅ Données chargées depuis GitHub :", usersData);
        })
        .catch(err => {
            console.error("❌ Impossible de charger le JSON depuis GitHub :", err);
        });
}



// ===== AJOUT D'UN BÉNÉVOLE =====
function ajouterUtilisateur(firstName, lastName, email, password) {
    const nouvelId = usersData.bénévoles.length > 0
        ? Math.max(...usersData.bénévoles.map(b => b.id)) + 1
        : 1;

    const nouvelUtilisateur = {
        id: nouvelId,
        firstName,
        lastName,
        maidenName: "",
        age: null,
        gender: "",
        email,
        phone: "",
        bénévolename: email.split("@")[0],
        password,
        birthDate: "",
        image: "",
        role: "user",
        actions_id: []
    };

    usersData.bénévoles.push(nouvelUtilisateur);
    localStorage.setItem("usersData", JSON.stringify(usersData));

    return nouvelUtilisateur;
}

// ===== INITIALISATION =====
document.addEventListener("DOMContentLoaded", () => {
    chargerUtilisateurs();
});

