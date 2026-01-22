/* * FICHIER : script.js
 * SOLUTION HYBRIDE : JSON (Fixe) + LOCALSTORAGE (Dynamique)
 * Compatible GitHub Pages
 */

var mainMap = null;
var miniMap = null;
var selectionMarker = null;

// --- NOUVELLE VARIABLE : Pour retenir le choix de l'utilisateur ---
var missionSelectionnee = null; 

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        mainMap = L.map('map').setView([48.35, -4.48], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);

        loadEvents();
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }

    // --- 2. INITIALISATION MINI-MAP (Formulaire) ---
    var miniMapElement = document.getElementById('mini-map');
    if (miniMapElement) {
        miniMap = L.map('mini-map').setView([48.35, -4.48], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);

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


// --- CHARGEMENT HYBRIDE ---
function loadEvents() {
    // Nettoyage de l'interface (Attention: cela efface le HTML en dur si présent)
    var listeContainer = document.querySelector('.features-list');
    
    // Si la liste est vide (pas de HTML en dur), on ne fait rien, sinon on la vide pour le chargement JS
    // Pour ton cas, si tu veux garder le HTML en dur + le JSON, commente la ligne ci-dessous :
    if(listeContainer) listeContainer.innerHTML = "";
    
    if(mainMap) {
        mainMap.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) mainMap.removeLayer(layer);
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);
    }

    fetch('BDD/data.json')
        .then(response => response.json())
        .then(data => {
            if (data.actions) {
                data.actions.forEach(event => {
                    afficherEvenement(event);
                });
            }
            chargerDonneesLocales();
            updateCompteur();
        })
        .catch(error => {
            console.error("Erreur JSON (ou fichier absent):", error);
            chargerDonneesLocales();
            updateCompteur();
        });
}

function chargerDonneesLocales() {
    var saved = localStorage.getItem('myHybridEvents');
    if (saved) {
        var events = JSON.parse(saved);
        events.forEach(event => afficherEvenement(event));
    }
}


// --- AFFICHAGE ---
function afficherEvenement(event) {
    if (!event.address || !event.address.coordinates) return;

    var lat = event.address.coordinates.lat;
    var lng = event.address.coordinates.lng;
    var title = event.name;
    var orga = event.creator_name || "Bénévole";
    var type = event.type || "Action";
    var level = event.difficulty || "Tous niveaux";
    var nbParticipants = event.participants ? event.participants.length : 0;

    var dateFormatted = "Date à définir";
    if (event.start_date) {
        var dateObj = new Date(event.start_date);
        if (!isNaN(dateObj.getTime())) {
            dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + 
                            " à " + 
                            dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        }
    }

    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 
    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; }

    // On s'assure que le clic sur le marqueur sélectionne aussi la mission
    var marker = L.marker([lat, lng]).addTo(mainMap);
    var popupContent = `<b>${title}</b><br>📅 ${dateFormatted}<br><span class="badge ${badgeClass}">${type}</span>`;
    marker.bindPopup(popupContent);
    
    // Ajout d'un événement clic sur le marqueur pour sélectionner la mission
    marker.on('click', function() {
        missionSelectionnee = title; // On retient le titre
    });

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

// --- AJOUT D'UN POINT ---
function ajouterPointSurCarte() {
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

    var newEvent = {
        name: nom,
        address: { address: "Lieu ajouté (Local)", coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) } },
        start_date: dateValue,
        participants: [],
        creator_name: orga,
        type: type,
        difficulty: niveau
    };

    var existingEvents = localStorage.getItem('myHybridEvents');
    var eventsArray = existingEvents ? JSON.parse(existingEvents) : [];
    eventsArray.push(newEvent);
    localStorage.setItem('myHybridEvents', JSON.stringify(eventsArray));

    alert("✅ Action ajoutée avec succès !");
    loadEvents(); 
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    document.getElementById('inputName').value = "";
    document.getElementById('inputLat').value = "";
    document.getElementById('inputLng').value = "";
    document.getElementById('inputTime').value = "";
    document.getElementById('inputOrg').value = "";
    if (selectionMarker) { miniMap.removeLayer(selectionMarker); selectionMarker = null; }
}

// --- GLOBALES & LOGIQUE D'INSCRIPTION ---

function updateCompteur() {
    var count = document.querySelectorAll('.features-list .feature-item').length;
    var display = document.querySelector('.experience-box .years');
    if (display) {
        display.innerText = count;
    }
}

// MODIFICATION IMPORTANTE ICI : On enregistre la sélection
// MODIFICATION : Ouvre la VRAIE bulle du marqueur
function focusMap(lat, lng, title) {
    // 1. On mémorise la mission choisie (pour l'inscription)
    missionSelectionnee = title;
    
    if (mainMap) {
        // 2. On zoome vers le point
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        
        // 3. On cherche le marqueur correspondant sur la carte pour l'ouvrir
        // On parcourt tous les calques de la carte
        mainMap.eachLayer(function(layer) {
            // Si le calque est un Marqueur ET qu'il a des coordonnées
            if (layer instanceof L.Marker && layer.getLatLng) {
                var markerLoc = layer.getLatLng();
                
                // On compare les coordonnées (avec une petite marge d'erreur pour les décimales)
                // Si ça correspond à notre clic dans la liste...
                if (Math.abs(markerLoc.lat - lat) < 0.0001 && Math.abs(markerLoc.lng - lng) < 0.0001) {
                    // ... On ouvre SA bulle (qui contient déjà toutes les infos complètes)
                    layer.openPopup();
                }
            }
        });

        // 4. On scroll vers la carte
        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

// NOUVELLE FONCTION : Vérification de l'inscription
function gererInscription() {
    if (missionSelectionnee === null) {
        // Cas 1 : Rien n'est sélectionné
        alert("⚠️ Veuillez d'abord sélectionner une mission dans la liste ou sur la carte.");
    } else {
        // Cas 2 : Une mission est sélectionnée
        alert("✅ Félicitations !\n\nVous êtes bien inscrit à la mission :\n" + missionSelectionnee + "\n\nVous recevrez les détails par mail.");
        // Optionnel : On peut remettre à zéro après l'inscription
        // missionSelectionnee = null; 
    }
}