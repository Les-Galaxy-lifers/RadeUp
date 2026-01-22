/* * FICHIER : script.js
 * Ce fichier gère la carte interactive (Leaflet), le clic pour récupérer les coordonnées,
 * et le formulaire d'ajout complet.
 */

// Variables globales
var map = null;
var selectionMarker = null; // Pour stocker le marqueur rouge de sélection

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

        // Boucle pour placer les marqueurs initiaux (Bleus par défaut)
        locations.forEach(function(loc) {
            L.marker([loc.lat, loc.lng])
             .addTo(map)
             .bindPopup("<b>" + loc.title + "</b><br>Rendez-vous ici !");
        });

        // --- PARTIE 2 : LOGIQUE DU CLIC SUR LA CARTE (SÉLECTION) ---
        
        map.on('click', function(e) {
            // A. On récupère les coordonnées du clic (4 chiffres après la virgule)
            var lat = e.latlng.lat.toFixed(4);
            var lng = e.latlng.lng.toFixed(4);

            // B. On remplit les champs du formulaire (étape 02)
            var latInput = document.getElementById('inputLat');
            var lngInput = document.getElementById('inputLng');
            
            if (latInput && lngInput) {
                latInput.value = lat;
                lngInput.value = lng;
                
                // On affiche le petit message de succès vert si il existe
                var feedback = document.getElementById('location-feedback');
                if(feedback) feedback.style.display = 'block';
            }

            // C. Gestion du marqueur visuel ROUGE (Temporaire)
            
            // Si un marqueur de sélection existe déjà, on l'enlève pour n'en avoir qu'un seul
            if (selectionMarker) {
                map.removeLayer(selectionMarker);
            }

            // Définition de l'icône rouge pour bien la distinguer
            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            // On ajoute le nouveau marqueur rouge
            selectionMarker = L.marker([lat, lng], {icon: redIcon}).addTo(map);
            selectionMarker.bindPopup("<b>Nouveau Spot ici ?</b><br>Coordonnées copiées !").openPopup();
        });

        // Petit fix pour s'assurer que la carte s'affiche correctement
        setTimeout(function(){ map.invalidateSize(); }, 500);
    }
});


// --- PARTIE 3 : LES FONCTIONS GLOBALES ---

/**
 * Fonction appelée quand on clique sur une annonce dans la liste de droite
 */
function focusMap(lat, lng, title) {
    if (map) {
        map.flyTo([lat, lng], 14, {
            animate: true,
            duration: 1.5
        });
        
        L.popup()
          .setLatLng([lat, lng])
          .setContent("<b>" + title + "</b>")
          .openOn(map);
          
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

/**
 * Fonction appelée par le formulaire "Proposer un Spot" (Étape 4)
 * Ajoute un nouveau point BLEU définitif avec Type et Niveau
 */
function ajouterPointSurCarte() {
    // 1. Récupération des valeurs du formulaire
    var nom = document.getElementById('inputName').value;
    var lat = parseFloat(document.getElementById('inputLat').value);
    var lng = parseFloat(document.getElementById('inputLng').value);
    
    // On récupère les listes déroulantes
    var typeSelect = document.getElementById('inputType');
    var type = typeSelect ? typeSelect.value : "Non spécifié";

    var levelSelect = document.getElementById('inputLevel');
    var niveau = levelSelect ? levelSelect.value : "Non spécifié";

    // 2. Vérification des erreurs
    if (nom === "" || isNaN(lat) || isNaN(lng)) {
        alert("Attention : Le nom ou les coordonnées sont manquants ! Utilisez la carte pour cliquer un point.");
        return;
    }

    if (!map) {
        alert("Erreur : La carte n'est pas chargée.");
        return;
    }

    // 3. Ajout du marqueur définitif (Bleu par défaut)
    var newMarker = L.marker([lat, lng]).addTo(map);
    
    // On nettoie le marqueur rouge de sélection s'il est là
    if (selectionMarker) {
        map.removeLayer(selectionMarker);
        selectionMarker = null;
    }

    // 4. Contenu de la popup avec Type et Niveau
    var popupContent = `
        <b>${nom}</b><br>
        <span style="color:#0d6efd">Type: ${type}</span><br>
        <span style="color:#6c757d">Niveau: ${niveau}</span><br>
        <i>✅ Ajouté à l'instant</i>
    `;
    
    newMarker.bindPopup(popupContent).openPopup();

    // 5. Zoom sur le nouveau point
    map.flyTo([lat, lng], 14);

    // 6. Feedback utilisateur
    alert("Super ! Le spot '" + nom + "' a été ajouté à la carte.");

    // 7. On remonte vers la carte pour voir le résultat
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // 8. Nettoyage du champ Nom (on garde les coords au cas où)
    document.getElementById('inputName').value = "";
}