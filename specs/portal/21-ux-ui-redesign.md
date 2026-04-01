UI/UX Specification: Redesign "UseSendNow" 2026
1. Direction Artistique & Identité Visuelle
L'objectif est d'adopter un style "Modern Enterprise SaaS" : minimaliste, haute précision, avec une palette de couleurs sobre relevée par un vert émeraude "WhatsApp".

Palette de Couleurs :

Primaire : #22C55E (Vert émeraude) pour les actions principales (CTA) et les indicateurs de santé.

Fond (Background) : #F9FAFB (Gris très clair) pour le body, Blanc #FFFFFF pour les cartes.

Surfaces Sombre : Utilisation de cartes sombres (#0F172A) uniquement pour les sections critiques comme le monitoring de débit ou les blocs de code API.

Bords : Arrondis (Border-radius) de 12px à 16px.

Iconographie : Utilisation exclusive de la bibliothèque HugeIcons (style Stroke ou Two-tone pour les états actifs).

Typographie : Sans-serif moderne (ex: Inter, Geist ou Satoshi). Graisses : Regular (400) et Medium (500) pour le texte, Semibold (600) pour les titres.

2. Structure Layout (Layout.tsx)
Le layout doit être divisé en trois zones distinctes :

Sidebar de Navigation (Gauche) : Fine, épurée. Utiliser les composants Listbox de HeroUI pour les items de menu. Inclure un bouton "New Pipeline" distinct en bas de sidebar.

Top Navigation (Header) : Fil d'ariane (Breadcrumbs), barre de recherche globale, sélecteur de statut d'infrastructure et profil utilisateur.

Main Content : Utilisation de Grid et Flex pour des espacements larges (gap-6 ou gap-8).

3. Spécifications par Pages
A. Dashboard & Instances (Vue Principale)
Stats Cards : Créer des cartes de statistiques avec de grands chiffres et des mini-indicateurs de tendance en dessous (ex: "Global Health 99.98%").

Tableau d'Instances : Utiliser le composant Table de HeroUI avec :

Des Badges pour le statut (Online = Vert, Connecting = Orange).

Des colonnes aérées (ID, Numéro, Région, Uptime).

Actions rapides au survol (Edit, Reboot, Delete).

Pipeline Visualizer : Intégrer un flux visuel (Step indicator) montrant le cheminement du message (API Gateway -> Queue -> WhatsApp API).

B. Account Settings (Ref: Screenshot 2)
Segmentation par Cartes : Diviser les paramètres en blocs logiques (Card de HeroUI).

Personal Information : Formulaire simple avec upload de photo de profil circulaire.

Workspace Preferences : Utiliser des Select personnalisés pour la région et des Tabs ou Switch pour le thème et l'interaction CLI.

Sidebar Interne (Security & Billing) : Colonne de droite pour les paramètres de sécurité (2FA), le changement de mot de passe et le récapitulatif du forfait (Tier).

Indicateur de Consommation : Une barre de progression (Progress HeroUI) montrant le "Monthly Throughput" (ex: 4.1M / 5.0M messages).

C. API Management & Webhooks
Gestion des clés : Tableau listant les clés API avec masquage partiel (ex: sk_live_••••••••).

Code Snippets : Utiliser des blocs de code stylisés (fond noir, syntaxe colorée) pour les exemples de "Quick Start Integration".

Logs en Temps Réel : Console de logs interactive avec défilement automatique pour les événements de webhook.

4. Composants Clés à utiliser (HeroUI)
Demandez au dev de privilégier ces composants pour la cohérence :

Card : Avec shadow="sm" et isBlurred={false}.

Button : Utiliser la variante solid pour le vert et flat pour les actions secondaires.

Input & Select : Variante bordered avec un rayon de bordure doux.

Kbd : Pour afficher les raccourcis clavier dans la recherche.

5. Mobile & Responsive
Sidebar : Doit devenir un menu tiroir (Drawer/Modal) sur mobile.

Dashboard : Les cartes de statistiques passent en 1 colonne, le tableau d'instances devient une liste de cartes extensibles.

Note au développeur : Le design doit respirer. Ne pas avoir peur du "White Space". Chaque interaction (hover sur un bouton, changement de tab) doit avoir une micro-transition fluide (transition-all duration-200).