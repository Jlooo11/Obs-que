// Données des lieux avec coordonnées (à adapter avec les vraies coordonnées GPS)
const lieux = {
    'marcory-gfci': {
        nom: 'Marcory GFCI - Face à la pharmacie Ebathe',
        lat: 5.3147,
        lng: -4.0507
    },
    'sainte-therese': {
        nom: 'Église Sainte Thérèse - Marcory',
        lat: 5.3200,
        lng: -4.0550
    },
    'abengourou': {
        nom: 'Abengourou - Lieu de levé de corps',
        lat: 6.7296,
        lng: -3.4964
    },
    'sankadiokro': {
        nom: 'Sankadiokro - Cérémonies traditionnelles',
        lat: 6.8000,
        lng: -3.5000
    }
};

// Données des hôtels
const hotels = {
    'hotel1': {
        nom: 'Hôtel Recommandé 1',
        description: 'Hôtel confortable à proximité des lieux de cérémonie',
        prix: '25,000 FCFA',
        contact: '+225 XX XX XX XX'
    },
    'hotel2': {
        nom: 'Hôtel Recommandé 2',
        description: 'Hôtel de standing avec tous les services',
        prix: '30,000 FCFA',
        contact: '+225 XX XX XX XX'
    }
};

// Initialisation quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    initialiserLocalisations();
    initialiserReservations();
    initialiserFormulairePresence();
    initialiserFormulairePagne();
});

// Gestion des localisations
function initialiserLocalisations() {
    const boutonsLocalisation = document.querySelectorAll('.btn-localisation');
    const modalCarte = document.getElementById('modal-carte');
    const spanFermer = modalCarte.querySelector('.close');
    const titreLieu = document.getElementById('titre-lieu');

    boutonsLocalisation.forEach(bouton => {
        bouton.addEventListener('click', function() {
            const lieuId = this.getAttribute('data-lieu');
            const lieu = lieux[lieuId];
            
            if (lieu) {
                titreLieu.textContent = lieu.nom;
                afficherCarte(lieu);
                modalCarte.style.display = 'block';
            }
        });
    });

    spanFermer.addEventListener('click', function() {
        modalCarte.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modalCarte) {
            modalCarte.style.display = 'none';
        }
    });
}

function afficherCarte(lieu) {
    const container = document.getElementById('carte-container');
    
    // Message temporaire - à remplacer par une vraie carte (Google Maps ou OpenStreetMap)
    container.innerHTML = `
        <div style="background: #f8f9fa; padding: 2rem; text-align: center; border-radius: 4px;">
            <h4 style="color: #1e3a5f; margin-bottom: 1rem;">Localisation: ${lieu.nom}</h4>
            <p style="margin-bottom: 1rem;">Coordonnées GPS:</p>
            <p style="font-family: monospace; background: #e9ecef; padding: 0.5rem; border-radius: 4px;">
                Latitude: ${lieu.lat}<br>
                Longitude: ${lieu.lng}
            </p>
            <p style="margin-top: 1rem; font-style: italic;">
                La carte interactive sera intégrée ici avec les vraies coordonnées GPS
            </p>
        </div>
    `;
}

// Gestion des réservations d'hôtel
function initialiserReservations() {
    const boutonsReserver = document.querySelectorAll('.btn-reserver');
    const modalHotel = document.getElementById('modal-hotel');
    const spanFermer = modalHotel.querySelector('.close');
    const titreHotel = document.getElementById('titre-hotel');
    const formReservation = document.getElementById('form-reservation-hotel');

    boutonsReserver.forEach(bouton => {
        bouton.addEventListener('click', function() {
            const hotelId = this.getAttribute('data-hotel');
            const hotel = hotels[hotelId];
            
            if (hotel) {
                titreHotel.textContent = `Réservation - ${hotel.nom}`;
                afficherFormulaireReservation(hotel);
                modalHotel.style.display = 'block';
            }
        });
    });

    spanFermer.addEventListener('click', function() {
        modalHotel.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modalHotel) {
            modalHotel.style.display = 'none';
        }
    });

    formReservation.addEventListener('submit', function(e) {
        e.preventDefault();
        traiterReservationHotel();
    });
}

function afficherFormulaireReservation(hotel) {
    const form = document.getElementById('form-reservation-hotel');
    
    form.innerHTML = `
        <div class="hotel-info" style="background: #ebf8ff; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
            <p><strong>Description:</strong> ${hotel.description}</p>
            <p><strong>Prix:</strong> ${hotel.prix} par nuit</p>
            <p><strong>Contact:</strong> ${hotel.contact}</p>
        </div>
        
        <div class="form-group">
            <label for="nom-reservation">Nom complet *</label>
            <input type="text" id="nom-reservation" name="nom" required>
        </div>
        
        <div class="form-group">
            <label for="telephone-reservation">Téléphone *</label>
            <input type="tel" id="telephone-reservation" name="telephone" required>
        </div>
        
        <div class="form-group">
            <label for="email-reservation">Email</label>
            <input type="email" id="email-reservation" name="email">
        </div>
        
        <div class="form-group">
            <label for="date-arrivee">Date d'arrivée *</label>
            <input type="date" id="date-arrivee" name="date-arrivee" required>
        </div>
        
        <div class="form-group">
            <label for="date-depart">Date de départ *</label>
            <input type="date" id="date-depart" name="date-depart" required>
        </div>
        
        <div class="form-group">
            <label for="nombre-chambres">Nombre de chambres *</label>
            <input type="number" id="nombre-chambres" name="nombre-chambres" min="1" value="1" required>
        </div>
        
        <div class="form-group">
            <label for="message-reservation">Message spécial (optionnel)</label>
            <textarea id="message-reservation" name="message" rows="4"></textarea>
        </div>
        
        <button type="submit" class="btn-submit">Envoyer la demande de réservation</button>
    `;
}

function traiterReservationHotel() {
    const formData = new FormData(document.getElementById('form-reservation-hotel'));
    const reservation = {
        nom: formData.get('nom'),
        telephone: formData.get('telephone'),
        email: formData.get('email'),
        dateArrivee: formData.get('date-arrivee'),
        dateDepart: formData.get('date-depart'),
        nombreChambres: formData.get('nombre-chambres'),
        message: formData.get('message')
    };

    // Ici, vous enverriez normalement les données à un serveur
    console.log('Réservation reçue:', reservation);
    
    alert('Votre demande de réservation a été envoyée. Vous serez contacté pour confirmation.');
    document.getElementById('modal-hotel').style.display = 'none';
}

// Gestion du formulaire de présence
function initialiserFormulairePresence() {
    const form = document.getElementById('form-presence');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        traiterConfirmationPresence();
    });
}

function traiterConfirmationPresence() {
    const formData = new FormData(document.getElementById('form-presence'));
    const evenementsSelectionnes = [];
    
    document.querySelectorAll('input[name="evenements"]:checked').forEach(checkbox => {
        evenementsSelectionnes.push(checkbox.value);
    });

    const confirmation = {
        nom: formData.get('nom'),
        telephone: formData.get('telephone'),
        email: formData.get('email'),
        evenements: evenementsSelectionnes,
        nombrePersonnes: formData.get('nombre-personnes'),
        message: formData.get('message')
    };

    // Ici, vous enverriez normalement les données à un serveur
    console.log('Confirmation de présence:', confirmation);
    
    alert('Merci pour votre confirmation de présence. Nous avons bien enregistré votre participation.');
    document.getElementById('form-presence').reset();
}

// Gestion du formulaire de commande de pagne
function initialiserFormulairePagne() {
    const form = document.getElementById('form-pagne');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        traiterCommandePagne();
    });
}

function traiterCommandePagne() {
    const formData = new FormData(document.getElementById('form-pagne'));
    
    const commande = {
        quantite: formData.get('quantite'),
        taille: formData.get('taille'),
        nom: formData.get('nom-pagne'),
        telephone: formData.get('telephone-pagne')
    };

    // Ici, vous enverriez normalement les données à un serveur
    console.log('Commande de pagne:', commande);
    
    alert(`Votre commande de ${commande.quantite} pagne(s) a été enregistrée. Le lien de paiement vous sera envoyé prochainement.`);
    document.getElementById('form-pagne').reset();
}

// Smooth scroll pour la navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});