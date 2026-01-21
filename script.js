/* * FICHIER : script.js
 * Ce fichier gère la carte interactive (Leaflet) et le formulaire d'ajout.
 */

// On déclare la variable 'map' en global pour qu'elle soit accessible partout
var map = null;

// On attend que la page soit totalement chargée pour initialiser la carte
document.addEventListener("DOMContentLoaded", function() {
    
    // --- PARTIE 1 : INITIALISATION DE LA CARTE ---
    
    // Sécurité : on vérifie si la div 'map' existe avant de lancer le code
    var mapElement = document.getElementById('map');
    
    if (mapElement) {
        // 1. Création de la carte centrée sur la Rade de Brest
        map = L.map('map').setView([48.35, -4.48], 11);

        // 2. Ajout du fond de carte (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // 3. Liste des points initiaux (Les événements déjà prévus)
        var locations = [
            { lat: 48.3908, lng: -4.4357, title: "Plage du Moulin Blanc" },
            { lat: 48.3394, lng: -4.6122, title: "Pointe du Petit Minou" },
            { lat: 48.3765, lng: -4.3640, title: "Port de Plougastel" },
            { lat: 48.2754, lng: -4.5977, title: "Anse de Camaret" },
            { lat: 48.3585, lng: -4.5705, title: "Technopôle Brest-Iroise" }
        ];

        // Boucle pour placer les marqueurs initiaux
        locations.forEach(function(loc) {
            L.marker([loc.lat, loc.lng])
             .addTo(map)
             .bindPopup("<b>" + loc.title + "</b><br>Rendez-vous ici !");
        });

        // Petit fix pour s'assurer que la carte s'affiche correctement
        setTimeout(function(){ map.invalidateSize(); }, 500);
    }
});


// --- PARTIE 2 : LES FONCTIONS INTERACTIVES ---

/**
 * Fonction appelée quand on clique sur une annonce dans la liste de droite
 * Zoom sur le point correspondant
 */
function focusMap(lat, lng, title) {
    if (map) {
        // Animation de vol vers le point
        map.flyTo([lat, lng], 14, {
            animate: true,
            duration: 1.5
        });
        
        // Ouvre une bulle d'info
        L.popup()
          .setLatLng([lat, lng])
          .setContent("<b>" + title + "</b>")
          .openOn(map);
          
        // Remonte légèrement vers la carte si on est sur mobile
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

/**
 * Fonction appelée par le formulaire "Proposer un Spot" (Étape 4)
 * Ajoute un nouveau point dynamiquement sur la carte
 */
function ajouterPointSurCarte() {
    // 1. Récupération des valeurs
    var nom = document.getElementById('inputName').value;
    var lat = parseFloat(document.getElementById('inputLat').value);
    var lng = parseFloat(document.getElementById('inputLng').value);
    var type = document.getElementById('inputType').value;

    // 2. Vérification des erreurs
    if (nom === "" || isNaN(lat) || isNaN(lng)) {
        alert("Attention : Le nom ou les coordonnées sont manquants !");
        return;
    }

    if (!map) {
        alert("Erreur : La carte n'est pas chargée.");
        return;
    }

    // 3. Ajout du marqueur
    var newMarker = L.marker([lat, lng]).addTo(map);
    
    newMarker.bindPopup(
        "<b>" + nom + "</b><br>" +
        "Type: " + type + "<br>" +
        "<em style='color:green'>Nouveau signalement !</em>"
    ).openPopup();

    // 4. Zoom sur le nouveau point
    map.flyTo([lat, lng], 14);

    // 5. Feedback utilisateur
    alert("Super ! Le spot '" + nom + "' a été ajouté.");

    // 6. On remonte vers la carte pour voir le résultat
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // 7. Nettoyage du formulaire
    document.getElementById('inputName').value = "";
    document.getElementById('inputLat').value = "";
    document.getElementById('inputLng').value = "";
    document.getElementById('inputType').selectedIndex = 0;
}