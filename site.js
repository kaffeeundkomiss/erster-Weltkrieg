/* Gemeinsame Funktionen aller Seiten:
   1. Glossar: erklärt Fachbegriffe beim ersten Vorkommen je Seite per Antippen (funktioniert ohne Hover, also auch am Handy).
   2. Kontextzeile auf Seiten ohne Einführungskasten.
   3. Belege in Ablaufkarten und Zahlenkästen einklappbar machen (Inhalt zuerst). */
(() => {
"use strict";

// Quellen der Glossar-Erklärungen. Alle am 06.11.2026 abgerufen; „Suchauszug“ = nur der Auszug in der Suchergebnisliste gelesen.
const GSRC = {
  g1: ["LeMO (Deutsches Historisches Museum): Der Stellungskrieg", "https://www.dhm.de/lemo/kapitel/erster-weltkrieg/kriegsverlauf/stellungskrieg"],
  g2: ["Wikipedia (de): Westfront (Erster Weltkrieg), Suchauszug", "https://de.wikipedia.org/wiki/Westfront_(Erster_Weltkrieg)"],
  g3: ["Wikipedia (en): Royal Flying Corps, Suchauszug", "https://en.wikipedia.org/wiki/Royal_Flying_Corps"],
  g4: ["History.com: RAF founded, April 1, 1918, Suchauszug", "https://www.history.com/this-day-in-history/april-1/raf-founded"],
  g5: ["Wikipedia (en): Manfred von Richthofen, Suchauszug", "https://en.wikipedia.org/wiki/Manfred_von_Richthofen"],
  g6: ["RAF Museum: The Fall of the Red Baron, Suchauszug", "https://collections.rafmuseum.org.uk/story/the-fall-of-the-red-baron/"],
  g7: ["Wikipedia (de): Pour le Mérite, Suchauszug", "https://de.wikipedia.org/wiki/Pour_le_M%C3%A9rite"],
  g8: ["LeMO (Deutsches Historisches Museum): Der Orden Pour le Mérite, Suchauszug", "https://www.dhm.de/lemo/kapitel/kaiserreich/innenpolitik/der-orden-pour-le-merite"],
  g9: ["Brockhaus: Rittmeister, Suchauszug", "https://brockhaus.de/ecs/enzy/article/rittmeister"],
  g10: ["Wikipedia (de): Rittmeister, Suchauszug", "https://de.wikipedia.org/wiki/Rittmeister"],
  g11: ["1914-1918-online: Oberste Heeresleitung (OHL), Suchauszug", "https://encyclopedia.1914-1918-online.net/article/oberste-heeresleitung-ohl/"],
  g12: ["Wikipedia (de): Erich Ludendorff, Suchauszug", "https://de.wikipedia.org/wiki/Erich_Ludendorff"],
  g13: ["Wikipedia (en): Victoria Cross, Suchauszug", "https://en.wikipedia.org/wiki/Victoria_Cross"],
  g14: ["National Army Museum: The Victoria Cross, Suchauszug", "https://www.nam.ac.uk/explore/victoria-cross"],
  g15: ["Wikipedia (de): Luftstreitkräfte (Deutsches Kaiserreich), Suchauszug", "https://de.wikipedia.org/wiki/Luftstreitkr%C3%A4fte_(Deutsches_Kaiserreich)"],
  g16: ["Wikipedia (en): Jagdstaffel, Suchauszug", "https://en.wikipedia.org/wiki/Jagdstaffel"],
  g17: ["The Aerodrome Forum: What was there before Jastas?, Suchauszug", "https://theaerodrome.com/forum/threads/what-was-there-before-jastas.36042/"],
  web: ["Angaben dieser Website (Karte und Ereignisseiten mit eigenen Quellen)", "quellen-karte.html"]
};

// Begriffe. re = Suchmuster im Text; src = Belege (leer = reine Worterklärung ohne Einzelbeleg).
const GLOSSAR = [
  { id: "westfront", t: "Westfront", re: "Westfront", src: ["g1", "g2"],
    d: "Im Ersten Weltkrieg (1914–1918) die Frontlinie in Belgien und Frankreich. Ab Herbst 1914 standen sich dort deutsche Truppen und die Alliierten in Stellungen gegenüber, von der belgischen Küste bis zur Schweizer Grenze." },
  { id: "alliierte", t: "Alliierte", re: "Alliierte[nr]?|alliierte[nr]?", src: [],
    d: "Die Kriegsgegner Deutschlands. An der Westfront vor allem Frankreich, Großbritannien mit Truppen aus Kanada, Australien und anderen Teilen des Empire sowie Belgien." },
  { id: "roterbaron", t: "Roter Baron", re: "Roten? Baron", src: ["g5", "g6"],
    d: "Beiname Manfred von Richthofens (1892–1918). Er ließ sein Flugzeug rot anstreichen und trug den Adelstitel Freiherr. Mit 80 anerkannten Luftsiegen gilt er als erfolgreichster Jagdflieger des Ersten Weltkriegs." },
  { id: "jasta", t: "Jasta (Jagdstaffel)", re: "Jastas?|Jagdstaffel(?:n)?", src: ["g15", "g16"],
    d: "Abkürzung für Jagdstaffel: eine deutsche Fliegereinheit mit Jagdflugzeugen, die gegnerische Flugzeuge angreifen sollte. Die ersten Jagdstaffeln entstanden 1916. Die Nummer unterscheidet die Staffeln, etwa Jasta 11." },
  { id: "jg", t: "JG I (Jagdgeschwader I)", re: "JG I|Jagdgeschwader(?:s)?", src: ["web"],
    d: "Zusammenschluss der Jagdstaffeln 4, 6, 10 und 11 ab Juni 1917 unter einem gemeinsamen Kommandeur, zuerst Manfred von Richthofen. Ab Mai 1918 hieß es „Jagdgeschwader Freiherr von Richthofen Nr. 1“." },
  { id: "fuehrer", t: "Führer, Kommandeur", re: "Führer|Kommandeur", src: [],
    d: "Hier militärische Funktionen: Der Führer (Staffelführer) leitet eine Jagdstaffel, der Kommandeur das ganze Jagdgeschwader. Bei britischen Einheiten heißt der Leiter einer Squadron ebenfalls Kommandeur." },
  { id: "stab", t: "Geschwaderstab", re: "Geschwaderstab(?:s)?", src: [],
    d: "Die Führung des Jagdgeschwaders: der Kommandeur und seine Mitarbeiter, etwa der Adjutant. Auf der Karte zeigt die rote Linie, wo der Stab lag." },
  { id: "luftsieg", t: "Luftsieg", re: "Luftsiege?n?", src: ["web"],
    d: "Ein Abschuss, den die eigene Seite offiziell anerkannt hat. Die Zahlen sind Angaben der jeweiligen Seite und nicht mit den Verlusten der Gegenseite abgeglichen." },
  { id: "rfc", t: "RFC (Royal Flying Corps)", re: "RFC|Royal Flying Corps", src: ["g3", "g4"],
    d: "Die britische Fliegertruppe des Heeres. Am 1. April 1918 wurde sie mit den Marinefliegern (RNAS) zur Royal Air Force (RAF) zusammengelegt." },
  { id: "raf", t: "RAF (Royal Air Force)", re: "RAF|Royal Air Force", src: ["g3", "g4"],
    d: "Die britische Luftwaffe, gegründet am 1. April 1918 aus dem Royal Flying Corps (RFC) und den Marinefliegern (RNAS)." },
  { id: "afc", t: "AFC (Australian Flying Corps)", re: "AFC|Australian Flying Corps", src: [],
    d: "Die Fliegertruppe Australiens im Ersten Weltkrieg. Australien kämpfte als Teil des britischen Empire auf Seiten der Alliierten." },
  { id: "squadron", t: "Squadron", re: "Squadron", src: [],
    d: "Englisch für Staffel: eine britische (oder australische) Fliegereinheit, vergleichbar einer deutschen Staffel. „No. 24 Squadron“ heißt Staffel Nr. 24." },
  { id: "kette", t: "Kette", re: "Ketten?", src: [],
    d: "Eine kleine Gruppe von Flugzeugen innerhalb einer Staffel, die gemeinsam fliegt und von einem Piloten geführt wird." },
  { id: "dreidecker", t: "Dreidecker", re: "Dreidecker[ns]?", src: ["web"],
    d: "Flugzeug mit drei übereinander liegenden Tragflächen. Richthofen flog zuletzt einen Fokker-Dreidecker (Typ Dr.I)." },
  { id: "rittmeister", t: "Rittmeister", re: "Rittmeister", src: ["g9", "g10"],
    d: "Offiziersdienstgrad der Kavallerie, entspricht dem Hauptmann." },
  { id: "plm", t: "Pour le Mérite", re: "Pour le Mérite", src: ["g7", "g8"],
    d: "Die höchste Tapferkeitsauszeichnung, die der König von Preußen an Offiziere verlieh. Im Ersten Weltkrieg erhielten ihn auch viele Jagdflieger, darunter Richthofen." },
  { id: "vc", t: "VC (Victoria Cross)", re: "VC|Victoria Cross", src: ["g13", "g14"],
    d: "Die höchste britische Auszeichnung für Tapferkeit." },
  { id: "gqm", t: "Erster Generalquartiermeister", re: "Generalquartiermeister", src: ["g11", "g12"],
    d: "Erich Ludendorffs Amt ab 1916. Als Stellvertreter Paul von Hindenburgs lenkte er mit ihm die Oberste Heeresleitung (OHL), also die deutsche Kriegführung." },
  { id: "kek", t: "Kampfeinsitzerkommando (KEK)", re: "Kampfeinsitzerkommando(?:s)?|KEK", src: ["g15", "g17"],
    d: "Kleine deutsche Gruppe einsitziger Kampfflugzeuge vor der Einführung der Jagdstaffeln. Aus solchen Gruppen gingen 1916 Jagdstaffeln hervor, etwa die Jasta 4 aus dem Kommando Vaux." },
  { id: "fokkerstaffel", t: "Fokkerstaffel", re: "Fokkerstaffel", src: ["g17"],
    d: "Frühe deutsche Gruppe von Fokker-Eindeckern (Flugzeuge mit einer Tragfläche). Wie die Kampfeinsitzerkommandos ein Vorläufer der Jagdstaffeln." },
  { id: "ffa", t: "Feldfliegerabteilung", re: "Feldfliegerabteilung", src: [],
    d: "Deutsche Fliegereinheit, die vor allem aufklärte, also gegnerische Stellungen aus der Luft erkundete." },
  { id: "flugpark", t: "Armee-Flugpark", re: "Armee-Flugpark(?:s)?", src: [],
    d: "Lager und Werkstatt einer Armee für Flugzeuge, Ersatzteile und Ersatzpersonal." },
  { id: "artbeob", t: "Artilleriebeobachtung", re: "Artilleriebeobachtung", src: [],
    d: "Flieger beobachten, wo die Granaten der eigenen Geschütze einschlagen, und melden Korrekturen, damit die Artillerie ihr Ziel trifft." },
  { id: "offensiv", t: "Offensivdoktrin", re: "Offensivdoktrin", src: ["web"],
    d: "Grundsatz der britischen Fliegerführung unter Trenchard: ständig angreifen, auch über den deutschen Linien, statt nur die eigenen Linien zu schützen." },
  { id: "mg", t: "MG, Vickers, Lewis", re: "Vickers|Lewis-MGs?|MGs?", src: [],
    d: "MG steht für Maschinengewehr. Vickers und Lewis sind zwei britische Maschinengewehr-Typen; das leichtere Lewis-MG wurde auch gegen Flugzeuge eingesetzt." },
  { id: "flak", t: "Flak", re: "Flak", src: [],
    d: "Kurz für Flugabwehrkanone, allgemein Waffen zur Abwehr von Flugzeugen. Auf der Seite zum 21.04.1918 sind Maschinengewehre gemeint, die gegen Flugzeuge feuerten." },
  { id: "kaliber", t: "Kaliber .303", re: "Kaliber \\.303|\\.303", src: ["web"],
    d: "Britische Standardmunition für Gewehre und Maschinengewehre: 0,303 Zoll, umgerechnet etwa 7,7 mm." },
  { id: "dienstgrade", t: "Lt., Capt., Sgt., Gnr.", re: "(?:Lt|Capt|Sgt|Gnr)\\.", src: [],
    d: "Britische Dienstgrade: Lt. = Lieutenant (Leutnant), Capt. = Captain (Hauptmann), Sgt. = Sergeant (Unteroffizier), Gnr. = Gunner (Kanonier, Soldat der Artillerie)." }
];
window.GLOSSAR = GLOSSAR; window.GSRC = GSRC;

const BY_ID = Object.fromEntries(GLOSSAR.map(g => [g.id, g]));
let RX = null;
try {
  RX = new RegExp("(?<![\\p{L}\\p{N}])(" + GLOSSAR.map(g => "(?<" + g.id + ">" + g.re + ")").join("|") + ")(?![\\p{L}\\p{N}])", "gu");
} catch (e) { RX = null; } // sehr alte Browser ohne Lookbehind: keine Markierung, Seite bleibt lesbar

// Bereiche, in denen nichts markiert wird
const SKIP = "script,style,svg,a,button,select,label,summary,h1,h2,h3,nav,.b,.chip,.uchip,.bel,.legend,.count,.t,.day,.eyebrow,.ruler,.nowdate,ol.srcs,ol.srclist,.sources,.src,.glpop,.glnone,thead,.dates,.num";

function markIn(root, used, excl) {
  if (!RX || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p || p.closest(SKIP) || p.closest("[hidden]")) return NodeFilter.FILTER_REJECT;
      if (excl && p.closest(excl)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    const text = node.nodeValue; RX.lastIndex = 0;
    let m, last = 0, frag = null;
    while ((m = RX.exec(text))) {
      const id = Object.keys(m.groups).find(k => m.groups[k] !== undefined);
      if (!id || used.has(id)) continue;
      used.add(id);
      frag = frag || document.createDocumentFragment();
      frag.append(text.slice(last, m.index));
      const b = document.createElement("button");
      b.type = "button"; b.className = "gl"; b.dataset.g = id; b.textContent = m[0];
      b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-haspopup", "dialog");
      frag.append(b); last = m.index + m[0].length;
    }
    if (frag) { frag.append(text.slice(last)); node.replaceWith(frag); }
  }
}

// Erklärfeld
let pop = null, popFor = null;
function closePop(focusBack) {
  if (!pop) return;
  pop.remove(); pop = null;
  if (popFor) { popFor.setAttribute("aria-expanded", "false"); if (focusBack) popFor.focus(); }
  popFor = null;
}
function openPop(btn) {
  const g = BY_ID[btn.dataset.g]; if (!g) return;
  closePop(false);
  pop = document.createElement("div");
  pop.className = "glpop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", g.t);
  const onGlossar = /glossar\.html$/.test(location.pathname);
  pop.innerHTML = `<b></b><p></p><span class="glmore">${onGlossar ? "" : `<a href="glossar.html#${g.id}">Alle Begriffe im Glossar</a>`}</span><button type="button" class="glx" aria-label="Schließen">×</button>`;
  pop.querySelector("b").textContent = g.t;
  pop.querySelector("p").textContent = g.d;
  document.body.appendChild(pop);
  const r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  let x = r.left + scrollX, y = r.bottom + scrollY + 6;
  x = Math.max(scrollX + 16, Math.min(x, scrollX + document.documentElement.clientWidth - w - 16));
  if (r.bottom + h + 12 > innerHeight && r.top - h - 6 > 0) y = r.top + scrollY - h - 6;
  pop.style.left = x + "px"; pop.style.top = y + "px";
  btn.setAttribute("aria-expanded", "true"); popFor = btn;
  pop.querySelector(".glx").addEventListener("click", () => closePop(true));
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("button.gl");
  if (b) { e.preventDefault(); e.stopPropagation(); if (popFor === b) closePop(false); else openPop(b); return; }
  if (pop && !pop.contains(e.target)) closePop(false);
}, true);
document.addEventListener("keydown", e => { if (e.key === "Escape" && pop) closePop(true); });
addEventListener("resize", () => closePop(false));

// Kontextzeile auf Seiten ohne Einführungskasten
function addContext() {
  if (document.getElementById("intro") || document.querySelector(".ctx")) return;
  const header = document.querySelector("header"); if (!header) return;
  const navs = header.querySelectorAll("nav"); const after = navs[navs.length - 1]; if (!after) return;
  const p = document.createElement("p"); p.className = "ctx";
  p.innerHTML = 'Erster Weltkrieg, Westfront 1916–1918. Neu im Thema? <a href="index.html#intro">Worum es geht</a> · <a href="glossar.html">Glossar</a>';
  after.after(p);
}

// Belege einklappen: Inhalt zuerst, Belegstatus und Quellen auf Wunsch
const ORDER = ["wid", "one", "part", "ok"];
function foldEvidence() {
  const boxes = document.querySelectorAll(".card, .stat");
  let count = 0;
  boxes.forEach(box => {
    const items = [...box.children].filter(c => c.matches(".meta, .why"));
    if (!items.length) return;
    const d = document.createElement("details"); d.className = "belege";
    const s = document.createElement("summary");
    s.append("Belege");
    const kinds = new Set();
    items.forEach(it => it.querySelectorAll(".b").forEach(b => ORDER.forEach(k => b.classList.contains(k) && kinds.add(k))));
    ORDER.filter(k => kinds.has(k)).forEach(k => {
      const src = items.map(it => it.querySelector(".b." + k)).find(Boolean);
      const c = src.cloneNode(true); c.setAttribute("aria-hidden", "false"); s.append(c);
    });
    const inner = document.createElement("div"); inner.className = "belin";
    items.forEach(it => inner.appendChild(it));
    d.append(s, inner); box.appendChild(d); count++;
  });
  if (!count) return;
  // Legende „Belegstatus“ einklappen
  const st = document.getElementById("stH");
  if (st) {
    const sec = st.closest("section");
    const d = document.createElement("details"); d.className = "statuslegend";
    const s = document.createElement("summary"); s.textContent = "Wie die Aussagen belegt sind";
    d.appendChild(s);
    [...sec.children].filter(c => c !== st).forEach(c => d.appendChild(c));
    st.remove(); sec.appendChild(d);
    sec.removeAttribute("aria-labelledby"); sec.setAttribute("aria-label", "Belegstatus");
  }
  // Schalter „Alle Belege zeigen“ am Ablauf
  const tl = document.getElementById("tlH");
  if (tl) {
    const head = document.createElement("div"); head.className = "belhead";
    tl.replaceWith(head); head.appendChild(tl);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "beltoggle";
    btn.textContent = "Alle Belege zeigen"; btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      document.querySelectorAll("details.belege").forEach(x => x.open = on);
      btn.setAttribute("aria-pressed", String(on)); btn.textContent = on ? "Belege ausblenden" : "Alle Belege zeigen";
    });
    head.appendChild(btn);
  }
  // Sprung zu einem Beleg: zugehöriges Feld öffnen
  const openFor = () => { const t = location.hash && document.getElementById(location.hash.slice(1)); const d = t && t.closest("details"); if (d) d.open = true; };
  addEventListener("hashchange", openFor); openFor();
}

function init() {
  addContext();
  foldEvidence();
  const wrap = document.querySelector(".wrap") || document.body;
  // Kartenpanel und dynamische Listen werden neu gefüllt: dort bei jeder Änderung neu markieren
  const panel = document.getElementById("panel");
  markIn(wrap, new Set(), "#panel, [data-gl-dynamic]");
  const dyn = [...document.querySelectorAll("[data-gl-dynamic]")];
  if (panel) dyn.push(panel);
  dyn.forEach(el => {
    const run = () => { mo.disconnect(); markIn(el, new Set()); mo.observe(el, { childList: true, subtree: true }); };
    const mo = new MutationObserver(() => { clearTimeout(run.t); run.t = setTimeout(run, 30); });
    run();
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
