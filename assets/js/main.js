/* Roc Écrins · page d'accueil
   Une course de 24 h, de la porte de l'agence (1 000 m) au sommet de la Barre des Écrins (4 102 m).
   GSAP + ScrollTrigger + Lenis. Uniquement des transformations, de l'opacité et du clip-path. */

const { gsap, ScrollTrigger, Lenis } = window;
const html = document.documentElement;

if (!gsap || !ScrollTrigger) {
  // Les librairies n'ont pas chargé : on affiche la page telle quelle.
  html.classList.remove('js');
} else {
  init();
}

function init() {
  gsap.registerPlugin(ScrollTrigger);
  // iPhone : la barre d'adresse qui se replie ne doit pas recalculer (et faire sauter) les scènes.
  ScrollTrigger.config({ ignoreMobileResize: true });
  const calme = html.classList.contains('calme');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const grand = () => matchMedia('(min-width: 900px) and (min-height: 561px)').matches;
  const paysage = () => matchMedia('(min-aspect-ratio: 1/1)').matches;
  const EASE = 'expo.out';          // la courbe principale
  const REBOND = 'back.out(1.9)';   // réservée aux clins d'œil : tampons, animaux

  /* ------------------------------------------------------------------ Lenis */
  let lenis = null;
  if (!calme && Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const hauteurEntete = () => $('[data-entete]').offsetHeight;
  $$('[data-ancre]').forEach((a) => a.addEventListener('click', (e) => {
    const cible = $(a.getAttribute('href'));
    if (!cible) return;
    e.preventDefault();
    fermerMenu();
    if (lenis) lenis.scrollTo(cible, { offset: -hauteurEntete() + 1, duration: 1.6 });
    else cible.scrollIntoView();
    history.replaceState(null, '', a.getAttribute('href'));
  }));

  /* ------------------------------------------------------------------ Menu */
  const btnMenu = $('[data-menu-btn]');
  const menu = $('#menu');
  function fermerMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    btnMenu.setAttribute('aria-expanded', 'false');
    html.classList.remove('menu-ouvert');
    lenis?.start();
  }
  btnMenu.addEventListener('click', () => {
    if (!menu.hidden) return fermerMenu();
    menu.hidden = false;
    btnMenu.setAttribute('aria-expanded', 'true');
    html.classList.add('menu-ouvert');
    lenis?.stop();
    if (!calme) gsap.from($$('.menu__liste li', menu), { y: 24, opacity: 0, duration: 0.7, stagger: 0.035, ease: EASE });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(); });

  /* ------------------------------------------------------------------ Annotations au feutre */
  // Chaque note est découpée en lettres, qui s'écrivent l'une après l'autre.
  $$('.note__texte').forEach((t) => {
    const txt = t.textContent;
    t.setAttribute('aria-label', txt);
    t.textContent = '';
    for (const c of txt) {
      const s = document.createElement('span');
      s.className = 'lettre';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c;
      t.appendChild(s);
    }
  });
  $$('.note__fleche path').forEach((p) => {
    const l = p.getTotalLength();
    p.style.strokeDasharray = l;
    p.style.strokeDashoffset = calme ? 0 : l;
  });
  function ecrire(note, delai = 0) {
    const tl = gsap.timeline({ delay: delai });
    tl.fromTo($$('.lettre', note), { opacity: 0, y: 5, rotation: -10 },
      { opacity: 1, y: 0, rotation: 0, duration: 0.28, stagger: 0.028, ease: 'power2.out' });
    const fl = $$('.note__fleche path', note);
    if (fl.length) tl.to(fl, { strokeDashoffset: 0, duration: 0.55, stagger: 0.18, ease: 'power2.inOut' }, '-=0.15');
    return tl;
  }
  const notesCachees = (note) => gsap.set($$('.lettre', note), { opacity: 0 });

  if (!calme) {
    $$('[data-note]').forEach((note) => {
      if (note.closest('[data-ouverture]') || note.closest('[data-suspendue]')) return; // écrites dans leur propre scène
      notesCachees(note);
      ScrollTrigger.create({ trigger: note, start: 'top 82%', once: true, onEnter: () => ecrire(note, 0.15) });
    });
  }

  /* ------------------------------------------------------------------ Titres */
  if (!calme) {
    $$('[data-titre]').forEach((t) => {
      gsap.to($$('.ligne > span', t), {
        yPercent: 0, y: 0, duration: 1.15, stagger: 0.11, ease: EASE,
        scrollTrigger: { trigger: t, start: 'top 85%', once: true },
      });
    });
  }

  /* ------------------------------------------------------------------ Révélation « découpe de rocher » */
  // Un polygone aux bords irréguliers grandit depuis le centre ; le bord final reste un peu taillé.
  function polygoneRoche(seed) {
    let s = seed;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const pts = [];
    const cote = (x0, y0, x1, y1, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const j = 0.6 + r() * 2.2;
        const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        const nx = y0 === y1 ? 0 : (x0 === 0 ? j : -j), ny = x0 === x1 ? 0 : (y0 === 0 ? j : -j);
        pts.push([x + nx, y + ny]);
      }
    };
    cote(0, 0, 100, 0, 5); cote(100, 0, 100, 100, 5); cote(100, 100, 0, 100, 5); cote(0, 100, 0, 0, 5);
    return pts;
  }
  const versClip = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`;
  $$('[data-roche]').forEach((fig, i) => {
    const cadre = $('.cadre', fig);
    if (!cadre) return;
    const fin = polygoneRoche(17 + i * 31);
    if (calme) { cadre.style.clipPath = versClip(fin); return; }
    const depart = fin.map(([x, y], k) => {
      const a = 0.08 + ((k * 37) % 11) / 100;
      return [50 + (x - 50) * a, 58 + (y - 58) * a * 0.9];
    });
    const etat = { p: 0 };
    const peindre = () => {
      cadre.style.clipPath = versClip(depart.map(([x, y], k) => [x + (fin[k][0] - x) * etat.p, y + (fin[k][1] - y) * etat.p]));
    };
    peindre();
    gsap.to(etat, { p: 1, duration: 1.5, ease: EASE, onUpdate: peindre, scrollTrigger: { trigger: fig, start: 'top 78%', once: true } });
    const img = $('img', cadre);
    if (img) {
      gsap.fromTo(img, { scale: 1.16, yPercent: -4 }, {
        scale: 1.04, yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  /* ------------------------------------------------------------------ Tampons */
  const rotationTampon = (t) => parseFloat(getComputedStyle(t).getPropertyValue('--r')) || -6;
  function ajusterTampons() {
    $$('.tampon text').forEach((t) => {
      const max = t.classList.contains('tampon__l1') ? 152 : 132;
      if (!t.getClientRects().length) return; // face de l'autre saison, pas encore rendue
      t.removeAttribute('textLength');
      if (t.getComputedTextLength() > max) {
        t.setAttribute('textLength', max);
        t.setAttribute('lengthAdjust', 'spacingAndGlyphs');
      }
    });
  }
  document.fonts?.ready.then(ajusterTampons);
  $$('[data-tampon]').forEach((t) => gsap.set(t, { rotation: rotationTampon(t) }));

  function poser(t, delai = 0) {
    if (t.dataset.pose) return;
    t.dataset.pose = '1';
    const r = rotationTampon(t);
    const tl = gsap.timeline({ delay: delai });
    tl.fromTo(t, { opacity: 0, scale: 2.3, rotation: r - 16 },
      { opacity: 1, scale: 1, rotation: r, duration: 0.42, ease: REBOND });
    const support = t.closest('.planche__photo, .horscarte__photo, .sommet__aube');
    if (support) tl.fromTo(support, { y: 0 }, { y: 4, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.16);
    return tl;
  }
  if (!calme) {
    $$('[data-tampon]').forEach((t) => {
      if (t.closest('[data-planche]') || t.closest('.sommet__aube')) return;
      ScrollTrigger.create({ trigger: t, start: 'top 70%', once: true, onEnter: () => poser(t) });
    });
  }

  /* ------------------------------------------------------------------ Altimètre */
  const alti = $('[data-altimetre]');
  const zoneChiffres = $('[data-alt-chiffres]');
  const plaque = $('[data-plaque]');
  const plaqueNom = $('[data-plaque-nom]');
  // Affichage façon montre d'altimètre : chiffres à chasse fixe.
  const cases = [];
  [0, 1, 2, 3].forEach((i) => {
    if (i === 1) { const e = document.createElement('span'); e.className = 'espace'; zoneChiffres.appendChild(e); }
    const c = document.createElement('span');
    c.className = 'chiffre';
    zoneChiffres.appendChild(c);
    cases.push(c);
  });
  let affiche = '';
  function afficherAltitude(v) {
    const txt = String(Math.round(v)).padStart(4, ' ');
    if (txt === affiche) return;
    [...txt].forEach((ch, i) => {
      if (ch === affiche[i]) return;
      cases[i].textContent = ch.trim();
    });
    affiche = txt;
  }
  const JALONS = [
    [1000, 'L’Argentière-la-Bessée'],
    [2673, 'Refuge de la Selle · 2 673 m'],
    [4015, 'Dôme des Écrins · 4 015 m'],
    [4102, 'Barre des Écrins · 4 102 m'],
  ];
  let jalonActuel = -1;
  function majPlaque(v) {
    let j = 0;
    JALONS.forEach(([a], i) => { if (v >= a - 0.5) j = i; });
    if (j === jalonActuel) return;
    const monte = j > jalonActuel;
    jalonActuel = j;
    plaqueNom.textContent = JALONS[j][1];
    if (calme) return;
    // la plaque ne se montre qu'à la montée, quand on franchit vraiment le jalon
    if (!monte) { gsap.killTweensOf(plaque); gsap.to(plaque, { opacity: 0, duration: 0.3 }); return; }
    gsap.killTweensOf(plaque);
    gsap.timeline()
      .fromTo(plaque, { rotation: -14, y: -10, opacity: 0 }, { rotation: 0, y: 0, opacity: 1, duration: 1.1, ease: 'elastic.out(1, 0.45)' })
      .to(plaque, { opacity: 0, y: 6, duration: 0.5, ease: 'power2.in' }, j === JALONS.length - 1 ? '+=5' : '+=3.2');
  }
  let altitude = 1000;
  const regler = (v) => { altitude = v; afficherAltitude(v); majPlaque(v); };
  regler(calme ? 4102 : 1000);

  /* ------------------------------------------------------------------ Saison été / hiver */
  const neige = $('[data-neige]');
  const neigeMot = $('[data-neige-mot]');
  const ecouteursSaison = [];
  function appliquerSaison(s) {
    html.dataset.saison = s;
    $$('[data-saison-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.saisonBtn === s)));
    ecouteursSaison.forEach((f) => f(s));
  }
  let enTransition = false;
  function changerSaison(s) {
    if (s === html.dataset.saison || enTransition) return;
    if (calme) return appliquerSaison(s);
    enTransition = true;
    const hiver = s === 'hiver';
    neige.classList.toggle('neige--ete', !hiver);
    neigeMot.textContent = hiver ? 'Hiver' : 'Été';
    // La neige recouvre la page (ou la terre réapparaît), on change tout dessous, puis elle glisse.
    const tl = gsap.timeline({ onComplete: () => { enTransition = false; gsap.set(neige, { visibility: 'hidden' }); } });
    tl.set(neige, { visibility: 'visible', y: 0, yPercent: hiver ? -110 : 110, scaleY: hiver ? 1 : -1 })
      .set(neigeMot, { scale: 1.8, opacity: 0, rotation: hiver ? -14 : 10, scaleY: hiver ? 1 : -1 })
      .to(neige, { yPercent: 0, duration: 0.62, ease: 'power3.in' })
      .to(neigeMot, { scale: 1, opacity: 1, rotation: -6, duration: 0.4, ease: REBOND }, '-=0.12')
      .add(() => appliquerSaison(s))
      .add(() => { tl.pause(); photosPretes(s).then(() => tl.resume()); })
      .to(neige, { yPercent: hiver ? 110 : -110, duration: 0.85, ease: 'power3.out' }, '+=0.2');
  }
  $$('[data-saison-btn]').forEach((b) => b.addEventListener('click', () => changerSaison(b.dataset.saisonBtn)));
  // Les photos de l'autre saison ne sont chargées que lorsqu'on s'approche de l'interrupteur.
  const prechargerSaison = () => $$('[data-saison-face] img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
  $$('[data-saison-btn], select[name="saison"]').forEach((b) => {
    b.addEventListener('pointerenter', prechargerSaison, { once: true });
    b.addEventListener('focus', prechargerSaison, { once: true });
  });
  // …et la neige attend qu'elles soient prêtes (au plus 0,8 s) avant de glisser.
  const photosPretes = (s) => Promise.race([
    Promise.all($$(`[data-saison-face="${s}"] img`).map((i) => (i.loading = 'eager', i.decode().catch(() => null)))),
    new Promise((r) => setTimeout(r, 800)),
  ]);
  appliquerSaison(html.dataset.saison);

  /* ------------------------------------------------------------------ Invités surprises (une seule fois chacun) */
  const invitesVus = new Set();
  function invite(nom) {
    if (calme || invitesVus.has(nom)) return;
    invitesVus.add(nom);
    const el = $(`[data-invite="${nom}"]`);
    const note = $(`[data-note-invite="${nom}"]`);
    if (!el) return;
    const tl = gsap.timeline();
    if (nom === 'bouquetin') {
      const img = $('picture', el);
      tl.fromTo(img, { y: 0, yPercent: 100 }, { yPercent: 18, duration: 0.9, ease: REBOND })
        .to(note, { opacity: 1, duration: 0.2 }, '-=0.3').add(() => ecrire(note), '<')
        .to(img, { yPercent: 100, duration: 0.6, ease: 'power3.in' }, '+=1.9')
        .to(note, { opacity: 0, duration: 0.4 }, '<0.2');
    } else if (nom === 'husky') {
      tl.fromTo(el, { opacity: 1, xPercent: 140, rotation: 400 }, { xPercent: 0, rotation: 0, duration: 1.5, ease: 'back.out(1.3)' })
        .to(note, { opacity: 1, duration: 0.2 }, '-=0.4').add(() => ecrire(note), '<');
    }
  }

  /* ------------------------------------------------------------------ 1 · Ouverture */
  const ouverture = $('[data-ouverture]');
  const scene = $('[data-scene]');
  const titreOuv = $('[data-titre-ouverture]');
  gsap.set(scene, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  gsap.set(titreOuv, { xPercent: -50, x: 0 });
  if (!calme) {
    const intro = gsap.timeline({ delay: 0.1 });
    intro.fromTo(scene, { scale: 1.07 }, { scale: 1, duration: 2.4, ease: EASE })
      .to($$('.ligne > span', titreOuv), { yPercent: 0, y: 0, duration: 1.3, stagger: 0.14, ease: EASE }, 0.25)
      .add(ecrire($('.ouverture__note'), 0), 1.1)
      .from($$('.ouverture__h1, .ouverture__actions'), { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: EASE }, 0.75);
    notesCachees($('.ouverture__note'));

    const mmOuv = gsap.matchMedia();
    mmOuv.add('(min-aspect-ratio: 1/1)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ouverture, pin: true, start: 'top top', end: '+=110%', scrub: 0.8 } });
        // La caméra avance dans le paysage : plus un plan est proche, plus il grandit et s'échappe.
        $$('[data-plan]', scene).forEach((plan) => {
          const v = parseFloat(plan.dataset.plan);
          tl.to(plan, { scale: 1 + v * 0.8, yPercent: v * 30, transformOrigin: '50% 30%', ease: 'none', duration: 1 }, 0);
        });
        tl.to(titreOuv, { yPercent: -22, scale: 0.94, ease: 'none', duration: 1 }, 0)
          .to(titreOuv, { opacity: 0, ease: 'none', duration: 0.4 }, 0.6)
          .to('.ouverture__note, .ouverture__bas', { opacity: 0, y: -30, ease: 'none', duration: 0.35 }, 0);
    });
    mmOuv.add('(max-aspect-ratio: 1/1)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ouverture, pin: true, start: 'top top', end: '+=70%', scrub: 0.6 } });
        tl.to('.scene__img--mbg', { scale: 1.12, transformOrigin: '50% 30%', ease: 'none', duration: 1 }, 0)
          .to('.scene__img--mfg', { scale: 1.45, yPercent: 26, transformOrigin: '50% 0%', ease: 'none', duration: 1 }, 0)
          .to(titreOuv, { yPercent: -12, ease: 'none', duration: 1 }, 0)
          .to(titreOuv, { opacity: 0, ease: 'none', duration: 0.4 }, 0.6)
          .to('.ouverture__note, .ouverture__bas', { opacity: 0, ease: 'none', duration: 0.3 }, 0);
    });
  }

  /* ------------------------------------------------------------------ 2 · Tout est dans le sac */
  const listeSac = $('[data-liste-sac]');
  if (!calme) {
    gsap.to($$('.coche__trait', listeSac), {
      strokeDashoffset: 0, duration: 0.45, stagger: 0.32, ease: 'power2.out',
      scrollTrigger: { trigger: listeSac, start: 'top 72%', once: true },
    });
    gsap.from($$('li', listeSac), {
      x: -14, opacity: 0, duration: 0.8, stagger: 0.12, ease: EASE,
      scrollTrigger: { trigger: listeSac, start: 'top 80%', once: true },
    });
  }

  /* ------------------------------------------------------------------ 3 · La traversée (pont de singe) */
  const piste = $('[data-planches]');
  const planches = $$('[data-planche]');
  const pinTraversee = $('[data-traversee]');
  function faceVisible(pl) { return $(`[data-saison-face="${html.dataset.saison}"]`, pl) || pl; }
  function verifierPlanche(pl, ratio) {
    if (ratio < 0.55) return;
    const face = faceVisible(pl);
    const t = $('[data-tampon]', face);
    if (t) poser(t);
    if ($('[data-invite="bouquetin"]', face)) invite('bouquetin');
    if ($('[data-invite="husky"]', face)) invite('husky');
  }
  ecouteursSaison.push(() => requestAnimationFrame(ajusterTampons));
  ecouteursSaison.push(() => {
    // Après la neige, les tampons de la nouvelle saison tombent sur les planches visibles.
    planches.forEach((pl) => {
      const r = pl.getBoundingClientRect();
      const visible = r.left < innerWidth * 0.9 && r.right > innerWidth * 0.1 && r.top < innerHeight && r.bottom > 0;
      if (visible) setTimeout(() => verifierPlanche(pl, 1), 650);
    });
  });

  if (!calme) {
    const mmPont = gsap.matchMedia();
    mmPont.add('(min-width: 900px) and (min-height: 561px)', () => {
        const distance = () => Math.max(0, piste.offsetWidth - innerWidth);
        const rot = planches.map((pl) => gsap.quickTo(pl, 'rotation', { duration: 0.9, ease: 'power3.out' }));
        const desc = planches.map((pl) => gsap.quickTo(pl, 'y', { duration: 0.7, ease: 'power3.out' }));
        const enteteT = $('.traversee__entete');
        const tween = gsap.to([piste, enteteT], {
          x: () => -distance(), ease: 'none',
          scrollTrigger: {
            trigger: pinTraversee, pin: true, start: 'top top', end: () => '+=' + distance(),
            scrub: 0.7, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const vit = gsap.utils.clamp(-1, 1, self.getVelocity() / 2800);
              const demi = innerWidth / 2;
              planches.forEach((pl, i) => {
                const r = pl.getBoundingClientRect();
                const cx = (r.left + r.right) / 2;
                const k = gsap.utils.clamp(-1, 1, (cx - demi) / demi);
                // la passerelle se creuse au milieu et ondule avec la vitesse du pas
                desc[i]((1 - k * k) * 22 + Math.sin(self.progress * 18 + i * 1.3) * 6 * Math.abs(vit));
                rot[i](-vit * 2.4 + k * 0.6);
                // le tampon tombe dès que la planche atteint le milieu de l'écran (ou l'a dépassé)
                verifierPlanche(pl, cx < innerWidth * 0.66 ? 1 : 0);
              });
            },
          },
        });
        return () => { tween.scrollTrigger?.kill(); gsap.set([piste, enteteT], { clearProps: 'transform' }); };
    });
    mmPont.add('(max-width: 899px), (max-height: 560px)', () => {
        const pont = $('[data-pont]');
        const io = new IntersectionObserver((entrees) => entrees.forEach((e) => verifierPlanche(e.target, e.intersectionRatio > 0.6 ? 1 : 0)),
          { root: pont, threshold: [0.6] });
        planches.forEach((pl) => io.observe(pl));
        const io2 = new IntersectionObserver((e) => { if (e[0].isIntersecting) verifierPlanche(planches[0], 1); }, { threshold: 0.5 });
        io2.observe(pont);
        return () => { io.disconnect(); io2.disconnect(); };
    });
  }

  /* ------------------------------------------------------------------ 4 · Trouve ton aventure */
  const form = $('[data-trouve]');
  const zone = $('[data-resultats]');
  let donnees = null;
  let chargement = null;
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const NIVEAUX = ['', 'Évolution', 'Confirmé', 'Expert'];
  const prixFr = (p) => p.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' €';
  const charger = () => (chargement ||= fetch('data/sejours.json').then((r) => r.json()).then((d) => (donnees = d)).catch(() => null));

  function dates(n) {
    if (!n) return ['Sur', 'demande'];
    const a = new Date(n[0] + 'T12:00'), b = new Date(n[1] + 'T12:00');
    if (n[0] === n[1]) return [`${a.getDate()}`, `${MOIS[a.getMonth()]} ${a.getFullYear() !== 2026 ? a.getFullYear() : ''}`.trim()];
    if (a.getMonth() === b.getMonth()) return [`${a.getDate()}–${b.getDate()}`, `${MOIS[a.getMonth()]} ${a.getFullYear() !== 2026 ? a.getFullYear() : ''}`.trim()];
    return [`${a.getDate()}–${b.getDate()}`, `${MOIS[a.getMonth()]}–${MOIS[b.getMonth()]}`];
  }
  function ligne(r) {
    const [j, m] = dates(r.n[0]);
    const prix = r.p ? (r.x ? 'dès ' : '') + prixFr(r.p) : '';
    const reste = r.r != null && r.r <= 3 ? `<span class="depart__reste">plus que ${r.r} place${r.r > 1 ? 's' : ''}</span>` : '';
    const lvl = r.l.map((x) => NIVEAUX[x]).join(', ');
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    return `<li class="depart resultat"><a class="depart__lien" href="${esc(r.u)}">
      <span class="depart__date"><span class="depart__jours">${j}</span> <span class="depart__mois">${m}</span></span>
      <span class="depart__titre">${esc(r.t)}</span>
      <span class="depart__meta">${r.j ? r.j + ' jour' + (r.j > 1 ? 's' : '') + ' · ' : ''}${lvl}</span>
      <span class="depart__prix">${prix}</span>${reste}
      <svg class="depart__fleche" viewBox="0 0 40 16" aria-hidden="true"><path d="M1 8.5c9-.6 25-1 36-.3M30 2.5c2.6 2 5 3.7 7.6 5.7-2.6 1.8-5.2 3.6-7.8 5.6"/></svg></a></li>`;
  }
  // Les pastilles prennent la largeur de leur mot (field-sizing quand le navigateur le permet).
  const mesure = document.createElement('canvas').getContext('2d');
  const auto = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');
  function ajuster(sel) {
    if (auto) return;
    const cs = getComputedStyle(sel);
    mesure.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const txt = sel.options[sel.selectedIndex]?.text || '';
    sel.style.width = `${Math.ceil(mesure.measureText(txt).width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 6)}px`;
  }
  const selects = $$('select', form);
  const optGlisser = $('option[value="glisser"]', form);
  function optionsSaison(s) {
    // « glisser » n'existe qu'en hiver
    const envie = form.elements.envie;
    if (s === 'ete' && optGlisser.parentNode) {
      if (envie.value === 'glisser') envie.value = 'sommet';
      optGlisser.remove();
    } else if (s === 'hiver' && !optGlisser.parentNode) {
      envie.insertBefore(optGlisser, envie.options[2] || null);
    }
  }
  function valeurs() {
    return { saison: form.elements.saison.value, niveau: +form.elements.niveau.value, envie: form.elements.envie.value };
  }
  async function chercher(animer = true) {
    const v = valeurs();
    selects.forEach(ajuster);
    await charger();
    if (!donnees) { zone.innerHTML = '<p class="trouve__aide">Le programme ne s’est pas chargé. <a href="https://www.roc-ecrins.com/agenda.html">Voir l’agenda complet</a> ou appelle-nous au <a href="tel:+33484131408">04 84 13 14 08</a>.</p>'; return; }
    const cle = v.saison === 'hiver' ? 'h' : 'e';
    const tri = (a, b) => (a.n[0]?.[0] || '9999').localeCompare(b.n[0]?.[0] || '9999') || (a.p || 9e9) - (b.p || 9e9);
    const res = donnees.sejours.filter((r) => r.s.includes(cle) && r.l.includes(v.niveau) && r.e === v.envie).sort(tri);
    let contenu = '';
    if (res.length) {
      const n = res.length;
      contenu = `<p class="trouve__compte"><b>${n} séjour${n > 1 ? 's' : ''}</b> pour toi${n > 3 ? ', voici les 3 prochains' : ''}&nbsp;:</p>`
        + `<ol class="departs__liste">${res.slice(0, 3).map(ligne).join('')}</ol>`;
      if (n > 3) contenu += `<p class="trouve__aide">Les ${n - 3} autres sont dans <a href="https://www.roc-ecrins.com/agenda.html">l’agenda complet</a>.</p>`;
    } else {
      contenu = `<p class="trouve__aide">Rien pour cette combinaison en ce moment. On te trouve une idée au <a href="tel:+33484131408">04 84 13 14 08</a>, ou regarde <a href="https://www.roc-ecrins.com/agenda.html">tout l’agenda</a>.</p>`;
    }
    const remplacer = () => {
      zone.innerHTML = contenu;
      if (!calme && animer) gsap.from($$('.trouve__compte, .resultat, .trouve__aide', zone), { y: 18, opacity: 0, duration: 0.7, stagger: 0.07, ease: EASE });
    };
    if (!calme && animer && zone.children.length) gsap.to(zone.children, { opacity: 0, y: -8, duration: 0.18, onComplete: remplacer });
    else remplacer();
  }
  form.addEventListener('change', (e) => {
    const sel = e.target;
    ajuster(sel);
    if (!calme) gsap.fromTo(sel.closest('.pastille'), { scale: 0.9 }, { scale: 1, duration: 0.5, ease: REBOND });
    if (sel.name === 'saison') {
      changerSaison(sel.value);
      if (enTransition || calme) return; // la recherche suit le changement de saison
    }
    chercher();
  });
  ecouteursSaison.push((s) => {
    form.elements.saison.value = s;
    optionsSaison(s);
    if (donnees) chercher(true);
  });
  form.elements.saison.value = html.dataset.saison;
  optionsSaison(html.dataset.saison);
  document.fonts?.ready.then(() => selects.forEach(ajuster));
  ScrollTrigger.create({ trigger: '#trouve-ton-aventure', start: 'top 160%', once: true, onEnter: () => chercher(false) });

  /* ------------------------------------------------------------------ 5 · Hors carte */
  ScrollTrigger.create({
    trigger: '[data-horscarte]', start: 'top 45%', end: 'bottom 45%',
    onToggle: (self) => alti.classList.toggle('est-hors-carte', self.isActive),
  });

  /* ------------------------------------------------------------------ 6 · La nuit suspendue */
  const nuit = $('[data-nuit]');
  const balancier = $('[data-balancier]');
  const suspendue = $('[data-suspendue]');
  if (!calme) {
    const titreNuit = $('[data-titre-nuit]');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: suspendue, pin: true, start: 'top top', end: grand() ? '+=70%' : '+=50%', scrub: 0.6,
        onUpdate: (self) => balancer(gsap.utils.clamp(-1, 1, self.getVelocity() / 2400)),
      },
    });
    tl.fromTo(balancier, { scale: 1.1 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('[data-crepuscule]', { opacity: 0.45 }, { opacity: 0.92, ease: 'none', duration: 0.9 }, 0.1)
      .to(nuit, { opacity: 1, ease: 'none', duration: 0.35 }, 0.65);
    // Le titre et l'offre sont là dès que la scène s'installe : pas besoin de défiler pour les lire.
    notesCachees($('.suspendue__note'));
    ScrollTrigger.create({
      trigger: suspendue, start: 'top 65%', once: true,
      onEnter: () => {
        gsap.timeline()
          .to($$('.ligne > span', titreNuit), { yPercent: 0, y: 0, stagger: 0.1, duration: 1, ease: EASE })
          .to($$('[data-apparait]', suspendue), { opacity: 1, stagger: 0.1, duration: 0.6 }, 0.35)
          .add(() => ecrire($('.suspendue__note')), 0.7);
      },
    });
    // On est accroché au vide : la photo se balance au rythme du défilement, avec un ressort.
    const rotV = gsap.quickTo(balancier, 'rotation', { duration: 1.6, ease: 'elastic.out(1, 0.32)' });
    const xV = gsap.quickTo(balancier, 'xPercent', { duration: 1.6, ease: 'elastic.out(1, 0.32)' });
    function balancer(v) { rotV(v * 1.6); xV(-v * 0.8); }
    const pendule = gsap.to($('picture', balancier), { rotation: 0.5, xPercent: 0.4, transformOrigin: '50% -40%', duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: suspendue, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? pendule.play() : pendule.pause()) });

    // L'aube : la nuit se lève quand le sommet arrive.
    gsap.fromTo(nuit, { opacity: 1 }, {
      opacity: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: '#sommet', start: 'top 55%', end: 'top 0%', scrub: true },
    });
  }
  const entete = $('[data-entete]');
  ScrollTrigger.create({
    // une fois l'ouverture passée, l'en-tête garde son fond papier jusqu'en bas de page
    trigger: '#tout-compris', start: () => `top ${hauteurEntete()}`,
    onEnter: () => { entete.classList.add('est-papier'); html.classList.add('alti-on'); },
    onLeaveBack: () => { entete.classList.remove('est-papier'); html.classList.remove('alti-on'); },
  });
  ScrollTrigger.create({
    trigger: '#frederic-et-emilie', start: calme ? 'top top' : 'top 85%', endTrigger: '#sommet', end: 'top 30%',
    onToggle: (s) => { entete.classList.toggle('est-nuit', s.isActive); html.classList.toggle('est-nuit', s.isActive); },
  });

  /* ------------------------------------------------------------------ 8 · Réveil 4 h : le topo */
  // Une cordée de frontales monte du refuge vers le Dôme ; une redescend chercher le thermos ;
  // une flèche montre la Barre, 87 m plus haut. Tout se joue en quelques secondes, sans défilement imposé.
  const ns = 'http://www.w3.org/2000/svg';
  const topo = $('[data-topo]');
  const topoSvg = $('svg', topo);
  const voie = $('.topo__voie', topoSvg);
  const L = voie.getTotalLength();
  const lampes = [];
  const NB = 16;
  for (let i = 0; i < NB; i++) {
    const pt = voie.getPointAtLength((0.06 + (i / (NB - 1)) * 0.9) * L);
    const g = document.createElementNS(ns, 'g');
    g.innerHTML = '<circle class="frontale__halo" r="11"/><circle class="frontale" r="3.4"/>';
    g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    topoSvg.appendChild(g);
    lampes.push(g);
  }
  const distraite = document.createElementNS(ns, 'g');
  distraite.setAttribute('class', 'frontale--thermos');
  distraite.innerHTML = '<circle class="frontale__halo" r="11"/><circle class="frontale" r="3.4"/>';
  topoSvg.appendChild(distraite);
  const posDistraite = (t) => {
    const pt = voie.getPointAtLength(t * L);
    distraite.setAttribute('transform', `translate(${(pt.x + 12).toFixed(1)} ${(pt.y + 6).toFixed(1)})`);
  };
  const notesTopo = $$('[data-topo-note]', topo);
  const fleches = $$('.topo__fleche', topoSvg);
  if (calme) {
    posDistraite(0.02);
  } else {
    posDistraite(0.24);
    gsap.set(lampes, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
    gsap.set(distraite, { opacity: 0 });
    gsap.set($$('.topo__nom, .topo__alt, .topo__croix, .topo__point', topoSvg), { opacity: 0 });
    fleches.forEach((f) => { const l = f.getTotalLength(); gsap.set(f, { strokeDasharray: f.classList.contains('topo__fleche--pointe') ? 'none' : '5 6', opacity: 0 }); f.dataset.l = l; });
    notesTopo.forEach(notesCachees);
    gsap.set(voie, { strokeDasharray: `0 ${L}` });
    ScrollTrigger.create({
      trigger: topo, start: 'top 70%', once: true,
      onEnter: () => {
        const etat = { t: 0.24 };
        gsap.timeline()
          .to(voie, { strokeDasharray: `${L} 0`, duration: 1.2, ease: 'power2.inOut', onComplete: () => gsap.set(voie, { strokeDasharray: '3 8' }) })
          .to($$('.topo__point, .topo__croix, .topo__nom, .topo__alt', topoSvg), { opacity: 1, duration: 0.5, stagger: 0.08 }, 0.6)
          .to(lampes, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.09, ease: REBOND }, 0.5)
          .to(distraite, { opacity: 1, duration: 0.2 }, 1.1)
          .to(etat, { t: 0.02, duration: 1.4, ease: 'power1.inOut', onUpdate: () => posDistraite(etat.t) }, 1.5)
          .add(() => ecrire(notesTopo[1]), 2.1)
          .to(fleches, { opacity: 1, duration: 0.3 }, 2.2)
          .fromTo(fleches[0], { strokeDashoffset: +fleches[0].dataset.l }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, 2.2)
          .add(() => ecrire(notesTopo[0]), 2.6);
      },
    });
  }

  /* ------------------------------------------------------------------ 9 · Sommet : l'aube */
  const aube = $('[data-aube]');
  const geant = $('.tampon--geant');
  if (!calme) {
    // Le jour se lève sur la photo en même temps que la nuit quitte la page.
    gsap.fromTo('[data-sommet-nuit]', { opacity: 0.92 }, {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: aube, start: 'top 65%', end: 'top -15%', scrub: true },
    });
    gsap.fromTo($('img', aube), { scale: 1.18, yPercent: 6 }, {
      scale: 1, yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: aube, start: 'top bottom', end: 'top top', scrub: true },
    });
  }

  /* ------------------------------------------------------------------ La trace au feutre */
  // Dans chaque section, une ligne pointillée relie les moments ; elle se dessine au défilement.
  let idMasque = 0;
  $$('section[data-trace]').forEach((sec) => {
    const svg = $('svg.trace', sec);
    const chemin = $('.trace__chemin', svg);
    const tete = $('.trace__tete', svg);
    const croix = $('.trace__croix', svg);
    // la croix est placée par un groupe parent ; elle-même ne fait que grandir sur place
    let croixPos = null;
    if (croix) {
      croixPos = document.createElementNS(ns, 'g');
      croix.replaceWith(croixPos);
      croixPos.appendChild(croix);
    }
    const pts = sec.dataset.trace.split(' ').map((c) => c.split(',').map(Number));
    const masqueId = `trace-m-${idMasque++}`;
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `<mask id="${masqueId}" maskUnits="userSpaceOnUse"><path fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/></mask>`;
    svg.prepend(defs);
    const masque = $('path', defs);
    const maskEl = $('mask', defs);
    chemin.setAttribute('mask', `url(#${masqueId})`);
    let longueur = 1;
    let progres = calme ? 1 : 0;

    function construire() {
      const w = sec.offsetWidth, h = sec.offsetHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      maskEl.setAttribute('x', -40); maskEl.setAttribute('y', -40);
      maskEl.setAttribute('width', w + 80); maskEl.setAttribute('height', h + 80);
      const mobile = w < 900;
      let p = pts.map(([x, y]) => [x * w, y * h]);
      // Sur mobile, la trace devient verticale et longe la marge gauche.
      if (mobile) p = p.map(([x, y]) => [6 + (x / w) * 9, y]);
      if ('traceSommet' in sec.dataset && geant) {
        const r = geant.getBoundingClientRect(), s = sec.getBoundingClientRect();
        // la croix du sommet, juste à gauche du tampon qui vient la valider
        p.push([r.left - s.left - 22, r.top - s.top + r.height * 0.7]);
      }
      // Catmull-Rom → courbes de Bézier, avec un léger tremblé de main.
      let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        const tremble = Math.sin(i * 2.7) * 6;
        d += ` C${(c1[0] + tremble).toFixed(1)} ${c1[1].toFixed(1)} ${(c2[0] - tremble).toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      chemin.setAttribute('d', d);
      masque.setAttribute('d', d);
      longueur = chemin.getTotalLength();
      masque.style.strokeDasharray = longueur;
      if (croix) {
        const fin = p[p.length - 1];
        croixPos.setAttribute('transform', `translate(${fin[0].toFixed(1)} ${fin[1].toFixed(1)})`);
      }
      dessiner(progres);
    }
    function dessiner(v) {
      progres = v;
      masque.style.strokeDashoffset = longueur * (1 - v);
      const pt = chemin.getPointAtLength(longueur * v);
      tete.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      tete.style.opacity = v > 0.002 && v < 0.995 ? 1 : 0;
      if (croix && !calme) {
        if (v > 0.97 && !croix.dataset.vue) {
          croix.dataset.vue = 1;
          gsap.fromTo(croix, { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: REBOND, transformOrigin: '50% 50%' });
          poser(geant, 0.15);
        }
      }
    }
    construire();
    if (!calme) {
      const sommet = 'traceSommet' in sec.dataset;
      ScrollTrigger.create({
        trigger: sec,
        start: sommet ? 'top 75%' : 'top 70%',
        end: sommet ? 'top 5%' : 'bottom 70%',
        scrub: 0.5,
        onUpdate: (s) => dessiner(s.progress),
        onRefresh: construire,
      });
    } else {
      addEventListener('resize', construire);
    }
  });

  ScrollTrigger.create({ trigger: '.pied', start: 'top 92%', onToggle: (s) => alti.classList.toggle('est-cache', s.isActive) });

  /* ------------------------------------------------------------------ Altitude au fil des sections */
  if (!calme) {
    $$('section[data-alt]').forEach((sec) => {
      const [a, b] = sec.dataset.alt.split(',').map(Number);
      const sommet = sec.id === 'sommet';
      const premier = sec.id === 'depart';
      ScrollTrigger.create({
        trigger: sec, start: sommet ? 'top 90%' : premier ? 'top top' : 'top 50%', end: sommet ? 'top 5%' : 'bottom 50%',
        onUpdate: (s) => regler(a + (b - a) * s.progress),
        onEnter: (s) => regler(a + (b - a) * s.progress),
        onEnterBack: (s) => regler(a + (b - a) * s.progress),
      });
    });
    // L'altimètre et sa plaque arrivent avec un petit balancement.
    gsap.from(alti, { y: -12, opacity: 0, duration: 0.9, delay: 1.2, ease: EASE, clearProps: 'opacity,transform' });
  } else {
    majPlaque(4102);
  }

  // Les polices et les images modifient les hauteurs : on recalcule une fois tout chargé.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
  html.classList.add('pret');
}
