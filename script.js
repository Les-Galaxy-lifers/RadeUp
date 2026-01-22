/* * FICHIER : script.js
 * Compatible avec le format JSON : { "actions": [ ... ] }
 */

var mainMap = null;
var miniMap = null;
var selectionMarker = null;

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        mainMap = L.map('map').setView([48.35, -4.48], 10); // Zoom 10 pour voir toute la rade
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);

        loadEvents();
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }

    // --- 2. INITIALISATION MINI-MAP ---
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


// --- CHARGEMENT ---
function loadEvents() {
    // Nettoyage
    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) listeContainer.innerHTML = "";
    
    if(mainMap) {
        mainMap.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) mainMap.removeLayer(layer);
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);
    }

    // Appel BDD
    fetch('BDD/data.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            // --- CORRECTION ICI : On cible data.actions ---
            if (data.actions) {
                data.actions.forEach(event => {
                    afficherEvenement(event);
                });
                updateCompteur();
            } else {
                console.error("Format JSON incorrect : Pas de clé 'actions' trouvée.");
            }
        })
        .catch(error => console.error("Erreur chargement:", error));
}


// --- AFFICHAGE ---
function afficherEvenement(event) {
    // Chemins adaptés à ton JSON
    var lat = event.address.coordinates.lat;
    var lng = event.address.coordinates.lng;
    var title = event.name;
    var orga = event.creator_name || "EcoBreizh";
    var type = event.type || "Action";
    var level = event.difficulty || "Modérée";
    var nbParticipants = event.participants ? event.participants.length : 0;

    var dateObj = new Date(event.start_date);
    var dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'});

    // Styles
    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 
    if (type.includes("Nettoyage")) { iconClass = "bi-trash"; badgeClass = "bg-primary"; }
    else if (type.includes("Collecte")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; }
    else if (type.includes("Réunion")) { iconClass = "bi-people"; badgeClass = "bg-info text-dark"; }
    else if (type.includes("Inspection")) { iconClass = "bi-search"; badgeClass = "bg-warning text-dark"; }

    // Marker
    var marker = L.marker([lat, lng]).addTo(mainMap);
    var popupContent = `
        <b>${title}</b><br>
        📍 ${event.address.address}<br>
        📅 ${dateFormatted}<br>
        👥 ${nbParticipants} participants<br>
        <span class="badge ${badgeClass}">${type}</span>
    `;
    marker.bindPopup(popupContent);

    // Liste
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


// --- AJOUT (ENVOI PHP) ---
function ajouterPointSurCarte() {
    var nom = document.getElementById('inputName').value;
    var lat = document.getElementById('inputLat').value;
    var lng = document.getElementById('inputLng').value;
    var type = document.getElementById('inputType').value;
    var niveau = document.getElementById('inputLevel').value;
    var dateValue = document.getElementById('inputTime').value; 
    var orga = document.getElementById('inputOrg').value;

    if (nom === "" || lat === "" || lng === "" || dateValue === "") {
        alert("Champs manquants !"); return;
    }

    // Structure objet adaptée à ton JSON
    var newEvent = {
        name: nom,
        address: {
            address: "Lieu ajouté par utilisateur",
            coordinates: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            }
        },
        start_date: dateValue,
        participants: [],
        creator: 99,
        creator_name: orga,
        type: type,
        difficulty: niveau,
        comments: []
    };

    fetch('forms/save_event.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
    })
    .then(response => response.json())
    .then(data => {
        alert("Événement ajouté !");
        loadEvents(); 
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});
        
        // Reset
        document.getElementById('inputName').value = "";
        document.getElementById('inputLat').value = "";
        document.getElementById('inputLng').value = "";
        document.getElementById('inputTime').value = "";
        document.getElementById('inputOrg').value = "";
        if (selectionMarker) { miniMap.removeLayer(selectionMarker); selectionMarker = null; }
    })
    .catch((error) => {
        console.error('Erreur:', error);
        alert("Erreur serveur (vérifiez le PHP).");
    });
}


// --- GLOBALES ---
function updateCompteur() {
    var count = document.querySelectorAll('.features-list .feature-item').length;
    var display = document.querySelector('.experience-box .years');
    if (display) display.innerText = count;
}

function focusMap(lat, lng, title) {
    if (mainMap) {
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        L.popup().setLatLng([lat, lng]).setContent("<b>" + title + "</b>").openOn(mainMap);
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}