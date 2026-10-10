"""Données du module « Trouve ton aventure » et des prochains départs, construites
à partir du relevé du site actuel (sejours.json, généré le 10/10/2026).
En production, ce fichier sera produit par SPIP à partir des mêmes champs.
Usage : python build_data.py <sejours.json> <sortie.json>
"""
import json, sys
from datetime import date

src, out = sys.argv[1:3]
d = json.load(open(src))
TODAY = date(2026, 10, 10)
ENVIE = {
    "escalade": "grimper", "grande-voie": "grimper", "via-ferrata": "grimper", "canyoning": "grimper",
    "cascade": "grimper", "alpinisme": "sommet", "ski-rando": "glisser", "hors-piste": "glisser",
    "splitboard": "glisser", "randonnee": "marcher", "raquettes": "marcher", "multi-activites": "marcher",
    "insolite": "dehors",
}
RANK = {"Évolution": 1, "Confirmé": 2, "Expert": 3}


import re


def tidy(t):
    """Typographie seulement, jamais de reformulation : année de saison retirée,
    altitudes au format « 3 730 m », apostrophes typographiques."""
    t = re.sub(r"\s*\b20\d\d\b\s*$", "", t).strip(" -–")
    t = re.sub(r"(\d)(\d{3})\s?m\b", lambda m: m.group(1) + "\u202f" + m.group(2) + "\u00a0m", t)
    return t.replace("'", "’")


def season_of(month):
    return "h" if month in (12, 1, 2, 3, 4) else "e"


rows = []
for s in d["sejours"]:
    envie = "dehors" if s.get("far_away") else ENVIE.get(s["activity"])
    if not envie or not s.get("levels"):
        continue
    nexts = [n for n in s.get("next_dates", []) if date.fromisoformat(n["start"]) >= TODAY]
    nexts.sort(key=lambda n: n["start"])
    if nexts:
        seasons = "".join(sorted({season_of(date.fromisoformat(n["start"]).month) for n in nexts}))
    else:
        seasons = "h" if s["season"] == "hiver" else "e" if s["season"] == "ete" else "eh"
    if s.get("price_from") is None and not nexts:
        continue
    places = None
    for dep in s.get("departures", []):
        if nexts and dep.get("start") == nexts[0]["start"]:
            places = dep.get("places_left")
    rows.append({
        "t": tidy(s["title_clean"]), "u": s["url"], "a": s["activity"], "e": envie, "s": seasons,
        "l": sorted({RANK[x] for x in s["levels"] if x in RANK}), "j": s.get("days"),
        "p": s.get("price_from"), "x": s.get("price_label", "").lower().startswith("à partir"),
        "n": [[n["start"], n["end"]] for n in nexts[:2]], "r": places,
    })

# Doublons d'une saison à l'autre (« … 2026 » / « … 2027 ») : on garde celui qui a des dates.
best = {}
for r in rows:
    k = (r["t"], r["a"])
    if k not in best or (r["n"] and (not best[k]["n"] or r["n"][0] < best[k]["n"][0])):
        best[k] = r
rows = list(best.values())

deps = [{
    "t": tidy(p["title_clean"]), "u": p["url"], "start": p["start"], "end": p["end"], "j": p["days"],
    "g": p.get("group"), "p": p.get("price_from"), "x": (p.get("price_label") or "").lower().startswith("à partir"),
    "r": p.get("places_left"), "l": p.get("levels"), "a": p.get("activity"),
} for p in d["prochains_departs"]]

json.dump({"releve": "2026-10-10", "sejours": rows, "departs": deps}, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print(len(rows), "séjours ;", Counter((r["e"], r["s"]) for r in rows))
print(Counter((r["e"], tuple(r["l"])) for r in rows))
