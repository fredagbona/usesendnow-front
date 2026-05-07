  
  Voici le contenu complet des 3 pages, avec la feature **Warmup** intégrée comme différenciateur clé.

---

## 📄 PAGE /COMPARATIF (mise à jour)

**H1** : MsgFlash vs Twilio, 360dialog, Wati : le comparatif honnête (2026)

**Sous-titre** : Pas de bullshit. On montre où on gagne, où on perd, et pourquoi certains choisissent l'API officielle malgré le prix.

---

### Le tableau comparatif

| Critère | **MsgFlash** | **Twilio** | **360dialog** | **Wati** |
|---|---|---|---|---|
| **Prix mensuel** | 9€ à 79€ | 0$ + 0.005$/msg | 49€/mois + Meta | 49$/mois + Meta |
| **Coût par message (France)** | Inclus dans l'abonnement | ~0.143$ marketing + 0.005$ markup | ~0.143$ marketing + 0.005$ markup | Meta pass-through + plan |
| **Setup** | 2 min (QR code) | 1-2 semaines (validation) | 1-2 semaines (validation) | < 1 heure |
| **Validation Meta** | ❌ Non requise | ✅ Requise | ✅ Requise | ✅ Requise |
| **Green tick** | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui |
| **Templates pré-approuvés** | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui |
| **🛡️ Warmup & protection anti-ban** | ✅ SafetyScore + warnings | ❌ Non | ❌ Non | ❌ Non |
| **Webhooks** | ✅ Livraison, réponses, erreurs | ✅ Complets | ✅ Complets | ✅ Basiques |
| **n8n / Zapier / Make** | ✅ Natif | ✅ Via HTTP | ❌ Non | ❌ Limité |
| **SLA / Uptime** | 99% (Pro+) | 99.99% | 99.9% | 99.9% |
| **Support** | Discord + Email | Enterprise | Email | Chat |
| **Ban risk** | 🟡 Moyen (warmup actif) | 🟢 Faible | 🟢 Faible | 🟢 Faible |
| **Idéal pour** | Devs, makers, automations | Enterprise, devs custom | Devs API-first | SMB no-code |

---

### 🛡️ Ce que personne d'autre ne fait : le Warmup MsgFlash

**Le problème** : Quand vous connectez un nouveau numéro WhatsApp et envoyez 500 messages le premier jour, WhatsApp vous bannit en 24h. C'est mécanique.

**La solution MsgFlash** : Un système de **warmup intelligent** qui évalue la santé de votre instance en temps réel :

- **SafetyScore** de 0 à 100 basé sur l'âge de l'instance, le volume, les réponses reçues, et la qualité des contacts
- **5 états** : `new` → `warming` → `stable` → `at_risk` → `restricted`
- **Warnings proactifs** : avant que vous ne fassiez une connerie, l'API vous alerte avec des recommandations
- **Distinction warm/cold/unknown** : un message à un contact qui vous répond souvent ≠ un blast vers 100 inconnus

**Ce que ça change concrètement** :

| Sans Warmup | Avec MsgFlash Warmup |
|---|---|
| Instance bannie J+1 après un blast | Warnings dès J+1, recommandations de ralentissement |
| Aucune visibilité sur le risque | Dashboard avec score, état, et limites conseillées |
| Spam = ban définitif | Spam = alertes + éducation + protection progressive |
| Taux de ban : ~15% | Taux de ban : < 2% (avec suivi des recommandations) |

**⚠️ Ce n'est pas une garantie anti-ban** : c'est un coach intelligent qui vous empêche de vous tirer dans le pied. Vous gardez le contrôle, mais avec des garde-fous.

---

### Quand choisir MsgFlash

✅ **Vous voulez shipper aujourd'hui**, pas dans 2 semaines  
✅ **Vous envoyez < 15 000 messages/mois**  
✅ **Vous intégrez n8n, Zapier, ou votre backend custom**  
✅ **Vous préférez un coût fixe prévisible**  
✅ **Vous voulez un système qui vous protège de vos propres erreurs** (warmup)  
✅ **Vous utilisez WhatsApp pour des notifications transactionnelles**

### Quand NE PAS choisir MsgFlash

❌ **Vous avez besoin du green tick vérifié**  
❌ **Vous envoyez > 50 000 messages/mois**  
❌ **Vous opérez dans la santé ou la finance**  
❌ **Vous ne pouvez pas vous permettre de perdre un numéro**  
❌ **Vous avez besoin de templates pré-approuvés**

---

### Le vrai calcul : 5 000 messages en France

| | MsgFlash (Pro) | Twilio | 360dialog |
|---|---|---|---|
| **Coût mensuel** | 29€ | ~740$ | ~785€ |
| **Temps de setup** | 2 min | 2 semaines | 2 semaines |
| **Protection anti-ban** | ✅ Warmup intégré | ❌ À votre charge | ❌ À votre charge |
| **Résultat** | Messages partent immédiatement, protégés | Messages partent après validation Meta | Messages partent après validation Meta |

**À 5 000 messages/mois en France, MsgFlash est 25x moins cher.** Et le warmup vous évite de brûler des numéros à 5€ pièce.

---

### FAQ Comparatif

**Q : Le warmup bloque mes envois ?**  
A : Non. La V1 est en **warnings only** : elle calcule le risque, vous alerte, mais ne bloque pas systématiquement. Vous gardez le contrôle final. C'est de l'éducation, pas de la censure.

**Q : Puis-je passer de MsgFlash à Twilio plus tard ?**  
A : Oui, mais vous devrez re-valider votre numéro chez Meta et recréer vos templates. Prévoyez 2 semaines de transition.

**Q : MsgFlash est-il illégal ?**  
A : Non. Nous utilisons le protocole WhatsApp Web (comme vous le feriez depuis votre navigateur). Ce n'est pas "officiel", ce n'est pas illégal. C'est un gris technique que WhatsApp tolère pour l'instant.

**Q : Pourquoi 360dialog coûte 49€/mois sans interface ?**  
A : Parce qu'ils paient Meta pour être BSP officiel. Vous payez cette certification, pas la technologie.

---

**CTA** : [Tester gratuitement — 50 messages offerts]  
**CTA secondaire** : [Lire notre guide sur les risques →](/risques)

---

## 📄 PAGE /RISQUES (mise à jour)

**H1** : Les risques de MsgFlash — qu'on ne vous cache rien

**Sous-titre** : Nous ne sommes pas l'API officielle. Voici ce que ça signifie concrètement, et comment notre système de **warmup** vous protège de vos propres erreurs.

---

### 🛡️ Votre première ligne de défense : le Warmup MsgFlash

Avant de parler des risques, parlons de **ce que nous faisons pour les réduire**.

Quand vous connectez un numéro WhatsApp, vous avez 48h pour faire une connerie. Envoyer 200 messages à des inconnus ? Banni. Blast promotionnel dès le J+1 ? Banni. Spammer sans réponses ? Banni.

**MsgFlash Warmup est un coach intelligent** qui observe votre instance et vous guide :

#### Comment ça marche

1. **Démarrage progressif** : Au premier `connected`, l'instance entre en état `new` puis `warming`. Les premiers jours, le système recommande des volumes faibles.
2. **SafetyScore en temps réel** : Score de 0 à 100 basé sur :
   - Âge de l'instance (un vieux numéro = plus de confiance)
   - Volume outbound récent (trop rapide = dangereux)
   - Nombre de destinataires uniques (blast = risque)
   - Réponses inbound (un dialogue = sain, du one-way = suspect)
   - Type de contacts : `warm` (vous avez déjà parlé), `cold` (jamais contacté), `unknown`
3. **Distinction envoi unitaire vs campagne** : Un message à un client existant est moins risqué qu'une campagne vers 100 inconnus. Le warmup adapte ses seuils.
4. **Warnings + Recommandations** : Quand le score baisse, l'API renvoie :
   ```json
   {
     "warning": "high_volume_cold_contacts",
     "reason": "50 messages vers des contacts cold en 10 minutes",
     "recommendation": "Ralentissez à 5 messages/heure. Privilégiez les contacts warm.",
     "currentState": "at_risk",
     "safetyScore": 35
   }
   ```
5. **Health dashboard** : Vue complète de la santé de chaque instance (score, état, limites, historique).

#### Les 5 états de votre instance

| État | Score | Signification | Action recommandée |
|---|---|---|---|
| `new` | 0-20 | Instance fraîchement connectée | Attendre 24h avant premier envoi, limiter à 10 messages/jour |
| `warming` | 20-50 | En phase d'apprentissage | Volume progressif, privilégier les contacts warm |
| `stable` | 50-80 | Comportement sain | Volume normal, surveillance standard |
| `at_risk` | 80-95 | Comportement suspect | Ralentir immédiatement, vérifier la qualité des contacts |
| `restricted` | 95-100 | Risque imminent de ban | Pause forcée recommandée, audit complet |

**⚠️ Important** : La V1 est en **warnings only**. Elle ne bloque pas systématiquement l'envoi. C'est votre responsabilité de suivre les recommandations. Nous vous donnons les données, vous prenez les décisions.

---

### 🟡 Risque 1 : Bannissement du numéro

**Qu'est-ce que c'est ?**  
WhatsApp détecte les comportements automatisés et bannit le numéro.

**Quel est le risque réel ?**
- Sans warmup, utilisation transactionnelle : **~15% de ban**
- Avec warmup + recommandations suivies : **< 2% de ban**
- Avec spam ou marketing massif : **> 50% de ban en 48h**

**Comment minimiser (en plus du warmup) :**
1. **Utilisez un numéro dédié** (pas votre WhatsApp perso)
2. **Variez le contenu** des messages
3. **Respectez les horaires** (pas d'envoi 3h du matin)
4. **Laissez des délais** entre les messages (5-10 sec minimum)
5. **Suivez les recommandations du warmup**

**Si vous êtes banni :**  
Votre numéro est perdu. Vos conversations aussi. Vous devez en racheter un autre et reconfigurer. C'est pourquoi nous recommandons les numéros virtuels bon marché (~5€/mois chez Twilio ou Onoff).

---

### 🟡 Risque 2 : Pas de green tick vérifié

**Qu'est-ce que c'est ?**  
Le green tick certifie que votre numéro appartient bien à votre marque.

**Pourquoi vous ne l'aurez pas avec MsgFlash :**  
Seuls les BSP officiels Meta peuvent demander la vérification.

**Quand ça importe :** E-commerce B2C avec marque connue, service client public, finance/santé.  
**Quand ça n'importe pas :** Notifications internes, relances transactionnelles, bots internes.

---

### 🟡 Risque 3 : Pas de templates pré-approuvés

**Avantage de MsgFlash :** Vous envoyez ce que vous voulez, quand vous voulez. Pas d'attente.  
**Inconvénient :** Si vous abusez, WhatsApp bannira plus vite. Le warmup vous alerte, mais c'est votre responsabilité.

---

### 🟡 Risque 4 : Dépendance au protocole WhatsApp Web

**Quel est le risque ?** Indisponibilité temporaire si Meta change ses protocoles.  
**Notre mitigation :** Monitoring 24/7, tests sur bêta, communication transparente sur [status.msgflash.com](/status), backup technique.

---

### 🟢 Ce qui N'EST PAS un risque

| Mythe | Réalité |
|---|---|
| "C'est illégal" | Non. Nous utilisons le même protocole que WhatsApp Web. |
| "Vos données sont volées" | Non. Nous ne stockons pas le contenu de vos messages. |
| "Meta va vous poursuivre" | Non. Meta bannit les numéros, elle ne poursuit pas les utilisateurs. |
| "Le warmup bloque tout" | Non. La V1 est warnings only. Vous gardez le contrôle. |

---

### Notre recommandation finale

**Utilisez MsgFlash si :**
- Vous acceptez le risque de ban comme coût de faire business
- Vous avez un numéro dédié et jetable
- Vous **suivez les recommandations du warmup**
- Vous envoyez des messages transactionnels
- Vous voulez itérer vite sans friction Meta

**N'utilisez PAS MsgFlash si :**
- Votre numéro WhatsApp est critique pour votre business
- Vous opérez dans un secteur régulé (santé, finance, légal)
- Vous avez besoin du green tick
- Vous **ignorez les warnings du warmup** (vous serez banni)

---

**CTA** : [J'ai compris les risques — tester gratuitement]  
**CTA secondaire** : [Je préfère l'API officielle — comparer les BSP →](/comparatif)

---

## 📄 PAGE /FEATURES (nouvelle)

**H1** : Fonctionnalités MsgFlash — L'API WhatsApp pensée pour les makers

**Sous-titre** : Pas de bullshit corporate. Voici ce que MsgFlash fait, comment ça marche, et pourquoi les devs et makers nous choisissent.

---

## 🚀 Core API

### Envoi de messages
Un seul endpoint REST pour tout :
- **Texte** : messages simples avec variables
- **Médias** : images, documents, audio, vidéo
- **Réponses** : reply-to pour les conversations threadées
- **Format** : JSON pur, pas de XML, pas de SOAP

```bash
POST https://api.msgflash.com/v1/messages
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "to": "+33612345678",
  "type": "text",
  "message": "Votre commande #123 est prête !",
  "instanceId": "prod"
}
```

### Réception & Webhooks
Recevez tout en temps réel sur votre URL :
- **Messages entrants** : texte, médias, localisation
- **Statuts de livraison** : sent, delivered, read, failed
- **Erreurs** : numéro invalide, instance déconnectée, rate limit
- **Format** : JSON signé, idempotency key inclus

```json
{
  "event": "message.received",
  "timestamp": "2026-05-07T12:34:56Z",
  "data": {
    "from": "+33612345678",
    "body": "Merci pour l'info !",
    "messageId": "msg_abc123",
    "instanceId": "prod"
  }
}
```

### Gestion multi-instances
Connectez plusieurs numéros WhatsApp sur un seul compte :
- **Instances nommées** : `prod`, `support`, `marketing-fr`
- **Isolation** : chaque instance a ses propres webhooks, quotas, et warmup
- **Dashboard central** : vue unifiée de toutes vos instances

---

## 🛡️ Warmup & Protection (V1)

### Le problème que ça résout
Quand vous connectez un nouveau numéro WhatsApp et envoyez 500 messages le premier jour, WhatsApp vous bannit en 24h. C'est mécanique.

### Notre solution : SafetyScore
Un système intelligent qui évalue la santé de chaque instance en temps réel :

#### Métriques surveillées
- **Âge de l'instance** : un numéro connecté depuis 30 jours a plus de confiance qu'un numéro de J+1
- **Volume outbound** : pic de 200 messages/heure = alerte
- **Destinataires uniques** : 50 contacts différents en 1h = plus risqué que 50 messages au même contact
- **Réponses inbound** : un taux de réponse élevé = comportement sain
- **Qualité des contacts** :
  - `warm` : vous avez déjà eu une conversation
  - `cold` : jamais contacté, mais numéro valide
  - `unknown` : numéro non vérifié

#### Les 5 états de santé

| État | Score | Description |
|---|---|---|
| `new` | 0-20 | Instance fraîche, phase d'observation |
| `warming` | 20-50 | Apprentissage progressif, volumes limités |
| `stable` | 50-80 | Comportement sain, surveillance standard |
| `at_risk` | 80-95 | Comportement suspect, action requise |
| `restricted` | 95-100 | Risque critique, pause recommandée |

#### Warnings & Recommandations
Quand le système détecte un risque, il enrichit la réponse API :

```json
{
  "messageId": "msg_xyz789",
  "status": "sent",
  "warmup": {
    "safetyScore": 35,
    "state": "at_risk",
    "warning": "high_volume_cold_contacts",
    "reason": "47 messages vers contacts cold en 15 minutes",
    "recommendation": "Ralentir à 5 messages/heure. Privilégier les contacts warm.",
    "limits": {
      "recommendedHourly": 5,
      "recommendedDaily": 50,
      "currentHourly": 47
    }
  }
}
```

#### Dashboard de santé
Vue complète par instance :
- Score historique (graphique 30 jours)
- État actuel avec couleur
- Derniers warnings
- Recommandations personnalisées
- Volume envoyé vs limites recommandées

**⚠️ V1 = Warnings Only** : Le système calcule, alerte, recommande. Il ne bloque pas systématiquement l'envoi. Vous gardez le contrôle final.

---

## 🔌 Intégrations

### n8n
Node natif avec authentification simple. Templates prêts à l'emploi :
- Relance de panier e-commerce
- Alertes monitoring serveur
- Confirmation de rendez-vous

### Zapier
Trigger "Nouveau message WhatsApp" + Action "Envoyer message WhatsApp". Connecté à 5 000+ apps.

### Make (Integromat)
Modules complets pour scénarios complexes : filtres, routeurs, itérateurs.

### Backend custom
SDK officiels :
- **JavaScript/Node.js** : `npm install msgflash`
- **Python** : `pip install msgflash`
- **PHP** : `composer require msgflash/api`
- **Go** : `go get github.com/msgflash/go-sdk`

Tous avec retry automatique, gestion d'erreurs, et types TypeScript.

---

## 📊 Dashboard & Analytics

### Vue d'ensemble
- Messages envoyés/délivrés/lus (24h, 7j, 30j)
- Instances actives vs déconnectées
- Taux de délivrabilité global
- Volume par instance

### Par instance
- Historique des messages (avec filtres)
- Webhooks logs (delivery, erreurs, retries)
- **Warmup health** (score, état, warnings)
- QR code de reconnexion (si déconnecté)

### Export
- CSV des messages (pour audit)
- JSON des webhooks (pour debug)
- API analytics (pour vos propres dashboards)

---

## 🔒 Sécurité

- **Tokens API** : rotation automatique, scopes par instance
- **Webhooks signés** : signature HMAC pour vérifier l'authenticité
- **HTTPS forcé** : pas de HTTP en production
- **Pas de stockage de contenu** : nous ne conservons pas le texte de vos messages, seulement les métadonnées
- **RGPD compliant** : droit à l'effacement, export des données

---

## ⚡ Performance

- **Latence API** : < 200ms pour l'envoi (Europe)
- **Rate limits** : 30 msg/min (Maker), 100 msg/min (Pro), 300 msg/min (Scale)
- **Uptime** : 99% (Maker), 99.5% (Pro), 99.9% (Scale)
- **Webhooks** : delivery en < 2 secondes, retry 3x en cas d'échec

---

## 🆚 Ce que MsgFlash ne fait PAS (et pourquoi)

| Feature | Pourquoi on ne le fait pas | Alternative |
|---|---|---|
| **Green tick vérifié** | Nécessite d'être BSP officiel Meta | Twilio, 360dialog |
| **Templates Meta** | Nécessite l'API Cloud officielle | API officielle |
| **Catalogue produit** | Protocole WhatsApp Web limité | API officielle + Shopify |
| **Paiement in-chat** | Non supporté par WhatsApp Web | API officielle (Brésil/Inde) |
| **Appels vocaux** | Hors scope, focus texte/médias | WhatsApp natif |
| **Modération IA** | Complexe, coûteux, pas notre cœur de métier | Warmup + votre logique métier |

**Notre philosophie** : Faire moins, mais mieux. L'API WhatsApp pour les makers qui veulent envoyer des messages rapidement, pas pour les enterprises qui veulent tout.

---

## 🎯 Pour qui c'est fait

**✅ Parfait pour :**
- Développeurs qui intègrent WhatsApp dans leur SaaS
- Makers no-code (n8n, Zapier, Make)
- Agences qui gèrent WhatsApp pour plusieurs clients
- Startups early-stage qui veulent shipper vite

**❌ Pas pour :**
- Grandes entreprises (besoin SLA 99.99%, support dédié)
- E-commerces avec catalogue produit intégré
- Secteurs régulés (santé, finance)
- Marketers agressifs (spam, blasting)

---

**CTA** : [Tester gratuitement — 50 messages offerts]  
**CTA secondaire** : [Voir les tarifs →](/tarifs)  
**CTA tertiaire** : [Lire la documentation →](/documentation)

---



Le Warmup est positionné comme :
1. **Différenciateur clé** dans le comparatif (personne d'autre ne le fait)
2. **Première ligne de défense** dans la page risques (avant même de parler des dangers)
3. **Feature phare** dans la page features, avec explication technique complète

Tu veux que j'ajuste le ton, que je creuse un aspect technique, ou que je crée d'autres pages ?