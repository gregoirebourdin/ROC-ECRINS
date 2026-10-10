# Roc Écrins · page d'accueil

Nouvelle page d'accueil de [roc-ecrins.com](https://www.roc-ecrins.com/) : une course de 24 h, de la porte de l'agence (1 000 m) au sommet de la Barre des Écrins (4 102 m).

La direction artistique, la sélection des photos, le storyboard et la relecture critique sont dans [`docs/direction-artistique.md`](docs/direction-artistique.md).

## Voir la page

```sh
python3 -m http.server 8765   # puis http://127.0.0.1:8765/
```

Aucune dépendance à installer : GSAP 3.15, ScrollTrigger et Lenis 1.3 sont servis depuis `assets/js/vendor/`.

**Police de titrage.** Le fichier `assets/fonts/adventure.woff2` n'est pas versionné : le dépôt est public, et la licence web d'Adventure (SiapGraph) doit d'abord être confirmée. Pour l'ajouter, générer le sous-ensemble depuis le fichier OTF avec `tools/subset_fonts.sh` (voir `assets/fonts/LICENCES.md`).

## Structure

```
index.html             page générée (ne pas modifier à la main)
src/index.html         gabarit : <!--img:…-->, <!--departs-->, <!--jsonld-->
assets/css/main.css    styles (4 couleurs de marque, grille 12 colonnes, base 8 px)
assets/js/main.js      animations : ouverture, trace, altimètre, tampons, traversée,
                       saisons, module « Trouve ton aventure », nuit, frontales, invités
assets/fonts/          Adventure (titres), Caveat Brush (annotations), Instrument Sans (texte)
assets/img/            photos étalonnées en AVIF + WebP, plans de parallaxe, détourages
data/sejours.json      154 séjours réels + 12 prochains départs (relevé du 10/10/2026)
tools/                 pipeline d'images, données et HTML
docs/                  note DA, avant/après de l'étalonnage, vue éclatée de la parallaxe
```

## Régénérer

```sh
python3 tools/build_html.py   # index.html depuis src/index.html + data/sejours.json + images
```

Les scripts du pipeline d'images (Python 3, Pillow, NumPy, OpenCV, onnxruntime) :

1. **`tools/grade.py`** : étalonnage commun à toutes les photos.
2. **`tools/depth.py`** : carte de profondeur ([Depth Anything V2 Small](https://huggingface.co/onnx-community/depth-anything-v2-small), Apache-2.0).
3. **`tools/hero_layers.py`** : découpe de l'ouverture en 4 plans, avec remplissage [LaMa](https://huggingface.co/Carve/LaMa-ONNX) (Apache-2.0) derrière les plans.
4. **`tools/cutout.py`** : détourage des animaux ([BiRefNet](https://huggingface.co/onnx-community/BiRefNet-ONNX), MIT).
5. **`tools/build_images.py`** : export AVIF/WebP à partir de `tools/images.json`, qui liste la sélection, les recadrages et les textes alternatifs.
6. **`tools/build_data.py`** : `data/sejours.json` à partir du relevé du site.
7. **`tools/subset_fonts.sh`** : sous-ensembles des polices.
8. **`tools/avant_apres.py`** : planches avant/après de l'étalonnage.

## Intégration dans SPIP

- La liste « Prochains départs » et ses données structurées (`Event`/`TouristTrip`) doivent être produites par une boucle SPIP sur l'agenda. Leur structure HTML est celle de `.depart`.
- `data/sejours.json` doit être généré par un squelette SPIP avec les mêmes champs : `t`, `u`, `a`, `e`, `s`, `l`, `j`, `p`, `x`, `n`, `r`.
- Les liens pointent vers les pages existantes du site : agendas, fiches séjours, bon cadeau, contact.

## Points à confirmer avant la mise en ligne

Ils sont détaillés à la fin de [`docs/direction-artistique.md`](docs/direction-artistique.md) :
- les horaires ;
- le prix du stage Roche Faurio ;
- la licence web de la police Adventure ;
- les crédits photo ;
- l'accord pour deux grimpeurs visibles de loin.
