const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Stockage en mémoire pour les condoléances (en production, utiliser une base de données)
let condoleances = [];

// Vérification des variables d'environnement
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERREUR: Les variables d\'environnement EMAIL_USER et EMAIL_PASS sont requises');
    process.exit(1);
}

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test de la configuration email au démarrage
transporter.verify(function(error, success) {
    if (error) {
        console.error('❌ Erreur de configuration email:', error);
    } else {
        console.log('✅ Serveur email prêt à envoyer des messages');
    }
});

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend pour le site des obsèques - Opérationnel',
        version: '1.0.0'
    });
});

// Route pour récupérer les condoléances
app.get('/api/condoleances', (req, res) => {
    res.json(condoleances);
});

// Route pour ajouter une condoléance
app.post('/api/condoleances', async (req, res) => {
    try {
        const { nom, message, date } = req.body;

        console.log('💌 Nouveau message de condoléances:', { nom });

        const nouvelleCondoleance = {
            id: Date.now().toString(),
            nom,
            message,
            date: date || new Date().toISOString()
        };

        condoleances.unshift(nouvelleCondoleance); // Ajouter au début

        // Envoyer email de notification
        const mailOptions = {
            from: `"Site Obsèques" <${process.env.EMAIL_USER}>`,
            to: 'sylvia.b@bloowmoney.com',
            subject: 'Nouveau message de condoléances - Obsèques',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a1931; border-bottom: 2px solid #0a1931; padding-bottom: 10px;">
                        💌 Nouveau message de condoléances
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">De la part de:</h3>
                        <p><strong>Nom:</strong> ${nom}</p>
                        <p><strong>Date:</strong> ${new Date(nouvelleCondoleance.date).toLocaleString('fr-FR')}</p>
                    </div>

                    <div style="background: #ebf8ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Message:</h3>
                        <p style="font-style: italic;">"${message}"</p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            📧 Envoyé automatiquement depuis le site des obsèques
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de condoléances envoyé à sylvia.b@bloowmoney.com');
        
        res.json({ success: true, message: 'Message de condoléances publié avec succès' });
    } catch (error) {
        console.error('❌ Erreur envoi email condoléances:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi du message' 
        });
    }
});

// Route pour la confirmation de présence
app.post('/api/confirmation-presence', async (req, res) => {
    try {
        const { nom, telephone, email, evenements, nombrePersonnes, besoinHebergement, message } = req.body;

        console.log('📝 Nouvelle confirmation de présence:', { nom, telephone, besoinHebergement });

        const mailOptions = {
            from: `"Site Obsèques" <${process.env.EMAIL_USER}>`,
            to: 'sylvia.b@bloowmoney.com',
            subject: 'Nouvelle confirmation de présence - Obsèques',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a1931; border-bottom: 2px solid #0a1931; padding-bottom: 10px;">
                        📝 Nouvelle confirmation de présence
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Informations du participant:</h3>
                        <p><strong>Nom:</strong> ${nom}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                        <p><strong>Email:</strong> ${email || 'Non fourni'}</p>
                        <p><strong>Nombre de personnes:</strong> ${nombrePersonnes}</p>
                        <p><strong>Besoin d'hébergement:</strong> ${besoinHebergement === 'oui' ? '✅ Oui' : '❌ Non'}</p>
                    </div>

                    <div style="background: #ebf8ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Événements confirmés à Abengourou:</h3>
                        <ul>
                            ${evenements.map(event => {
                                const eventsMap = {
                                    'leve-corps': '✅ Levé de corps (17 Oct)',
                                    'veillee-traditionnelle': '✅ Veillée traditionnelle (17 Oct)',
                                    'absolut-inhumation': '✅ Absolut et Inhumation (18 Oct)',
                                    'messe-action-grace': '✅ Messe d\'action de grâce (18 Oct)'
                                };
                                return `<li>${eventsMap[event] || event}</li>`;
                            }).join('')}
                        </ul>
                    </div>

                    ${message ? `
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">Message supplémentaire:</h3>
                        <p style="color: #856404;">${message}</p>
                    </div>
                    ` : ''}

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            📧 Envoyé automatiquement depuis le site des obsèques
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de confirmation de présence envoyé');

        res.json({ success: true, message: 'Confirmation de présence enregistrée avec succès' });
    } catch (error) {
        console.error('❌ Erreur confirmation présence:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'enregistrement de la confirmation' 
        });
    }
});

// Route pour la commande de pagne
app.post('/api/commande-pagne', async (req, res) => {
    try {
        const { quantite, taille, nom, telephone } = req.body;

        console.log('🛍️ Nouvelle commande de pagne:', { nom, telephone, quantite });

        const prixUnitaire = 6700;
        const montantTotal = quantite * prixUnitaire;

        const mailOptions = {
            from: `"Site Obsèques" <${process.env.EMAIL_USER}>`,
            to: 'sylvia.b@bloowmoney.com',
            subject: 'Nouvelle commande de pagne - Obsèques',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a1931; border-bottom: 2px solid #0a1931; padding-bottom: 10px;">
                        🛍️ Nouvelle commande de pagne
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Informations de commande:</h3>
                        <p><strong>Client:</strong> ${nom}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                        <p><strong>Quantité:</strong> ${quantite}</p>
                        <p><strong>Taille:</strong> ${taille === 'grande' ? 'Grande taille' : 'Standard'}</p>
                        <p><strong>Prix unitaire:</strong> ${prixUnitaire.toLocaleString()} FCFA</p>
                        <p><strong>Montant total:</strong> <strong style="color: #0a1931; font-size: 1.2em;">${montantTotal.toLocaleString()} FCFA</strong></p>
                    </div>

                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #155724; margin-top: 0;">📞 Action requise:</h3>
                        <p style="color: #155724;">
                            Contacter le client pour confirmer la commande et organiser la livraison.
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            📧 Envoyé automatiquement depuis le site des obsèques
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de commande pagne envoyé');

        res.json({ 
            success: true, 
            message: 'Commande de pagne enregistrée avec succès. Nous vous contacterons pour la livraison.',
            details: {
                quantite,
                taille,
                montant: montantTotal
            }
        });
    } catch (error) {
        console.error('❌ Erreur commande pagne:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'enregistrement de la commande' 
        });
    }
});

// Route pour la réservation d'hôtel
app.post('/api/reservation-hotel', async (req, res) => {
    try {
        const { nom, telephone, email, dateArrivee, dateDepart, nombreChambres, message, hotel } = req.body;

        console.log('🏨 Nouvelle demande de réservation:', { nom, telephone, hotel });

        const mailOptions = {
            from: `"Site Obsèques" <${process.env.EMAIL_USER}>`,
            to: 'sylvia.b@bloowmoney.com',
            subject: 'Nouvelle demande de réservation - Obsèques',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a1931; border-bottom: 2px solid #0a1931; padding-bottom: 10px;">
                        🏨 Nouvelle demande de réservation
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Informations de réservation:</h3>
                        <p><strong>Hôtel demandé:</strong> ${hotel}</p>
                        <p><strong>Client:</strong> ${nom}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                        <p><strong>Email:</strong> ${email || 'Non fourni'}</p>
                        <p><strong>Dates:</strong> Du ${new Date(dateArrivee).toLocaleDateString('fr-FR')} au ${new Date(dateDepart).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Nombre de chambres:</strong> ${nombreChambres}</p>
                    </div>

                    ${message ? `
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">Message du client:</h3>
                        <p style="color: #856404;">${message}</p>
                    </div>
                    ` : ''}

                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #155724; margin-top: 0;">📞 Action requise:</h3>
                        <p style="color: #155724;">
                            Contacter le client pour confirmer la disponibilité et les modalités de paiement.
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            📧 Envoyé automatiquement depuis le site des obsèques
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de réservation envoyé');

        res.json({ 
            success: true, 
            message: 'Demande de réservation envoyée. Nous vous contacterons pour confirmation.' 
        });
    } catch (error) {
        console.error('❌ Erreur réservation hôtel:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de la demande de réservation' 
        });
    }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route non trouvée' 
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📧 Email configuré pour: ${process.env.EMAIL_USER}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});