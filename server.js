const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');  // CORRECTION ICI
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

// Configuration de nodemailer - CORRECTION ICI
const transporter = nodemailer.createTransport({  // "nodemailer" pas "nodesList"
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

// Route pour la commande de pagne
app.post('/api/commande-pagne', async (req, res) => {
    try {
        const { quantite, taille, nom, telephone } = req.body;

        console.log('👗 Nouvelle commande de pagne:', { nom, telephone, quantite });

        const mailOptions = {
            from: `"Site Obsèques" <${process.env.EMAIL_USER}>`,
            to: 'sylvia.b@bloowmoney.com',
            subject: 'Nouvelle commande de pagne - Obsèques',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a1931; border-bottom: 2px solid #0a1931; padding-bottom: 10px;">
                        👗 Nouvelle commande de pagne
                    </h2>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #0a1931; margin-top: 0;">Détails de la commande:</h3>
                        <p><strong>Nom:</strong> ${nom}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                        <p><strong>Quantité:</strong> ${quantite}</p>
                        <p><strong>Taille:</strong> ${taille}</p>
                        <p><strong>Montant total:</strong> ${quantite * 6700} FCFA</p>
                    </div>

                    <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="color: #0c5460; margin-top: 0;">Instructions:</h4>
                        <p>Contacter le client pour finaliser la commande.</p>
                        <p><strong>Lien de paiement:</strong> <a href="https://pay.jeko.africa/pl/abf040fb-3e66-4090-9063-4ac9b83586d4">https://pay.jeko.africa/pl/abf040fb-3e66-4090-9063-4ac9b83586d4</a></p>
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
        console.log('✅ Email de commande pagne envoyé à sylvia.b@bloowmoney.com');
        
        res.json({ success: true, message: 'Commande de pagne envoyée avec succès' });
    } catch (error) {
        console.error('❌ Erreur envoi email pagne:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de la commande' 
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
    console.log('   GET  / (test)');
    console.log('🚀 ==========================================');
    console.log('✅ Le backend est maintenant opérationnel!');
    console.log('💡 Testez-le en visitant: http://localhost:3000');
    console.log('🚀 ==========================================');
});