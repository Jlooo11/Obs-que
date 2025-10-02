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

// Stockage en mémoire pour les condoléances (en production, utilisez une base de données)
let condoleancesStore = [];

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend pour le site des obsèques - Opérationnel',
        version: '1.0.0'
    });
});

// Route pour la confirmation de présence
app.post('/api/confirmation-presence', async (req, res) => {
    try {
        const { nom, telephone, email, evenements, nombrePersonnes, message } = req.body;

        console.log('📝 Nouvelle confirmation de présence:', { nom, telephone });

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
                    </div>

                    <div style="background: #ebf8ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Événements confirmés:</h3>
                        <ul>
                            ${evenements.map(event => {
                                const eventsMap = {
                                    'condoleances': '✅ Présentation de condoléances (12-13 Oct)',
                                    'veillee-religieuse': '✅ Veillée religieuse (14 Oct)',
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
                    <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">Message:</h3>
                        <p>${message}</p>
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
        console.log('✅ Email de confirmation envoyé à sylvia.b@bloowmoney.com');
        
        res.json({ success: true, message: 'Confirmation envoyée avec succès' });
    } catch (error) {
        console.error('❌ Erreur envoi email confirmation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de la confirmation' 
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
            subject: 'Nouvelle demande de réservation d\'hôtel - Obsèques',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a1931; border-bottom: 2px solid #0a1931; padding-bottom: 10px;">
                        🏨 Nouvelle demande de réservation d'hôtel
                    </h2>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Informations de réservation:</h3>
                        <p><strong>Hôtel:</strong> ${hotel}</p>
                        <p><strong>Nom:</strong> ${nom}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                        <p><strong>Email:</strong> ${email || 'Non fourni'}</p>
                        <p><strong>Date d'arrivée:</strong> ${new Date(dateArrivee).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Date de départ:</strong> ${new Date(dateDepart).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Nombre de chambres:</strong> ${nombreChambres}</p>
                    </div>

                    ${message ? `
                    <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">Message spécial:</h3>
                        <p>${message}</p>
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
        console.log('✅ Email de réservation envoyé à sylvia.b@bloowmoney.com');
        
        res.json({ success: true, message: 'Demande de réservation envoyée avec succès' });
    } catch (error) {
        console.error('❌ Erreur envoi email réservation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de la demande de réservation' 
        });
    }
});

// Route pour la commande de pagne - VERSION CORRIGÉE
app.post('/api/commande-pagne', async (req, res) => {
    try {
        const { quantite, taille, nom, telephone, email } = req.body;

        console.log('👗 Nouvelle commande de pagne:', { nom, telephone, quantite, taille });

        // Validation des données requises
        if (!nom || !telephone || !quantite) {
            return res.status(400).json({
                success: false,
                message: 'Nom, téléphone et quantité sont obligatoires'
            });
        }

        const quantiteNum = parseInt(quantite);
        const prixUnitaire = 6700;
        const montantTotal = quantiteNum * prixUnitaire;

        const mailOptions = {
            from: `"Site Obsèques" <${process.env.EMAIL_USER}>`,
            to: 'sylvia.b@bloowmoney.com', // Vérifiez cette adresse
            subject: `Nouvelle commande de pagne - ${nom}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a1931; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
                        .detail { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #0a1931; }
                        .montant { background: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; font-size: 1.2em; font-weight: bold; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>👗 NOUVELLE COMMANDE DE PAGNE</h1>
                            <p>Site des Obsèques - BOA Delphine</p>
                        </div>
                        
                        <div class="content">
                            <div class="detail">
                                <h3>Informations du client</h3>
                                <p><strong>Nom :</strong> ${nom}</p>
                                <p><strong>Téléphone :</strong> ${telephone}</p>
                                ${email ? `<p><strong>Email :</strong> ${email}</p>` : ''}
                            </div>

                            <div class="detail">
                                <h3>Détails de la commande</h3>
                                <p><strong>Quantité :</strong> ${quantiteNum} pagne(s)</p>
                                <p><strong>Taille :</strong> ${taille || 'Standard'}</p>
                                <p><strong>Prix unitaire :</strong> ${prixUnitaire.toLocaleString()} FCFA</p>
                            </div>

                            <div class="montant">
                                <h3>MONTANT TOTAL</h3>
                                <p style="font-size: 1.5em; color: #155724;">${montantTotal.toLocaleString()} FCFA</p>
                            </div>

                            <div class="detail">
                                <h3>Instructions importantes</h3>
                                <p>➤ Contacter le client au <strong>${telephone}</strong> pour confirmer la commande</p>
                                <p>➤ Le paiement peut être effectué via le lien suivant :</p>
                                <p style="text-align: center; margin: 15px 0;">
                                    <a href="https://pay.jeko.africa/pl/abf040fb-3e66-4090-9063-4ac9b83586d4" 
                                       style="background: #0a1931; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                        🔗 Accéder au lien de paiement
                                    </a>
                                </p>
                                <p><strong>Lien :</strong> https://pay.jeko.africa/pl/abf040fb-3e66-4090-9063-4ac9b83586d4</p>
                            </div>
                        </div>

                        <div class="footer">
                            <p>📧 Email envoyé automatiquement depuis le site des obsèques</p>
                            <p>🕒 ${new Date().toLocaleString('fr-FR')}</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        console.log('📤 Tentative d\'envoi d\'email...');
        
        // Envoi de l'email avec timeout
        const emailPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout d\'envoi d\'email')), 10000);
        });

        await Promise.race([emailPromise, timeoutPromise]);
        
        console.log('✅ Email de commande pagne envoyé avec succès à sylvia.b@bloowmoney.com');
        
        res.json({ 
            success: true, 
            message: 'Commande de pagne envoyée avec succès. Vous serez contacté pour confirmation.',
            details: {
                quantite: quantiteNum,
                taille: taille || 'Standard',
                montant: montantTotal
            }
        });

    } catch (error) {
        console.error('❌ Erreur détaillée envoi email pagne:', error);
        
        // Log plus détaillé pour le debugging
        console.log('🔍 Détails de la commande qui a échoué:', req.body);
        console.log('🔍 Configuration email:', {
            service: 'gmail',
            user: process.env.EMAIL_USER ? 'Défini' : 'Non défini'
        });

        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de la commande. Veuillez réessayer ou nous contacter directement.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route pour les condoléances
app.post('/api/condoleances', async (req, res) => {
    try {
        const { nom, relation, message } = req.body;

        console.log('💌 Nouveau message de condoléances:', { nom });

        // Ajouter aux condoléances stockées
        const nouvelleCondoleance = {
            id: Date.now().toString(),
            nom,
            relation: relation || '',
            message,
            date: new Date().toISOString()
        };
        
        condoleancesStore.unshift(nouvelleCondoleance); // Ajouter au début
        condoleancesStore = condoleancesStore.slice(0, 50); // Garder seulement les 50 derniers

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
                        <h3 style="color: #0a1931; margin-top: 0;">Informations:</h3>
                        <p><strong>Nom:</strong> ${nom}</p>
                        <p><strong>Relation:</strong> ${relation || 'Non spécifiée'}</p>
                    </div>

                    <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">Message:</h3>
                        <p style="font-style: italic; line-height: 1.6;">"${message}"</p>
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
        
        res.json({ 
            success: true, 
            message: 'Votre message de condoléances a été envoyé',
            condoleance: nouvelleCondoleance
        });
    } catch (error) {
        console.error('❌ Erreur envoi email condoléances:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi du message' 
        });
    }
});

// Route pour récupérer les condoléances
app.get('/api/condoleances', (req, res) => {
    try {
        res.json(condoleancesStore);
    } catch (error) {
        console.error('❌ Erreur récupération condoléances:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des condoléances' 
        });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🚀 Serveur backend démarré avec succès!');
    console.log('🚀 ==========================================');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📧 Email configuré pour: ${process.env.EMAIL_USER}`);
    console.log(`📧 Emails envoyés à: sylvia.b@bloowmoney.com`);
    console.log('📋 Routes disponibles:');
    console.log('   POST /api/confirmation-presence');
    console.log('   POST /api/reservation-hotel');
    console.log('   POST /api/commande-pagne');
    console.log('   POST /api/condoleances');
    console.log('   GET  /api/condoleances');
    console.log('   GET  / (test)');
    console.log('🚀 ==========================================');
    console.log('✅ Le backend est maintenant opérationnel!');
    console.log('💡 Testez-le en visitant: http://localhost:3000');
    console.log('🚀 ==========================================');
});