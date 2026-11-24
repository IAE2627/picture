# Abstral 2.5L · Outil d'aide à la décision prix

Dashboard interactif sur la veste Abstral 2.5L de Picture Organic Clothing :
présentation produit (vue 3D), cercles concurrentiels, coûts de fabrication,
simulateur de remise hivernale, questionnaire et synthèse.

## Voir le site
Ouvrir `index.html` dans un navigateur, ou activer GitHub Pages
(Settings → Pages → branche `main`, dossier `/root`).

## Sources du code
- `src/data.jsx` : toutes les données (prix, comptes, liens sources, hypothèses de calcul)
- `src/app.jsx` : l'application React (onglets, graphiques Recharts, vue Three.js)
- `src/input.css` : styles (Tailwind + thème clair/sombre)

## Données
Toutes les valeurs affichées sont dans `src/data.jsx` : résultats du questionnaire (`SURVEY`), marge de référence 2025 (`PICTURE_2025`, `MARGE_2025`), élasticités (`ELASTICITE`), chaîne de valeur (`chaineValeur`).

Après modification de `src/`, reconstruire le site : `node build.js` (Node requis).

`index.html` est la version compilée, autonome (React, Recharts, Lucide et Three.js chargés depuis un CDN).
