# Roc Écrins · page d'accueil

Livrables dans l'ordre demandé : note de direction artistique, sélection des photos, storyboard, page codée, relecture critique.

---

## 1. Note de direction artistique

**L'idée directrice.** La page est une course de 24 heures. On part de la porte de l'agence (« départ : 6 rue du Chlorate », 1 000 m), on dort accroché à la falaise, on se lève à 4 h, et on signe la Barre des Écrins à l'aube (4 102 m).

**Titrage : Adventure** (SiapGraph). C'est la police que tu nous as fournie, et elle remplace Big Shoulders Stencil, que j'avais d'abord retenue.
- Ses capitales arrondies, peintes à la main, rappellent les panneaux de refuge et les caisses marquées à la peinture.
- Son côté joueur porte l'humour sans tomber dans le « western ».
- Il lui manque ’ « » € et —. L'apostrophe et les espaces insécables ont été ajoutés au sous-ensemble ; les autres signes ne sont jamais utilisés en titrage.

**Annotations : Caveat Brush.** Un feutre à pointe pinceau, cousin de la signature « Séjours montagne » du logo, et lisible à 22 px. Permanent Marker et Rock Salt étaient trop vus ou trop illisibles.

**Texte : Instrument Sans.** Une linéale sobre, réduite à l'axe de graisse, pour que tout le reste respire.

**Couleurs.**
- **Crème** : le papier du carnet.
- **Sable** : le kraft du module de recherche et les filets pointillés.
- **Brun** : le texte, puis la nuit (en version profonde).
- **Rouge brique** : réservé à ce qui agit ou valide (boutons, trace au feutre, tampons, prix).

**Trois signatures, propres à Roc Écrins.**
1. **La trace et l'altimètre.** Un itinéraire au feutre relie les moments, et l'altimètre monte de la vallée jusqu'aux plaques réelles du Refuge de la Selle, du Dôme et de la Barre. C'est leur terrain, littéralement.
2. **Le passeport.** Le « O » rocher du logo devient le tampon, et ses mouchetures servent d'imperfection d'encre. Les voyages lointains reçoivent des visas.
3. **La nuit suspendue.** Le portaledge se balance au rythme du défilement, la nuit tombe sur la page, puis une cordée de frontales monte vers l'aube.

---

## 2. Sélection des photos (18)

Toutes les photos viennent des pages du site actuel, dans l'entrée la plus large de chaque tableau `img`. Elles reçoivent toutes le même étalonnage (`tools/grade.py`) :
- ombres relevées et teintées brun, jamais de noir pur ;
- blancs de neige nettoyés ;
- demi-teintes réchauffées ;
- saturation plafonnée en douceur sur les couchers de soleil.

| # | Photo (page source) | Rôle | Remarque |
|---|---|---|---|
| 1 | Mer de nuages du nouvel an, Clarée (`sortie/un-long-week-end-ski-de-rando-…-15801`) | Ouverture, parallaxe en 4 plans | Profondeur : Depth Anything V2. Plans : détourage par modèles de couleur et ligne de neige tracée à la main. Zones cachées comblées par LaMa. |
| 2 | Alpiniste de dos, sac orange (`sortie/nouveau-produit-3096`) | « Tout est dans le sac » | Recadrée en 4:5 sur le sac. |
| 3 | Grimpeur au sommet d'une aiguille (`sortie/nouveau-produit-8880`) | Planche alpinisme | |
| 4 | Grimpeur sous le surplomb (`stages-d-escalade-grande-voie-agenda-39`) | Planche escalade | |
| 5 | Passerelle de via ferrata vue d'en haut (`sortie/journee-via-ferrata-en-ecrins`) | Planche via ferrata | Le vrai « pont de singe » de la page. |
| 6 | Vasque du Fournel (`sortie/canyon-du-fournel-314`) | Planche canyoning | Le canyon de L'Argentière. |
| 7 | Skieuse au lever du soleil, refuge de l'Aigle (`stages-de-ski-agenda-25`) | Planche ski de rando | Source en 2 048 px : utilisée à 900 px de large. |
| 8 | Skieur et son ombre (`stages-de-ski-hors-piste-free-ride-agenda-40`) | Planche hors-piste | |
| 9 | Cascade de glace (`sortie/demi-journee-decouverte-cascade-de-glace`) | Planche cascade | |
| 10 | Attelage vu du traîneau (`sortie/raquettes-ski-de-fond-chien-de-traineau-a-nevache`) | Planche chiens de traîneau | |
| 11 | Husky pattes en l'air (`sortie/sejour-multi-activites-hivernales-…-12990`) | Invité surprise de l'hiver | Détouré avec BiRefNet. |
| 12 | Bouquetin couché (`sortie/journee-d-escalade-grandes-voies-pays-des-ecrins`) | Invité surprise de l'été | Détouré, tête et cornes seulement. |
| 13 | Dromadaire en gros plan (`sortie/rendez-vous-a-essendilene-…-11727`) | Invité surprise de « Hors carte » | Détouré. |
| 14 | Aiguilles de grès de la Tadrart (`sortie/nouveau-produit-11785`) | « Hors carte » | |
| 15 | Portaledge et duvet vert (`sortie/nuit-insolite-en-portaledge`) | La nuit suspendue | La photo la plus folle du site. |
| 16 | Marmite sur le feu (`sortie/sejour-insolite-en-bivouac-sur-mesure`) | Autour du feu | |
| 17 | Silhouette au lever du soleil, Meije orientale (`sortie/meije-orientale-et-doigt-de-dieu-58`) | L'aube et le sommet | |
| 18 | Panneau « Dôme des Écrins, alt. 4 015 » (`sortie/ski-alpinisme-pente-raide-…-15522`) | Clin d'œil « plus que 87 m » | |

**Retirées, et pourquoi :**
- **Second portaledge, dunes de Mauritanie, gerbe de poudreuse, plaque du Refuge de la Selle** : pour tenir 18 images. La Selle reste sous forme de plaque sur l'altimètre.
- **Mélèzes du Champsaur** : le nom du fichier porte « o__bonnemaison », donc un photographe extérieur, comme pour le parapente.
- **Lacs de la Clarée** : moins de 1 900 px, et la scène est moins forte.
- **Photos de groupe** : visages reconnaissables, en attente d'accord écrit.

**Avant / après** des trois photos principales : `docs/etalonnage/1-ouverture-mer-de-nuages.jpg`, `2-nuit-en-portaledge.jpg`, `3-aube-meije.jpg`. La vue éclatée des 4 plans est dans `docs/parallaxe-4-plans.jpg`.

**Export.** Chaque photo existe en AVIF et en WebP, en trois largeurs : 1 280, 1 920 et 2 560 px pour les plein-écran, 640, 960 et 1 280 px pour les planches. Les poids mesurés :
- **Ouverture** : 4 plans, 149 Ko en DPR 1 et 221 Ko en DPR 2 sur ordinateur. Sur mobile, 2 plans recadrés en portrait pour 51 Ko.
- **Portaledge** : 243 Ko en 2 560 px.
- **Traversée** : moins de 450 Ko pour les 4 planches visibles.

L'ouverture est préchargée. Le reste se charge en différé, et la saison masquée ne se charge qu'au survol de l'interrupteur.

---

## 3. Storyboard

| Moment | Contenu | Animation au défilement | Transition |
|---|---|---|---|
| **Ouverture** · 1 000 m | « Là-haut, il fait beau. » Note « tes mails sont restés en dessous » + H1 métier/lieu + 2 boutons. | Épinglée. La caméra avance : les 4 plans grandissent à des vitesses de 0,05 / 0,15 / 0,35 / 0,7, et le titre, glissé entre nuages et mélèzes, remonte. | Une page crème au bord déchiré monte sur le paysage. |
| **Tout est dans le sac** · → 1 700 m | « départ : 6 rue du Chlorate ». Liste tout compris, cochée au feutre. Niveaux, tarif syndical, Atout France. | La trace part de l'adresse. Photo révélée par une découpe de rocher. Coches tracées une à une. | La trace file vers la passerelle. |
| **La traversée** · → 2 673 m | « Choisis ta saison. » Interrupteur Été / Hiver. 4 planches + « Et aussi ». | Épinglée, défilement horizontal. La passerelle se creuse et ondule selon la vitesse. Chaque planche reçoit son tampon au centre. Le bouquetin passe la tête (été), le husky roule dans le cadre (hiver). | Plaque « Refuge de la Selle · 2 673 m ». |
| *Bascule de saison* | | La neige recouvre la page (une vraie nappe avec un bord de congère, « HIVER » tamponné dessus), tout change dessous, puis elle glisse. En été, c'est la terre sable qui remonte. | |
| **Alors, on part où ?** · → 3 000 m | Une phrase à trois choix : saison, niveau, envie. 3 séjours avec leurs prochaines dates. Puis les 6 prochains départs. | Le choix est entouré au feutre. Les résultats arrivent en cascade. « plus que 2 places » écrit à la main. | La trace sort du cadre : « petit détour ». |
| **Hors carte** | Algérie, Mauritanie, Verdon, Calanques. | Photo découpée. Deux visas tombent. Le dromadaire monte et regarde : « il a vu ton sac. pas impressionné. » L'altimètre affiche « hors carte ». | |
| **Une nuit dans le vide** · → 3 200 m | 2 jours, 1 à 2 pers., dès 230 €, bouton « Réserver ma nuit suspendue ». Note « somnambules, s'abstenir ». | Épinglée. La photo se balance (ressort lié à la vitesse, plus un pendule lent). Le crépuscule descend, puis la nuit tombe sur toute la page. | La page reste brun nuit. |
| **Frédo, pour les copains** · → 3 450 m | Frédo et Emilie, 2013. « Pas forcément plus haut ou plus loin, mais mieux. » L'équipe. | Trace en pointillés crème. Marmite révélée. Note « dîner servi à la frontale ». | |
| **Réveil : 4 h** · → 4 015 m | « Oui, c'est tôt. Mais regarde la suite. » | Scène collante. 24 frontales s'allument en zigzag. Une redescend : « lui, il a oublié le thermos ». Le panneau du Dôme arrive : « plus que 87 m ». | Le jour se lève : la nuit quitte la page. |
| **Sommet** · 4 102 m | Silhouette à l'aube. « Et toi, c'est pour quand ? » Boutons, téléphone, bon cadeau (« pour celui qui a déjà tout, sauf un sommet »). | La trace finit par une croix, et le tampon « 4 102 M VALIDÉ ! » s'abat à côté. Le billet du bon cadeau se détache au survol. | Pied de page brun, l'altimètre s'efface. |

Le téléphone (`tel:+33484131408`) reste visible en permanence dans l'en-tête. Depuis n'importe quel écran, il faut au plus deux clics pour voir les prochains départs, trouver un séjour à son niveau, appeler ou offrir un bon cadeau.

---

## 4. La page codée

- `index.html` est généré par `python3 tools/build_html.py` à partir de `src/index.html`. Il contient les `<picture>`, la liste des départs et les données structurées.
- `assets/css/main.css`, `assets/js/main.js`, et GSAP 3.15 + ScrollTrigger + Lenis 1.3 servis en local depuis `assets/js/vendor/`.
- `data/sejours.json` : 154 séjours réels (niveau, saison, prix « à partir de », prochaines dates), relevés le 10/10/2026.
- Le pipeline d'images est décrit dans le `README.md`.

---

## 5. Relecture critique, comme un jury

**Notes.**
- **Design : 8/10.** Une direction nette (papier, feutre, tampon, nuit) portée par de vraies photos. Adventure donne de la chaleur, mais un jury pourrait le trouver un peu « jovial » pour du Mont Blanc.
- **Ergonomie : 8/10.** Le téléphone est toujours là, le module de recherche tient en un geste et les départs en deux clics. En revanche, la page est longue (≈ 16 600 px sur ordinateur, à cause des trois scènes épinglées), et une section horizontale déroute toujours un peu.
- **Créativité : 9/10.** Altimètre, trace, tampons, nuit et frontales, neige-matière et invités : chaque idée vient du métier de Roc Écrins, aucune n'est un effet générique.
- **Contenu : 8,5/10.** Les faits d'abord (4 102 m, 230 €, tout compris, Atout France, tarif syndical) et l'humour en annotation. 400 mots visibles par saison, tampons compris.

**« Ce que je ne veux plus voir », repassé.**
- **Petits textes de remplissage** : non. Chaque note est accrochée à un objet ou à une flèche. Elles sont 14, c'est la limite haute, et j'en ai déjà retiré une (« ici, tout le monde hésite »).
- **Numérotation « 01 — », capitales décoratives** : aucune. Les capitales sont réservées aux titres, aux tampons et aux plaques.
- **Icônes en grille, cartes ombrées, carrousel, logos partenaires** : aucun.
- **Dégradés en taches, verre dépoli, néon** : aucun. Seulement des voiles linéaires sous les textes et des halos de frontale en aplat à 13 %.
- **3D filaire, particules de neige, curseur perso, boutons magnétiques** : aucun. La neige est une matière, pas des flocons.
- **Image de banque ou générée par IA** : aucune. LaMa ne sert qu'à prolonger les nuages derrière les mélèzes.
- **Écran de chargement** : aucun.
- **« Défiler », « En savoir plus », « Découvrir »** : absents (sauf dans le nom de produit « demi-journée découverte »).

**Fluidité et poids.**

Mesures faites dans Chromium headless, en rendu logiciel sans GPU, sur un défilement complet à la molette.
- **Temps d'image** : médiane 16,7 ms, p95 16,8 ms, 0,1 % d'images au-delà de 33 ms.
- **Ce que je n'ai pas pu vérifier** : je n'ai pas d'ordinateur portable récent pour certifier « zéro image sous 60 i/s ». Le résultat en rendu logiciel est encourageant, mais c'est à confirmer sur un vrai appareil.

Poids compressés en gzip :
- **JS** : 63 Ko, GSAP compris (limite : 200 Ko).
- **CSS** : 11 Ko.
- **HTML** : 18 Ko.
- **Polices** : 94 Ko.

En local, le LCP est de 0,43 s et le CLS de 0,005. **Pas mesuré** : le LCP en 4G bridée. Avec 149 Ko d'images au-dessus de la ligne de flottaison et des polices préchargées, il devrait rester sous 2,5 s.

**prefers-reduced-motion.** Testé. Tout est posé d'emblée : trace dessinée, tampons visibles, altimètre au sommet (4 102 m), frontales allumées, sections de nuit sur fond brun. Pas de Lenis, pas d'épinglage, et la section horizontale devient un défilement natif.

**Mobile à 390 px.** Testé. Parallaxe sur 2 plans recadrés en portrait, trace verticale dans la marge, altimètre compact, planches à faire défiler au doigt, aucun débordement horizontal.

**Les quatre questions.**
- **Envie de réserver en 30 secondes ?** Oui. Le premier bouton mène au module, qui sort trois vrais départs datés et chiffrés. Le portaledge, lui, se réserve sur demande.
- **Souri au moins deux fois ?** Oui : les mails sous les nuages, le husky, le dromadaire, le thermos, « plus que 87 m ».
- **Reconnaît-on Roc Écrins sans le logo ?** Oui : le rocher-tampon, le brique et le brun, la rue du Chlorate, le Fournel, la Barre, Frédo.
- **Site of the Day ?** Candidat sérieux. Pour l'assurer, il faudrait :
  - une carte-topo dessinée de la voie normale de la Barre en fil rouge ;
  - un plan vidéo court (une cordée de frontales réelle) ;
  - un passage sur un vrai mobile milieu de gamme pour régler les amplitudes.

**Corrigé avant de rendre**, suite à cette relecture :
- l'accent de « LÀ » rogné ;
- la scène « Réveil » qui ne collait pas ;
- la nappe de neige hors écran ;
- le bouquetin caché ;
- le titre de la traversée qui chevauchait les planches ;
- le titre mobile masqué ;
- les images mobiles chargées sur ordinateur ;
- la saison cachée chargée pour rien ;
- les polices allégées de 30 % ;
- le texte ramené à 400 mots.

---

## À faire confirmer par l'agence avant la mise en ligne

1. **Horaires.** Ils sont volontairement absents de la page et des données structurées. La page contact indique lundi–samedi 9 h–12 h et 13 h 30–17 h 30 ; d'autres pages indiquent 8 h–18 h.
2. **Prix du stage Roche Faurio.** Le brief annonce 690 €, mais le site affiche aujourd'hui « à partir de 670 € » et des départs seulement en 2027. La page n'avance donc aucun prix pour ce stage. Le module affiche les données réelles du site.
3. **Licence web de la police Adventure** (SiapGraph). Le fichier fourni semble provenir d'un site de polices gratuites. Il faut une licence d'usage commercial sur le web avant la mise en ligne.
4. **Crédits photo.** À rattacher à Frédéric Jullien, Thibault Blais, Pierre Masclaux et François Mochi quand l'agence aura dit qui a pris quoi. Le pied de page indique pour l'instant « Photos : Roc Écrins ».
5. **Personnes à l'image.** Aucun visage n'est montré de face. Le grimpeur de l'aiguille et celui du surplomb restent petits, mais doivent être validés.
6. **Version vectorielle du logo.** Celle du sprite SVG du site a été utilisée ; la signature « Séjours montagne » y est un texte, recomposé ici en Caveat Brush.
7. **Prochains départs.** La liste et le module sont un relevé du 10/10/2026 ; en production, SPIP doit les générer à partir des mêmes champs.
