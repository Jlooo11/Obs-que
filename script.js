// Configuration de l'API - À modifier selon votre déploiement
const API_BASE_URL = 'http://localhost:3000/api';

// Initialisation quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    initialiserReservations();
    initialiserFormulairePresence();
    initialiserFormulairePagne();
});

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
            const hotelNom = this.closest('.hotel').querySelector('h3').textContent;
            
            titreHotel.textContent = `Réservation - ${hotelNom}`;
            afficherFormulaireReservation(hotelNom);
            modalHotel.style.display = 'block';
            
            // Empêcher le défilement du body quand la modal est ouverte
            document.body.style.overflow = 'hidden';
        });
    });

    spanFermer.addEventListener('click', function() {
        modalHotel.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modalHotel) {
            modalHotel.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    formReservation.addEventListener('submit', function(e) {
        e.preventDefault();
        traiterReservationHotel();
    });
}

function afficherFormulaireReservation(hotelNom) {
    const form = document.getElementById('form-reservation-hotel');
    
    // Définir les dates min/max pour éviter les réservations dans le passé
    const aujourdhui = new Date().toISOString().split('T')[0];
    const dateMax = new Date();
    dateMax.setMonth(dateMax.getMonth() + 3);
    const dateMaxFormatted = dateMax.toISOString().split('T')[0];
    
    form.innerHTML = `
        <div class="hotel-info" style="background: #ebf8ff; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
            <p><strong>Hôtel:</strong> ${hotelNom}</p>
            <p style="margin-top: 0.5rem; font-style: italic; font-size: 0.9rem;">
                Vous serez contacté pour confirmer la disponibilité et les détails de paiement.
            </p>
        </div>
        
        <div class="form-group">
            <label for="nom-reservation">Nom complet *</label>
            <input type="text" id="nom-reservation" name="nom" required placeholder="Votre nom complet">
        </div>
        
        <div class="form-group">
            <label for="telephone-reservation">Téléphone *</label>
            <input type="tel" id="telephone-reservation" name="telephone" required placeholder="Votre numéro de téléphone">
        </div>
        
        <div class="form-group">
            <label for="email-reservation">Email</label>
            <input type="email" id="email-reservation" name="email" placeholder="Votre adresse email">
        </div>
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="date-arrivee">Date d'arrivée *</label>
                <input type="date" id="date-arrivee" name="date-arrivee" required 
                       min="${aujourdhui}" max="${dateMaxFormatted}">
            </div>
            
            <div class="form-group">
                <label for="date-depart">Date de départ *</label>
                <input type="date" id="date-depart" name="date-depart" required 
                       min="${aujourdhui}" max="${dateMaxFormatted}">
            </div>
        </div>
        
        <div class="form-group">
            <label for="nombre-chambres">Nombre de chambres *</label>
            <input type="number" id="nombre-chambres" name="nombre-chambres" min="1" value="1" required>
        </div>
        
        <div class="form-group">
            <label for="message-reservation">Message spécial (optionnel)</label>
            <textarea id="message-reservation" name="message" rows="3" placeholder="Informations supplémentaires..."></textarea>
        </div>
        
        <button type="submit" class="btn-submit" style="width: 100%; margin-top: 1rem;">
            Envoyer la demande de réservation
        </button>
    `;

    // Ajouter la validation des dates
    const dateArrivee = document.getElementById('date-arrivee');
    const dateDepart = document.getElementById('date-depart');

    dateArrivee.addEventListener('change', function() {
        if (this.value) {
            dateDepart.min = this.value;
        }
    });
}

// Fonction pour envoyer les données à l'API
async function envoyerDonneesAPI(endpoint, data) {
    try {
        console.log('Envoi des données à:', `${API_BASE_URL}/${endpoint}`, data);
        
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        throw new Error('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
    }
}

// Traitement de la réservation d'hôtel
async function traiterReservationHotel() {
    const formData = new FormData(document.getElementById('form-reservation-hotel'));
    const hotelNom = document.getElementById('titre-hotel').textContent.replace('Réservation - ', '');
    
    const reservation = {
        nom: formData.get('nom'),
        telephone: formData.get('telephone'),
        email: formData.get('email'),
        dateArrivee: formData.get('date-arrivee'),
        dateDepart: formData.get('date-depart'),
        nombreChambres: formData.get('nombre-chambres'),
        message: formData.get('message'),
        hotel: hotelNom
    };

    try {
        const result = await envoyerDonneesAPI('reservation-hotel', reservation);
        alert('✅ ' + result.message);
        document.getElementById('modal-hotel').style.display = 'none';
        document.body.style.overflow = 'auto';
    } catch (error) {
        alert('❌ Erreur: ' + error.message);
    }
}

// Traitement de la confirmation de présence
async function traiterConfirmationPresence() {
    const formData = new FormData(document.getElementById('form-presence'));
    const evenementsSelectionnes = [];
    
    document.querySelectorAll('input[name="evenements"]:checked').forEach(checkbox => {
        evenementsSelectionnes.push(checkbox.value);
    });

    // Validation : au moins un événement doit être sélectionné
    if (evenementsSelectionnes.length === 0) {
        alert('❌ Veuillez sélectionner au moins un événement.');
        return;
    }

    const confirmation = {
        nom: formData.get('nom'),
        telephone: formData.get('telephone'),
        email: formData.get('email'),
        evenements: evenementsSelectionnes,
        nombrePersonnes: formData.get('nombre-personnes'),
        message: formData.get('message')
    };

    try {
        const result = await envoyerDonneesAPI('confirmation-presence', confirmation);
        alert('✅ ' + result.message);
        document.getElementById('form-presence').reset();
    } catch (error) {
        alert('❌ Erreur: ' + error.message);
    }
}

// Traitement de la commande de pagne
async function traiterCommandePagne() {
    const formData = new FormData(document.getElementById('form-pagne'));
    
    const commande = {
        quantite: parseInt(formData.get('quantite')),
        taille: formData.get('taille'),
        nom: formData.get('nom-pagne'),
        telephone: formData.get('telephone-pagne')
    };

    try {
        const result = await envoyerDonneesAPI('commande-pagne', commande);
        alert('✅ ' + result.message);
        document.getElementById('form-pagne').reset();
    } catch (error) {
        alert('❌ Erreur: ' + error.message);
    }
}

// Gestion du formulaire de présence
function initialiserFormulairePresence() {
    const form = document.getElementById('form-presence');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        traiterConfirmationPresence();
    });
}

// Gestion du formulaire de commande de pagne
function initialiserFormulairePagne() {
    const form = document.getElementById('form-pagne');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        traiterCommandePagne();
    });
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