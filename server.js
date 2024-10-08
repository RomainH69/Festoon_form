// server.js ou index.js

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

require('dotenv').config();  // Charge les variables d'environnement à partir de .env

const app = express();
app.use(cors());


// Middleware pour parser les données du formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route POST pour recevoir les données du formulaire
app.post('/send-email', (req, res) => {
	
	const formData = req.body;
	console.log('Données reçues:', req.body);  // Ajoute ceci pour inspecter les données reçues
	
   const { nom, prenom, mail, societe, environnement, ambiance, preciseAmbiance, vitesse, course, sp, dh, totalLength, cables } = req.body;
   
    if (!cables || cables.length === 0) {
    return res.status(400).send({ message: "Aucune donnée de câble reçue." });
  }
	if (ambiance === 'Oui' && preciseAmbiance) {
        precisions = `<p><strong>Précision sur l'ambiance agressive:</strong> ${preciseAmbiance}</p>`;
    }
	else{
		precisions = ``
	}
	
     let emailBody = `
    <h2>Formulaire Guirlande de Câbles</h2>
    <p><strong>Nom:</strong> ${nom}</p>
    <p><strong>Prénom:</strong> ${prenom}</p>
    <p><strong>Email:</strong> ${mail}</p>
	<p><strong>Societé:</strong> ${societe}</p>
    <p><strong>Environnement:</strong> ${environnement}</p>
    ${precisions}
	<p><strong>Ambiance agressive:</strong> ${ambiance}</p>
    <p><strong>Vitesse:</strong> ${vitesse}</p>
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>SP:</strong> ${sp}</p>
    <p><strong>DH:</strong> ${dh}</p>
    <p><strong>Longueur totale:</strong> ${totalLength}</p>
    
    <h3>Liste des câbles</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Quantité</th>
        <th>Nombre de pôles x section</th>
        <th>Forme</th>
        <th>Fourniture</th>
      </tr>
  `;
  cables.forEach(cable => {
    emailBody += `
      <tr>
        <td>${cable.quantite}</td>
        <td>${cable.nbPoles}</td>
        <td>${cable.forme}</td>
        <td>${cable.fourniture}</td>
      </tr>
    `;
  });

  emailBody += `</table>`;
	
	// Configuration de Nodemailer avec les variables d'environnement
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
			
        }
    });

    // Définir le contenu de l'email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'romain.hoerdt@vahle.com',
        subject: 'Nouveau formulaire de guirlande de câbles',
        html: emailBody
		};

    // Envoyer l'email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Erreur lors de l\'envoi de l\'email');
        } else {
            console.log('Email envoyé: ' + info.response);
            return res.status(200).send('Email envoyé avec succès');
        }
    });
});

// Démarrer le serveur
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
