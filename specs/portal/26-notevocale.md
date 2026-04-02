# SPEC — Frontend Voice Recorder Module
Projet: msgflash-portal (Next.js)
Status: Ready for Implementation
Priorité: Haute — Feature clé pour l'expérience utilisateur

---

## 1. Objectif
Permettre à l'utilisateur d'enregistrer une note vocale directement depuis l'interface de messagerie, de la pré-écouter, et de l'envoyer via le service de média existant.

## 2. Flux Technique (Browser API)

1. **Permission** : Appel à `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. **Capture** : Utilisation de `MediaRecorder` pour transformer le flux micro en chunks (morceaux).
3. **Encapsulation** : Conversion des chunks en un `Blob` (type `audio/webm` ou `audio/ogg`).
4. **Upload** : Envoi du Blob via un objet `FormData` vers `POST /api/media/upload`.

---

## 3. Gestion des États et Erreurs (UI/UX)

L'implémentation **doit** impérativement gérer les cas d'échec pour guider l'utilisateur.

### A. Accès au Micro (Permissions)
| Cas d'erreur | Cause technique | Message UI recommandé |
| :--- | :--- | :--- |
| **Permission refusée** | L'utilisateur a cliqué sur "Bloquer" dans le navigateur. | "Accès micro refusé. Veuillez autoriser le micro dans les paramètres de votre navigateur pour enregistrer." |
| **Micro non trouvé** | Aucun périphérique audio détecté (ex: PC fixe sans micro). | "Aucun microphone détecté. Branchez un périphérique pour continuer." |
| **Micro occupé** | Une autre application (Meet, Zoom, etc.) utilise déjà le micro de manière exclusive. | "Le microphone est déjà utilisé par une autre application." |

### B. Erreurs durant l'enregistrement
| Problème | Action attendue | Message UI |
| :--- | :--- | :--- |
| **Déconnexion micro** | Le câble est débranché pendant l'enregistrement. | "Connexion au micro perdue. Enregistrement annulé." |
| **Silence prolongé** | Le flux audio ne contient aucun volume (optionnel). | "Nous n'entendons rien. Vérifiez le volume de votre micro." |

### C. Échec de l'Upload
| Problème | Cause | Message UI |
| :--- | :--- | :--- |
| **Fichier trop gros** | Note vocale dépassant 16MB (très rare). | "La note vocale est trop longue. Limitez-vous à 15 minutes." |
| **Erreur réseau** | Coupure internet pendant l'envoi du Blob. | "Échec de l'envoi. Vérifiez votre connexion internet." |
| **Erreur Serveur** | Code 400/500 retourné par le backend. | "Une erreur est survenue lors du traitement audio. Réessayez." |

---

## 4. Composants UI requis

### État Initial
- Bouton [Micro] simple.

### État Enregistrement (Actif)
- **Visualiseur** : Une onde de forme (waveform) ou un point rouge clignotant pour montrer que ça enregistre.
- **Timer** : Affichage `00:00` en temps réel.
- **Bouton Annuler** : Stop l'enregistrement et supprime le buffer sans envoyer.
- **Bouton Stop** : Fin de l'enregistrement et passage à la pré-écoute.

### État Review (Pré-écoute)
- **Lecteur Audio** : Un petit player pour que l'utilisateur s'écoute avant d'envoyer.
- **Bouton Supprimer** : Retour à l'état initial.
- **Bouton Envoyer** : Déclenche l'upload vers le backend.

---

## 5. Spécifications du Payload (Envoi API)

Le front-end doit simuler un fichier pour que le backend (Multer) le reconnaisse :

- **Field Name** : `file`
- **Filename** : `voice-note-${Date.now()}.ogg`
- **Content-Type** : `audio/ogg` (ou `audio/webm`)

```javascript
// Exemple de construction du FormData côté Front
const formData = new FormData();
formData.append('file', audioBlob, 'voice-note.ogg');


---

## 6. Definition of Done (Frontend)
- [ ] Demande de permission micro au clic sur l'icône.
- [ ] Affichage d'une alerte explicite si la permission est refusée.
- [ ] Timer visuel pendant l'enregistrement.
- [ ] Possibilité de réécouter le son avant l'envoi.
- [ ] Upload réussi vers `/api/media/upload`.
- [ ] Récupération de l'URL Cloudinary et injection dans le flux de message final.
- [ ] Test sur Chrome, Safari (iOS) et Firefox (les comportements `MediaRecorder` varient).
```

### Note :
Sous **iOS Safari**, il y a souvent une restriction : l'enregistrement ne peut démarrer que suite à une action utilisateur directe (un clic). Il ne faut pas essayer de lancer le micro de manière programmatique au chargement de la page.

