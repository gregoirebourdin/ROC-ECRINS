#!/bin/sh
# Sous-ensembles des polices (font-display: swap dans la CSS).
# Usage : tools/subset_fonts.sh <Adventure-Regular.otf> <caveat-brush.woff2> <instrument-sans.woff2> [python]
# (Caveat Brush et Instrument Sans : fichiers woff2 « latin » de Google Fonts.)
PY=${4:-python3}
OUT=$(dirname "$0")/../assets/fonts
LATIN="U+0020-007E,U+00A0-00FF,U+0152-0153,U+0178,U+2011,U+2013-2014,U+2018-2019,U+201C-201E,U+2026,U+2009,U+202F,U+20AC,U+00D7,U+2192"
# Annotations au feutre : uniquement les signes du français courant.
NOTES="U+0020-007E,U+00A0,U+00AB,U+00BB,U+00C0,U+00C2,U+00C7-00CB,U+00CE,U+00CF,U+00D4,U+00D9,U+00DB,U+00E0,U+00E2,U+00E7-00EB,U+00EE,U+00EF,U+00F4,U+00F9,U+00FB,U+2019,U+2026"
$PY "$(dirname "$0")/patch_adventure.py" "$1" "$OUT/.adventure.otf"
$PY -m fontTools.subset "$OUT/.adventure.otf" --unicodes="$LATIN" --flavor=woff2 --layout-features='kern,liga,calt' --output-file="$OUT/adventure.woff2" && rm "$OUT/.adventure.otf"
$PY -m fontTools.subset "$2" --unicodes="$NOTES" --flavor=woff2 --layout-features='kern,liga,calt' --output-file="$OUT/caveat-brush.woff2"
# Instrument Sans : on fige la chasse à 100 (axe wdth inutilisé), on garde l'axe de graisse.
$PY -m fontTools.varLib.instancer "$3" wdth=100 -o "$OUT/.instrument-wght.ttf"
$PY -m fontTools.subset "$OUT/.instrument-wght.ttf" --unicodes="$LATIN" --flavor=woff2 --layout-features='kern,liga,calt,tnum,lnum' --output-file="$OUT/instrument-sans.woff2" && rm "$OUT/.instrument-wght.ttf"
ls -la "$OUT"
