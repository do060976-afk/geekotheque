# Geekothèque – Collection vierge + Encyclopédie

Application React/Vite locale, avec stockage IndexedDB.

## Fonctionnalités ajoutées
- Rubrique **Encyclopédie** indépendante de l'inventaire.
- Une fiche est créée automatiquement lorsqu'un objet est enregistré avec un nouvel univers (les photos d'ambiance ne créent pas de fiche).
- Création manuelle d'une fiche, même sans objet associé.
- Fiches conservées sur l'appareil : synopsis, type, année, pays, créateurs, réalisateur, studio, distribution/personnages, affiche et galerie d'images.
- Recherche TMDB avec sélection explicite du résultat. La clé API est conservée dans le stockage local du navigateur et n'est jamais incluse dans les exports.
- Recherche Wikidata sans clé API pour retrouver une entité et importer sa description et sa date de création quand disponible.
- Plusieurs génériques YouTube par œuvre : titre, langue, type, URL, description et lecteur intégré.
- Sauvegarde JSON inclut désormais les fiches encyclopédiques. Import fusionne les objets et les fiches.

## TMDB
Créer un compte développeur sur https://www.themoviedb.org/ et obtenir un jeton API Read Access. Le saisir dans le champ « Clé API personnelle » de l'éditeur d'une fiche. Il reste sur cet appareil. Sans clé TMDB, les fiches restent entièrement utilisables manuellement et la recherche Wikidata reste disponible.

Les informations et images TMDB sont soumises aux conditions d'utilisation et à l'attribution TMDB : https://www.themoviedb.org/terms-of-use. Pour un déploiement public, vérifier les obligations d'attribution et les conditions applicables à l'usage du service.

## Vidéos et mode hors connexion
Les fiches, textes et URL sont conservés localement et consultables hors ligne. La lecture YouTube et les images distantes nécessitent une connexion Internet. Les vidéos ne sont pas téléchargées dans l'application.

## Développement
- `npm install`
- `npm run dev`
- `npm run build`

La collection ne contient aucun objet de démonstration. Le stockage IndexedDB est versionné et la migration ne vide pas le magasin existant.
