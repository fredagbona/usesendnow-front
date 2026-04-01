# UseSendNow — Documentation

Ce dossier contient le contenu de la documentation hébergée sur Mintlify.

## Structure
```
mint.json              → configuration Mintlify
introduction.mdx       → page d'accueil
quickstart.mdx         → démarrage rapide
authentication.mdx     → guide d'authentification
guides/                → guides thématiques
resources/             → référence (plans, erreurs, types)
api-reference/         → référence API (+ OpenAPI auto depuis /docs.json)
images/                → logo, favicon
```

## Déploiement

Mintlify détecte ce dossier automatiquement depuis GitHub.
Domaine: docs.usesendnow.com

## Modifier le contenu

1. Éditer les fichiers `.mdx`
2. Push sur `main`
3. Mintlify redéploie automatiquement

## Ajouter une page

1. Créer le fichier `.mdx` dans le bon dossier
2. L'ajouter dans `mint.json` sous `navigation`
3. Push
