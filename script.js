/* * FICHIER : script.js
 * Gère la Grande Carte, la Géolocalisation ET la sélection manuelle.
 */

// Variables globales
var mainMap = null; 
var isSelectionMode = false; // NOUVEAU : Pour savoir si on est en train de choisir un point
var tempMarker = null; // Marqueur temporaire rouge

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION DE LA CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        mainMap = L.map('map').setView([48.35, -4.48], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(mainMap);

        // Points initiaux
        var locations = [
            { lat: 48.3908, lng: -4.4357, title: "Plage du Moulin Blanc" },
            { lat: 48.3394, lng: -4.6122, title: "Pointe du Petit Minou" },
            { lat: 48.3765, lng: -4.3640, title: "Port de Plougastel" },
            { lat: 48.2754, lng: -4.5977, title: "Anse de Camaret" },
            { lat: 48.3585, lng: -4.5705, title: "Technopôle Brest-Iroise" }
        ];

        locations.forEach(function(loc) {
            L.marker([loc.lat, loc.lng]).addTo(mainMap)
             .bindPopup("<b>" + loc.title + "</b><br>Rendez-vous ici !");
        });

        // --- GESTION DU CLIC SUR LA GRANDE CARTE ---
        // C'est ici que la magie opère pour la sélection manuelle
        mainMap.on('click', function(e) {
            // On ne fait quelque chose QUE si le mode sélection est activé via le bouton
            if (isSelectionMode) {
                var lat = e.latlng.lat.toFixed(4);
                var lng = e.latlng.lng.toFixed(4);

                // 1. Remplir le formulaire
                document.getElementById('inputLat').value = lat;
                document.getElementById('inputLng').value = lng;
                
                // 2. Feedback visuel (Marqueur rouge)
                if (tempMarker) mainMap.removeLayer(tempMarker);
                
                var redIcon = new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });

                tempMarker = L.marker([lat, lng], {icon: redIcon}).addTo(mainMap);
                tempMarker.bindPopup("<b>Lieu sélectionné</b><br>Coordonnées copiées !").openPopup();

                // 3. Fin du mode sélection
                isSelectionMode = false;
                document.getElementById('map').style.cursor = ''; // Curseur normal
                
                // 4. On redescend vers le formulaire
                document.getElementById('location-feedback').style.display = 'block';
                document.getElementById('map-instruction').style.display = 'none';
                
                // Petit délai pour laisser voir le point rouge avant de scroller
                setTimeout(() => {
                    document.getElementById('steps').scrollIntoView({behavior: 'smooth'});
                }, 800);
            }
        });
        
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }
});


// --- 2. FONCTIONS DE LOCALISATION ---

// Option A : GÉOLOCALISATION GPS
function getUserLocation() {
    // Reset
    document.getElementById('map-instruction').style.display = 'none';
    isSelectionMode = false;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById('inputLat').value = position.coords.latitude.toFixed(5);
            document.getElementById('inputLng').value = position.coords.longitude.toFixed(5);
            document.getElementById('location-feedback').style.display = 'block';
        }, function(error) {
            alert("Erreur GPS ou refus. Essayez le bouton 'Sur la carte'.");
        });
    } else {
        alert("GPS non supporté.");
    }
}

// Option B : SÉLECTION SUR CARTE
function activerSelectionCarte() {
    // 1. On active le mode "Écoute du clic"
    isSelectionMode = true;
    
    // 2. On change le curseur de la carte pour montrer qu'on peut cliquer
    document.getElementById('map').style.cursor = 'crosshair';

    // 3. On affiche les instructions
    document.getElementById('map-instruction').style.display = 'block';
    document.getElementById('location-feedback').style.display = 'none';

    // 4. On remonte vers la carte automatiquement
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});
    
    // Petit message pour l'utilisateur
    alert("Cliquez maintenant sur le lieu exact sur la carte.");
}


// --- 3. FONCTIONS GLOBALES ---

function focusMap(lat, lng, title) {
    if (mainMap) {
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        L.popup().setLatLng([lat, lng]).setContent("<b>" + title + "</b>").openOn(mainMap);
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

function ajouterPointSurCarte() {
    // Récupération des données
    var nom = document.getElementById('inputName').value;
    var lat = document.getElementById('inputLat').value;
    var lng = document.getElementById('inputLng').value;
    var type = document.getElementById('inputType').value;
    var niveau = document.getElementById('inputLevel').value;
    var dateValue = document.getElementById('inputTime').value; 
    var orga = document.getElementById('inputOrg').value;

    if (nom === "" || lat === "" || lng === "" || dateValue === "" || orga === "") {
        alert("Merci de remplir tous les champs !");
        return;
    }

    if (!mainMap) return;

    // Nettoyage marqueur temporaire rouge s'il existe
    if (tempMarker) {
        mainMap.removeLayer(tempMarker);
        tempMarker = null;
    }

    // Formatage
    var dateObj = new Date(dateValue);
    var dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + ", " + dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 

    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; } 
    else if (type.includes("Afterwork")) { iconClass = "bi-cup-straw"; badgeClass = "bg-secondary"; }

    // Ajout Carte
    var newMarker = L.marker([lat, lng]).addTo(mainMap);
    var popupMapContent = `<b>${nom}</b><br>📅 ${dateFormatted}<br><span class="badge ${badgeClass}">${type}</span>`;
    newMarker.bindPopup(popupMapContent).openPopup();
    mainMap.flyTo([lat, lng], 14);

    // Ajout Liste
    var htmlItem = `
        <div class="feature-item cursor-pointer" onclick="focusMap(${lat}, ${lng}, '${nom.replace(/'/g, "\\'")}')">
          <div class="icon-box"><i class="bi ${iconClass}"></i></div>
          <div class="text">
            <h4>${nom}</h4>
            <p><strong>${dateFormatted}</strong> - Org: ${orga}<br>
            <span class="badge ${badgeClass}">${type}</span> <small>${niveau}</small></p>
          </div>
        </div>
    `;

    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) listeContainer.insertAdjacentHTML('afterbegin', htmlItem);

    // Feedback
    alert("Action ajoutée !");
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // Reset Form
    document.getElementById('inputName').value = "";
    document.getElementById('inputLat').value = "";
    document.getElementById('inputLng').value = "";
    document.getElementById('inputTime').value = "";
    document.getElementById('inputOrg').value = "";
    document.getElementById('location-feedback').style.display = 'none';
}