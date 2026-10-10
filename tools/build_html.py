"""Assemble index.html à partir de src/index.html :
  <!--img:ID|sizes|classe|lazy|alt facultatif-->  →  <picture> AVIF + WebP, srcset, width/height, alt
  <!--departs-->                                  →  liste statique des prochains départs
  <!--jsonld-->                                   →  données structurées (agence + départs)
Usage : python tools/build_html.py
"""
import html, json, os, re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rep = json.load(open(os.path.join(ROOT, "assets/img/_report.json")))
man = json.load(open(os.path.join(ROOT, "tools/images.json")))
alts = {e["id"]: e["alt"] for e in man["images"] + man["cutouts"]}
data = json.load(open(os.path.join(ROOT, "data/sejours.json")))
MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
SITE = "https://www.roc-ecrins.com/"


def picture(m):
    parts = m.group(1).split("|")
    iid, sizes = parts[0], parts[1]
    cls = parts[2] if len(parts) > 2 else ""
    lazy = (parts[3] if len(parts) > 3 else "lazy") or "lazy"
    alt = parts[4] if len(parts) > 4 else alts.get(iid.replace("hero-", ""), "")
    r = rep[iid]
    widths = sorted({int(re.search(r"-(\d+)\.", f).group(1)) for f, _ in r["files"]})
    def srcset(fmt):
        return ", ".join(f"assets/img/{iid}-{w}.{fmt} {w}w" for w in widths)
    mid = widths[len(widths) // 2]
    h = round(r["h"] * mid / r["w"])
    attrs = 'loading="eager" fetchpriority="high"' if lazy == "eager" else 'loading="lazy"'
    # Les plans du paysage ne se chargent que pour leur format : paysage (4 plans) ou portrait (2 plans).
    vide = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
    garde = ""
    if iid.startswith("hero-m-"):
        garde = f'<source media="(min-aspect-ratio: 1/1)" srcset="{vide}">'
    elif iid.startswith("hero-"):
        garde = f'<source media="(max-aspect-ratio: 1/1)" srcset="{vide}">'
    return (f'<picture class="{cls}">{garde}<source type="image/avif" srcset="{srcset("avif")}" sizes="{sizes}">'
            f'<source type="image/webp" srcset="{srcset("webp")}" sizes="{sizes}">'
            f'<img src="assets/img/{iid}-{mid}.webp" width="{mid}" height="{h}" alt="{html.escape(alt, quote=True)}" {attrs} decoding="async"></picture>')


def fr_range(a, b):
    a, b = date.fromisoformat(a), date.fromisoformat(b)
    if a == b:
        return f"{a.day}", MOIS[a.month - 1]
    if a.month == b.month:
        return f"{a.day}–{b.day}", MOIS[a.month - 1]
    return f"{a.day}–{b.day}", f"{MOIS[a.month - 1]}–{MOIS[b.month - 1]}"


LEVEL = {"Évolution": "Évolution", "Confirmé": "Confirmé", "Expert": "Expert"}


def departs(_):
    rows, seen = [], 0
    for d in data["departs"][:6]:
        days, month = fr_range(d["start"], d["end"])
        prix = (("dès " if d["x"] else "") + f"{d['p']:,}".replace(",", " ") + " €") if d["p"] else ""
        reste = ""
        if d["r"] is not None and d["r"] <= 3:
            reste = f'<span class="depart__reste">plus que {d["r"]} place{"s" if d["r"] > 1 else ""}</span>'
        lvl = ", ".join(LEVEL.get(x, x) for x in (d["l"] or []))
        rows.append(f'''<li class="depart"><a class="depart__lien" href="{d['u']}">
  <span class="depart__date"><span class="depart__jours">{days}</span> <span class="depart__mois">{month}</span></span>
  <span class="depart__titre">{html.escape(d['t'])}</span>
  <span class="depart__meta">{d['j']} jour{'s' if d['j'] > 1 else ''} · {html.escape(d['g'] or '')} · {lvl}</span>
  <span class="depart__prix">{prix}</span>{reste}
  <svg class="depart__fleche" viewBox="0 0 40 16" aria-hidden="true"><path d="M1 8.5c9-.6 25-1 36-.3M30 2.5c2.6 2 5 3.7 7.6 5.7-2.6 1.8-5.2 3.6-7.8 5.6"/></svg>
</a></li>''')
    return "\n".join(rows)


def jsonld(_):
    agency = {
        "@context": "https://schema.org", "@type": "TravelAgency", "@id": SITE + "#agence",
        "name": "Roc Écrins", "alternateName": "ROC ÉCRINS – Séjours montagne", "url": SITE,
        "logo": SITE + "IMG/logo/rocoeccrins_couleurs_png300.png", "image": SITE + "assets/img/og-roc-ecrins.jpg",
        "description": "Agence de séjours montagne fondée par un guide de haute montagne : alpinisme, escalade, ski de randonnée, cascade de glace, canyoning et nuits insolites dans les Écrins, encadrés par des professionnels diplômés d'État.",
        "telephone": "+33 4 84 13 14 08", "email": "info@roc-ecrins.com", "foundingDate": "2013",
        "founder": [{"@type": "Person", "name": "Frédéric Jullien"}, {"@type": "Person", "name": "Emilie"}],
        "address": {"@type": "PostalAddress", "streetAddress": "6 rue du Chlorate, Zone Les Sablonnières",
                    "postalCode": "05120", "addressLocality": "L'Argentière-la-Bessée", "addressRegion": "Hautes-Alpes", "addressCountry": "FR"},
        "areaServed": "Massif des Écrins",
        "identifier": {"@type": "PropertyValue", "propertyID": "Immatriculation Atout France", "value": "IM005230003"},
        "sameAs": ["https://www.instagram.com/rocecrins/", "https://www.facebook.com/Roc-Ecrins-1641914392703112/"],
    }
    # Horaires : à ajouter (openingHoursSpecification) une fois confirmés par l'agence.
    trips = []
    for d in data["departs"][:6]:
        trips.append({
            "@type": ["Event", "TouristTrip"], "name": d["t"], "url": d["u"],
            "startDate": d["start"], "endDate": d["end"],
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "description": f"{d['j']} jours, niveau {', '.join(d['l'] or [])}, {d['g']}. Encadrement par des professionnels diplômés d'État.",
            "location": {"@type": "Place", "name": "Pays des Écrins", "address": {"@type": "PostalAddress", "addressLocality": "L'Argentière-la-Bessée", "postalCode": "05120", "addressCountry": "FR"}},
            "organizer": {"@id": SITE + "#agence"}, "provider": {"@id": SITE + "#agence"},
            "offers": {"@type": "Offer", "price": str(d["p"]), "priceCurrency": "EUR", "url": d["u"],
                       "availability": "https://schema.org/InStock" if (d["r"] or 0) > 0 else "https://schema.org/SoldOut",
                       "description": "Prix à partir de, par personne" if d["x"] else "Prix par personne"},
            "audience": {"@type": "Audience", "audienceType": "Niveau " + ", ".join(d["l"] or [])},
        })
    lst = {"@context": "https://schema.org", "@type": "ItemList", "name": "Prochains départs", "itemListElement":
           [{"@type": "ListItem", "position": i + 1, "item": t} for i, t in enumerate(trips)]}
    dump = lambda o: json.dumps(o, ensure_ascii=False, indent=1).replace("</", "<\\/")
    return f'<script type="application/ld+json">\n{dump(agency)}\n</script>\n<script type="application/ld+json">\n{dump(lst)}\n</script>'


src = open(os.path.join(ROOT, "src/index.html"), encoding="utf-8").read()
out = re.sub(r"<!--img:(.*?)-->", picture, src)
out = out.replace("<!--departs-->", departs(None)).replace("<!--jsonld-->", jsonld(None))
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(out)
print("index.html", len(out) // 1024, "Ko")
