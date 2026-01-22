/* * FICHIER : script.js
 * Gère la Grande Carte, la Mini-Map, l'ajout dynamique et le COMPTEUR d'actions.
 */

// Variables globales
var mainMap = null; // Grande carte du haut
var miniMap = null; // Petite carte du formulaire
var selectionMarker = null; // Marqueur rouge sur la mini-map

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION DE LA CARTE PRINCIPALE (HAUT) ---
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
        
        // Fix affichage
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }

    // --- 2. INITIALISATION DE LA MINI-CARTE (FORMULAIRE) ---
    var miniMapElement = document.getElementById('mini-map');

    if (miniMapElement) {
        miniMap = L.map('mini-map').setView([48.35, -4.48], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(miniMap);

        // -- GESTION DU CLIC SUR LA MINI-CARTE --
        miniMap.on('click', function(e) {
            var lat = e.latlng.lat.toFixed(4);
            var lng = e.latlng.lng.toFixed(4);

            var latInput = document.getElementById('inputLat');
            var lngInput = document.getElementById('inputLng');
            
            if (latInput && lngInput) {
                latInput.value = lat;
                lngInput.value = lng;
                var feedback = document.getElementById('location-feedback');
                if(feedback) feedback.style.display = 'block';
            }

            if (selectionMarker) {
                miniMap.removeLayer(selectionMarker);
            }

            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });

            selectionMarker = L.marker([lat, lng], {icon: redIcon}).addTo(miniMap);
            selectionMarker.bindPopup("Position sélectionnée").openPopup();
        });
        
        // Fix survol (carré gris)
        miniMapElement.addEventListener('mouseover', function() {
            miniMap.invalidateSize();
        });
        setTimeout(function(){ miniMap.invalidateSize(); }, 1000);
    }

    // --- 3. MISE À JOUR INITIALE DU COMPTEUR ---
    updateCompteur();
});


// --- 4. FONCTIONS GLOBALES ---

// NOUVELLE FONCTION : Compte les éléments et met à jour l'affichage
function updateCompteur() {
    // On sélectionne tous les items de la liste
    var items = document.querySelectorAll('.features-list .feature-item');
    var count = items.length;

    // On sélectionne l'endroit où afficher le chiffre (la classe .years)
    var counterDisplay = document.querySelector('.experience-box .years');
    
    // On met à jour le texte et on ajoute une petite animation
    if (counterDisplay) {
        counterDisplay.innerText = count;
        // Petit effet visuel pour montrer que ça change
        counterDisplay.style.transition = "transform 0.2s";
        counterDisplay.style.transform = "scale(1.3)";
        setTimeout(() => { counterDisplay.style.transform = "scale(1)"; }, 200);
    }
}

// Fonction de zoom sur la carte
function focusMap(lat, lng, title) {
    if (mainMap) {
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        L.popup().setLatLng([lat, lng]).setContent("<b>" + title + "</b>").openOn(mainMap);
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

// Fonction PRINCIPALE : Ajoute le point
function ajouterPointSurCarte() {
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

    // Formatage Date
    var dateObj = new Date(dateValue);
    var dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + ", " + dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

    // Style
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

    // Ajout Liste HTML
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
        
        // --- MISE À JOUR DU COMPTEUR ---
        updateCompteur(); // On recalcule le total ici !
    }

    alert("C'est validé !");
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // Reset Form
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