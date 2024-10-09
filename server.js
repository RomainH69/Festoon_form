// server.js ou index.js

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();  // Charge les variables d'environnement à partir de .env

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' }); // Dossier où stocker les fichiers temporairement



// Middleware pour parser les données du formulaire
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

// Route POST pour recevoir les données du formulaire
app.post('/send-email',  upload.array('fileUpload', 10), (req, res) => {
	
	const formData = req.body;
	const files = req.files; // 'files' doit correspondre au champ de fichier
	console.log('Données reçues:', formData);  // Ajoute ceci pour inspecter les données reçues
	
   const { nom, prenom, mail, societe, environnement, ambiance, preciseAmbiance, railType, vitesse, course, sp, dh, totalLength, quantite, nbPoles, forme, fourniture, otherInfo } = formData;
	
	let cables=[];
	
	for (let i = 0; i < quantite.length; i++) {
        cables.push({
            quantite: quantite[i],
            nbPoles: nbPoles[i],
            forme: forme[i],
            fourniture: fourniture[i]
        });
    }
	
	console.log('cables', cables);
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
	<p><strong>Rail:</strong> ${railType}</p>
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
  emailBody += `<p><strong>Autres infos: </strong>${otherInfo}</p>`
	
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
		attachments: files.map(file => ({
            filename: file.originalname,
            path: file.path
        })), // Ajout des fichiers joints
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
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log('Serveur en écoute sur le port ${port}');
});
