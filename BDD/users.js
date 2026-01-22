// Données utilisateurs
let usersData = {
  "users": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "login": "admin@mail.com",
      "password": "1234"
    },
    {
      "id": 2,
      "nom": "Martin",
      "prenom": "Alice",
      "login": "user@mail.com",
      "password": "user123"
    }
  ]
};

// Fonction pour ajouter un utilisateur
function ajouterUtilisateur(nom, prenom, email, password) {
    const nouvelId = usersData.users.length > 0 
        ? Math.max(...usersData.users.map(u => u.id)) + 1 
        : 1;
    
    const nouvelUtilisateur = {
        id: nouvelId,
        nom: nom,
        prenom: prenom,
        login: email,
        password: password
    };
    
    usersData.users.push(nouvelUtilisateur);
    
    // Sauvegarde dans localStorage
    localStorage.setItem('usersData', JSON.stringify(usersData));
    
    return nouvelUtilisateur;
}

// Charger les données sauvegardées au démarrage
const savedData = localStorage.getItem('usersData');
if (savedData) {
    usersData = JSON.parse(savedData);
}