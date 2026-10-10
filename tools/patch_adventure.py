"""Ajoute à Adventure les correspondances qui lui manquent pour le français :
espaces insécables -> espace, apostrophe typographique -> apostrophe droite.
Usage : python tools/patch_adventure.py <Adventure-Regular.otf> <sortie.otf>"""
import sys
from fontTools.ttLib import TTFont

f = TTFont(sys.argv[1])
for t in f["cmap"].tables:
    if t.isUnicode():
        m = t.cmap
        for cp, src in ((0xA0, 0x20), (0x202F, 0x20), (0x2009, 0x20), (0x2019, 0x27), (0x2018, 0x27), (0x2011, 0x2D)):
            if cp not in m and src in m:
                m[cp] = m[src]
f.save(sys.argv[2])
