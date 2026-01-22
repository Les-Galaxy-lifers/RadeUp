/* * FICHIER : script.js
 * SOLUTION HYBRIDE : JSON (Fixe) + LOCALSTORAGE (Dynamique)
 * Compatible GitHub Pages
 */

// --- VARIABLES GLOBALES ---
var mainMap = null;
var miniMap = null;
var selectionMarker = null;

// Variable pour l'inscription (Retient la mission cliquée)
var missionSelectionnee = null; 

// REGISTRE DES MARQUEURS (Important pour lier la liste à la carte)
var markersList = {}; 

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. INITIALISATION CARTE PRINCIPALE ---
    var mainMapElement = document.getElementById('map');
    
    if (mainMapElement) {
        // Centrage sur la Rade de Brest
        mainMap = L.map('map').setView([48.35, -4.48], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);

        // Chargement des données
        loadEvents();
        
        // Petit fix pour s'assurer que la carte s'affiche bien
        setTimeout(function(){ mainMap.invalidateSize(); }, 500);
    }

    // --- 2. INITIALISATION MINI-MAP (Formulaire "Proposer un spot") ---
    var miniMapElement = document.getElementById('mini-map');
    if (miniMapElement) {
        miniMap = L.map('mini-map').setView([48.35, -4.48], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(miniMap);

        miniMap.on('click', function(e) {
            var lat = e.latlng.lat.toFixed(4);
            var lng = e.latlng.lng.toFixed(4);
            
            // Remplissage automatique des champs latitude/longitude
            document.getElementById('inputLat').value = lat;
            document.getElementById('inputLng').value = lng;
            
            var fb = document.getElementById('location-feedback');
            if(fb) fb.style.display = 'block';

            // Gestion du marqueur sur la mini-carte
            if (selectionMarker) miniMap.removeLayer(selectionMarker);
            
            // --- MODIFICATION : Marqueur VERT pour la proposition de lieu ---
            var customIcon = new L.Icon({
                iconUrl: 'assets/img/marker.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], 
                iconAnchor: [12, 41], 
                popupAnchor: [1, -34], 
                shadowSize: [41, 41]
            });
            
            selectionMarker = L.marker([lat, lng], {icon: customIcon}).addTo(miniMap);
        });
        
        miniMapElement.addEventListener('mouseover', function() { miniMap.invalidateSize(); });
    }
});


// --- FONCTION CŒUR : CHARGEMENT HYBRIDE ---
function loadEvents() {
    // 1. Nettoyage de la liste HTML
    var listeContainer = document.querySelector('.features-list');
    if(listeContainer) listeContainer.innerHTML = "";
    
    // 2. Nettoyage de la carte et du registre
    if(mainMap) {
        mainMap.eachLayer(function (layer) {
            if (!!layer.toGeoJSON) mainMap.removeLayer(layer);
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mainMap);
        markersList = {}; // On vide le registre des marqueurs
    }

    // 3. Charger les données du fichier JSON (Le "Socle")
    fetch('BDD/data.json')
        .then(response => response.json())
        .then(data => {
            if (data.actions) {
                data.actions.forEach(event => {
                    afficherEvenement(event);
                });
            }
            
            // 4. Charger les données du LocalStorage (Les "Ajouts")
            chargerDonneesLocales();
            
            // 5. Mettre à jour le compteur
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
        // Vérification : est-ce une date valide ?
        if (!isNaN(dateObj.getTime())) {
            dateFormatted = dateObj.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) + 
                            " à " + 
                            dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        }
    }

    // Couleurs et Icônes selon le type
    var iconClass = "bi-trash"; 
    var badgeClass = "bg-primary"; 
    if (type.includes("Urgent")) { iconClass = "bi-exclamation-triangle"; badgeClass = "bg-warning text-dark"; } 
    else if (type.includes("Sensibilisation")) { iconClass = "bi-info-circle"; badgeClass = "bg-info text-dark"; } 
    else if (type.includes("Tri")) { iconClass = "bi-recycle"; badgeClass = "bg-success"; }

    // --- A. CRÉATION DU MARQUEUR ---
    var marker = L.marker([lat, lng]).addTo(mainMap);
    var popupContent = `
        <b>${title}</b><br>
        📍 ${event.address.address}<br>
        📅 ${dateFormatted}<br>
        👥 ${nbParticipants} participants<br>
        <span class="badge ${badgeClass}">${type}</span>
    `;
    marker.bindPopup(popupContent);
    
    // Clic sur le marqueur = Sélection de la mission
    marker.on('click', function() {
        missionSelectionnee = title;
    });

    // IMPORTANT : On sauvegarde le marqueur dans le registre pour le retrouver via la liste
    markersList[title] = marker;

    // --- B. CRÉATION ÉLÉMENT LISTE ---
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
    loadEvents(); // On recharge tout
    document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});

    // 5. Reset du formulaire
    document.getElementById('inputName').value = "";
    document.getElementById('inputLat').value = "";
    document.getElementById('inputLng').value = "";
    document.getElementById('inputTime').value = "";
    document.getElementById('inputOrg').value = "";
    if (selectionMarker) { miniMap.removeLayer(selectionMarker); selectionMarker = null; }
}


// --- FONCTIONS GLOBALES & LOGIQUE MÉTIER ---

// Mise à jour du compteur (Nombre réel d'actions)
function updateCompteur() {
    // On compte simplement combien il y a d'éléments dans la liste
    var count = document.querySelectorAll('.features-list .feature-item').length;
    
    var display = document.querySelector('.experience-box .years');
    if (display) {
        // On affiche le chiffre brut (ex: 13)
        display.innerText = count;
    }
}

// Zoom sur la carte ET ouverture de la bulle correspondante
function focusMap(lat, lng, title) {
    // 1. On mémorise la mission choisie
    missionSelectionnee = title;
    
    if (mainMap) {
        // 2. On zoome
        mainMap.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        
        // 3. On récupère le marqueur exact dans notre registre
        var markerCible = markersList[title];
        
        if (markerCible) {
            // On ouvre la VRAIE bulle du marqueur
            markerCible.openPopup();
        } else {
            // Sécurité si non trouvé
            L.popup().setLatLng([lat, lng]).setContent("<b>" + title + "</b>").openOn(mainMap);
        }

        document.getElementById('map-section').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

// Vérification de l'inscription
function gererInscription() {
    if (missionSelectionnee === null) {
        // Cas 1 : Rien n'est sélectionné
        alert("⚠️ Veuillez d'abord sélectionner une mission dans la liste ou sur la carte.");
    } else {
        // Cas 2 : Une mission est sélectionnée
        alert("✅ Félicitations !\n\nVous êtes bien inscrit à la mission :\n" + missionSelectionnee + "\n\nVous recevrez les détails par mail.");
    }
}


/* --- GESTION DU BOUTON ALERTER (MODALE ROUGE) --- */

// Ouvrir le formulaire
function ouvrirModalAlerte() {
    var modal = document.getElementById("modalAlerte");
    if(modal) modal.style.display = "flex";
}

// Fermer le formulaire
function fermerModalAlerte() {
    var modal = document.getElementById("modalAlerte");
    if(modal) modal.style.display = "none";
}

// Simuler l'envoi de l'alerte
function envoyerAlerte(event) {
    // Empêche la page de se recharger
    event.preventDefault();
    
    // Récupération
    var loc = document.getElementById('alerteLocalisation').value;
    
    // Fermer la modale
    fermerModalAlerte();
    
    // Message de succès
    alert("🚨 SIGNALEMENT ENREGISTRÉ !\n\nMerci pour votre vigilance.\nLieu : " + loc + "\n\nNos équipes et la communauté sont informées.");
    
    // Vider le formulaire pour la prochaine fois
    document.getElementById('formAlerte').reset();
}

// Fermeture universelle au clic en dehors du cadre
window.onclick = function(event) {
    var modalAlerte = document.getElementById("modalAlerte");
    // Si on clique sur le fond gris de la modale Alerte
    if (modalAlerte && event.target == modalAlerte) {
        modalAlerte.style.display = "none";
    }
}