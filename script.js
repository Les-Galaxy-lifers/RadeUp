/* * FICHIER : script.js
 * Chargement des données JSON détaillées + Gestion Carte + Compteur
 */

var mainMap = null;
var miniMap = null;
var selectionMarker = null;

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION DE LA CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        mainMap = L.map('map').setView([48.35, -4.48], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(mainMap);

        // CHARGEMENT DU FICHIER JSON COMPLEXE
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                data.forEach(event => {
                    ajouterEvenementInitial(event);
                });
                // Mise à jour du compteur global (Total actions)
                updateCompteur();
            })
            .catch(error => {
                console.error("Erreur JSON:", error);
                alert("Pour voir les données, lancez le site via Live Server (VS Code).");
            });
            
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }

    // --- 2. INITIALISATION MINI-MAP (Code standard) ---
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


// --- 3. FONCTION D'AFFICHAGE DU JSON (Adaptée au nouveau format) ---
function ajouterEvenementInitial(event) {
    // Lecture des champs imbriqués
    var lat = event.address.coordinates.lat;
    var lng = event.address.coordinates.lng;
    
    var title = event.name;
    var city = event.address.city; // On récupère la ville
    var orga = event.creator_name || "Bénévole";
    
    // On garde les champs UI
    var type = event.type || "Action";
    var level = event.difficulty || "Tous niveaux";
    
    // Calcul du nombre de participants (Bonus)
    var nbParticipants = event.participants ? event.participants.length : 0;

    // Formatage Date
    var dateObj = new Date(event.start_date);
    var dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + " à " + dateObj.getHours() + "h";

    // Gestion des styles (Couleurs)
    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 

    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; }

    // A. Ajout Marqueur Carte
    var marker = L.marker([lat, lng]).addTo(mainMap);
    var popupContent = `
        <b>${title}</b><br>
        📍 ${city}<br>
        📅 ${dateFormatted}<br>
        👥 ${nbParticipants} participants<br>
        <span class="badge ${badgeClass}">${type}</span>
    `;
    marker.bindPopup(popupContent);

    // B. Ajout Liste HTML
    var htmlItem = `
        <div class="feature-item cursor-pointer" onclick="focusMap(${lat}, ${lng}, '${title.replace(/'/g, "\\'")}')">
          <div class="icon-box"><i class="bi ${iconClass}"></i></div>
          <div class="text">
            <h4>${title}</h4>
            <p>
                <strong>${dateFormatted}</strong> - Org: ${orga}<br>
                <span class="badge ${badgeClass}">${type}</span> 
                <small class="text-muted ms-2">(${level})</small>
            </p>
          </div>
        </div>
    `;

    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) {
        listeContainer.insertAdjacentHTML('beforeend', htmlItem);
    }
}


// --- 4. FONCTIONS GLOBALES ---

function updateCompteur() {
    var count = document.querySelectorAll('.features-list .feature-item').length;
    var counterDisplay = document.querySelector('.experience-box .years');
    if (counterDisplay) {
        counterDisplay.innerText = count;
        // Animation
        counterDisplay.style.transition = "transform 0.2s";
        counterDisplay.style.transform = "scale(1.3)";
        setTimeout(() => { counterDisplay.style.transform = "scale(1)"; }, 200);
    }
}

function focusMap(lat, lng, title) {
    if (mainMap) {
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        L.popup().setLatLng([lat, lng]).setContent("<b>" + title + "</b>").openOn(mainMap);
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

// Fonction Ajout Manuel (Utilisateur)
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

    if (!mainMap) return;

    var dateObj = new Date(dateValue);
    var dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + ", " + dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 
    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; } 
    else if (type.includes("Afterwork")) { iconClass = "bi-cup-straw"; badgeClass = "bg-secondary"; }

    // Ajout Carte (Manuel)
    var newMarker = L.marker([lat, lng]).addTo(mainMap);
    var popupMapContent = `<b>${nom}</b><br>📅 ${dateFormatted}<br><span class="badge ${badgeClass}">${type}</span>`;
    newMarker.bindPopup(popupMapContent).openPopup();
    mainMap.flyTo([lat, lng], 14);

    // Ajout Liste (Manuel)
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
    if(listeContainer) {
        listeContainer.insertAdjacentHTML('afterbegin', htmlItem);
        updateCompteur();
    }

    alert("C'est validé !");
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // Reset
    document.getElementById('inputName').value = "";
    document.getElementById('inputLat').value = "";
    document.getElementById('inputLng').value = "";
    document.getElementById('inputTime').value = "";
    document.getElementById('inputOrg').value = "";
    
    if (selectionMarker) {
        miniMap.removeLayer(selectionMarker);
        selectionMarker = null;
    }
}