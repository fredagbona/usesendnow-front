# MsgFlash — Documentation

Ce dossier contient le contenu de la documentation hébergée sur Mintlify.

## Structure
```
docs.json              → configuration Mintlify (`navigation.languages` EN/FR, thème, menu contextuel). Le champ `theme` doit être un thème `docs.json` Mintlify (ex. `mint`), pas l’ancien `prism` du `mint.json`.
introduction.mdx      → accueil anglais · `fr/…` → contenu français (même arborescence de fichiers)
quickstart.mdx
authentication.mdx
guides/                → guides thématiques
resources/             → référence (plans, erreurs, types)
api-reference/         → référence API
images/                → logo, favicon
```

## Déploiement

Mintlify détecte ce dossier automatiquement depuis GitHub.
Domaine: docs.msgflash.com

## Modifier le contenu

1. Éditer les fichiers `.mdx`
2. Push sur `main`
3. Mintlify redéploie automatiquement

## Ajouter une page

1. Créer le `.mdx` (ex. `guides/ma-page.mdx`) et, si besoin, la traduction `fr/guides/ma-page.mdx`.
2. Référencer le chemin **sans** préfixe `fr/` dans la langue `en`, et **avec** `fr/…` dans la langue `fr`, dans `docs.json` → `navigation.languages[].groups` (même libellé de groupe côté FR si tu ajoutes à un groupe existant).
3. Push

Le sélecteur de langue (EN / FR) est fourni par Mintlify dès que `navigation.languages` contient au moins deux entrées.
