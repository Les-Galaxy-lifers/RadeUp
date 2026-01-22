/* * FICHIER : script.js
 * Chemins mis à jour : BDD/data.json et forms/save_event.php
 */

var mainMap = null;
var miniMap = null;
var selectionMarker = null;

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        mainMap = L.map('map').setView([48.35, -4.48], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);

        // Chargement initial
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


// --- CHARGEMENT DES DONNÉES ---
function loadEvents() {
    // Nettoyage liste
    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) listeContainer.innerHTML = "";
    
    if(mainMap) {
        mainMap.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) mainMap.removeLayer(layer);
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);
    }

    // --- CHEMIN MIS À JOUR : BDD/ ---
    fetch('BDD/data.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            data.forEach(event => {
                afficherEvenement(event);
            });
            updateCompteur();
        })
        .catch(error => console.error("Erreur chargement (Vérifiez le dossier BDD):", error));
}


// --- AFFICHAGE (LECTURE DU JSON) ---
function afficherEvenement(event) {
    // Lecture adaptée à ta structure JSON précise
    var lat = event.address.coordinates.lat;
    var lng = event.address.coordinates.lng;
    
    var title = event.name;
    var orga = event.creator_name || "Anonyme";
    var type = event.type || "Action";
    var level = event.difficulty || "Tous niveaux";
    var nbParticipants = event.participants ? event.participants.length : 0;

    var dateObj = new Date(event.start_date);
    var dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + " à " + dateObj.getHours() + "h";

    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 
    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; }

    // Marker
    var marker = L.marker([lat, lng]).addTo(mainMap);
    var popupContent = `
        <b>${title}</b><br>
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


// --- AJOUT (ENVOI VERS forms/save_event.php) ---
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

    // Structure stricte pour respecter ton JSON
    var newEvent = {
        name: nom,
        address: {
            address: "Lieu indiqué sur carte",
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

    // --- CHEMIN MIS À JOUR : forms/ ---
    fetch('forms/save_event.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
    })
    .then(response => response.json())
    .then(data => {
        alert("Événement sauvegardé avec succès !");
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
        alert("Erreur lors de la communication avec le dossier 'forms/'. Vérifiez votre serveur.");
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