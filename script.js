/* * FICHIER : script.js
 * SOLUTION HYBRIDE : JSON (Fixe) + LOCALSTORAGE (Dynamique)
 * Compatible GitHub Pages
 */

var mainMap = null;
var miniMap = null;
var selectionMarker = null;

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        // Centrage sur la Rade de Brest
        mainMap = L.map('map').setView([48.35, -4.48], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);

        // Chargement des données (JSON + LocalStorage)
        loadEvents();
        
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }

    // --- 2. INITIALISATION MINI-MAP (Formulaire) ---
    var miniMapElement = document.getElementById('mini-map');
    if (miniMapElement) {
        miniMap = L.map('mini-map').setView([48.35, -4.48], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(miniMap);

        miniMap.on('click', function(e) {
            var lat = e.latlng.lat.toFixed(4);
            var lng = e.latlng.lng.toFixed(4);
            document.getElementById('inputLat').value = lat;
            document.getElementById('inputLng').value = lng;
            var fb = document.getElementById('location-feedback');
            if(fb) fb.style.display = 'block';

            if (selectionMarker) miniMap.removeLayer(selectionMarker);
            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });
            selectionMarker = L.marker([lat, lng], {icon: redIcon}).addTo(miniMap);
        });
        
        miniMapElement.addEventListener('mouseover', function() { miniMap.invalidateSize(); });
    }
});


// --- FONCTION CŒUR : CHARGEMENT HYBRIDE ---
function loadEvents() {
    // 1. Nettoyage de l'interface
    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) listeContainer.innerHTML = "";
    
    if(mainMap) {
        mainMap.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) mainMap.removeLayer(layer);
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);
    }

    // 2. Charger les données du fichier JSON (Le "Socle")
    fetch('BDD/data.json')
        .then(response => response.json())
        .then(data => {
            if (data.actions) {
                data.actions.forEach(event => {
                    afficherEvenement(event);
                });
            }
            
            // 3. Charger les données du LocalStorage (Les "Ajouts")
            chargerDonneesLocales();
            
            updateCompteur();
        })
        .catch(error => {
            console.error("Erreur JSON (ou fichier absent):", error);
            // Si le JSON plante, on charge quand même le local
            chargerDonneesLocales();
            updateCompteur();
        });
}

// Fonction pour lire la mémoire du navigateur
function chargerDonneesLocales() {
    var saved = localStorage.getItem('myHybridEvents');
    if (saved) {
        var events = JSON.parse(saved);
        events.forEach(event => afficherEvenement(event));
    }
}


// --- AFFICHAGE UNIFIÉ ---
function afficherEvenement(event) {
    // Protection contre les données incomplètes
    if (!event.address || !event.address.coordinates) return;

    var lat = event.address.coordinates.lat;
    var lng = event.address.coordinates.lng;
    var title = event.name;
    var orga = event.creator_name || "Bénévole";
    var type = event.type || "Action";
    var level = event.difficulty || "Tous niveaux";
    var nbParticipants = event.participants ? event.participants.length : 0;

    // Gestion de la Date et de l'Heure
    var dateFormatted = "Date à définir";
    
    if (event.start_date) {
        var dateObj = new Date(event.start_date);

        // Vérification de sécurité : est-ce une date valide ?
        if (!isNaN(dateObj.getTime())) {
            // Exemple de résultat : "25 mars à 14:30"
            dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + 
                            " à " + 
                            dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        }
    }

    // Couleurs et Icônes
    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 
    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; }

    // A. Marqueur sur la carte
    var marker = L.marker([lat, lng]).addTo(mainMap);
    var popupContent = `
        <b>${title}</b><br>
        📍 ${event.address.address}<br>
        📅 ${dateFormatted}<br>
        👥 ${nbParticipants} participants<br>
        <span class="badge ${badgeClass}">${type}</span>
    `;
    marker.bindPopup(popupContent);

    // B. Élément dans la liste
    var htmlItem = `
        <div class="feature-item cursor-pointer" onclick="focusMap(${lat}, ${lng}, '${title.replace(/'/g, "\\'")}')">
          <div class="icon-box"><i class="bi ${iconClass}"></i></div>
          <div class="text">
            <h4>${title}</h4>
            <p><strong>${dateFormatted}</strong> - Org: ${orga}<br>
            <span class="badge ${badgeClass}">${type}</span> <small class="text-muted">(${level})</small></p>
          </div>
        </div>
    `;

    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) listeContainer.insertAdjacentHTML('beforeend', htmlItem);
}


// --- AJOUT D'UN POINT (SAUVEGARDE LOCALE) ---
function ajouterPointSurCarte() {
    // 1. Récupération du formulaire
    var nom = document.getElementById('inputName').value;
    var lat = document.getElementById('inputLat').value;
    var lng = document.getElementById('inputLng').value;
    var type = document.getElementById('inputType').value;
    var niveau = document.getElementById('inputLevel').value;
    var dateValue = document.getElementById('inputTime').value; 
    var orga = document.getElementById('inputOrg').value;

    if (nom === "" || lat === "" || lng === "" || dateValue === "") {
        alert("Merci de remplir tous les champs !"); return;
    }

    // 2. Création de l'objet (Structure IDENTIQUE au JSON)
    var newEvent = {
        name: nom,
        address: {
            address: "Lieu ajouté (Local)",
            coordinates: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            }
        },
        start_date: dateValue,
        participants: [],
        creator_name: orga,
        type: type,
        difficulty: niveau
    };

    // 3. Sauvegarde dans le LocalStorage (La magie)
    var existingEvents = localStorage.getItem('myHybridEvents');
    var eventsArray = existingEvents ? JSON.parse(existingEvents) : [];
    
    eventsArray.push(newEvent);
    
    localStorage.setItem('myHybridEvents', JSON.stringify(eventsArray));

    // 4. Feedback
    alert("✅ Action ajoutée avec succès ! (Sauvegardée localement)");
    loadEvents(); // On recharge tout pour voir le nouveau point
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // 5. Reset
    document.getElementById('inputName').value = "";
    document.getElementById('inputLat').value = "";
    document.getElementById('inputLng').value = "";
    document.getElementById('inputTime').value = "";
    document.getElementById('inputOrg').value = "";
    if (selectionMarker) { miniMap.removeLayer(selectionMarker); selectionMarker = null; }
}


// --- GLOBALES ---
function updateCompteur() {
    var count = document.querySelectorAll('.features-list .feature-item').length;
    var display = document.querySelector('.experience-box .years');
    if (display) {
        display.innerText = count;
        // Animation pop
        display.style.transition = "transform 0.2s";
        display.style.transform = "scale(1.3)";
        setTimeout(() => { display.style.transform = "scale(1)"; }, 200);
    }
}

function focusMap(lat, lng, title) {
    if (mainMap) {
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        L.popup().setLatLng([lat, lng]).setContent("<b>" + title + "</b>").openOn(mainMap);
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}