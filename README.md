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

## Synchronisation Supabase (version expérimentale)

1. Dans le dossier du projet, copie `.env.example` vers `.env.local`.
2. Renseigne `VITE_SUPABASE_URL` (Project URL) et `VITE_SUPABASE_PUBLISHABLE_KEY` (clé `sb_publishable_...`). Ne mets jamais une clé `sb_secret_...` dans l'application.
3. Redémarre Vite après toute modification de `.env.local` (`npm run dev`).
4. Dans l'application, crée un compte personnel avec ton adresse e-mail et un mot de passe, puis connecte-toi. Si la confirmation d'adresse est activée dans Supabase, valide le lien reçu avant de te connecter.
5. Dans Supabase SQL Editor, exécute le contenu de `supabase/grants.sql` si les droits API des tables ne sont pas déjà accordés.
6. Clique sur « Synchroniser maintenant » sur chaque appareil. Fais d'abord une sauvegarde JSON depuis chaque appareil.

La collection reste stockée dans IndexedDB et consultable hors ligne. La synchronisation est déclenchée manuellement lorsqu'une connexion Internet est disponible. Les suppressions sont conservées sous forme de marqueurs locaux et distants afin qu'elles ne réapparaissent pas lors d'une fusion. Les photos sont actuellement synchronisées avec les données JSON (base64) ; le bucket privé est préparé dans Supabase mais le transfert séparé des fichiers vers Storage n'est pas encore activé.

Pour le déploiement GitHub Pages, ajoute dans le dépôt GitHub (Settings > Secrets and variables > Actions > Variables) les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`, puis configure le workflow pour les injecter pendant le build. Le fichier `.env.local` n’est utilisé que pour les essais locaux et ne doit pas être publié.

Important : la première synchronisation doit être faite après sauvegarde JSON des appareils concernés. Connecte le même compte sur chacun et lance la synchronisation pour fusionner les contenus. Ne restaure pas une sauvegarde en mode remplacement après activation de la synchronisation.
