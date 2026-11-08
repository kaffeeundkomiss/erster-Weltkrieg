# Jagdgeschwader Richthofen 1916–1918

Animierte Karte der Stationierungen des Jagdgeschwaders I (Richthofen) und seiner
Jagdstaffeln 4, 6, 10 und 11 von der Aufstellung 1916 bis zur Auflösung im November 1918.

Online: https://kaffeeundkommiss.github.io/erster-Weltkrieg/

## Aufbau

- `index.html` – die komplette Seite; Kartendaten (Ländergrenzen, Frontlinien) sind eingebettet.
  Externe Abhängigkeit sind nur die Schriften von Google Fonts.
- `icons/` – App-Symbol für den Home-Bildschirm (`apple-touch-icon.png`), PNG-Symbole 192/512 px,
  SVG-Varianten.
- `personen.html` – zweite Seite: Personenregister (19 Personen) und Chronologie, nach Jahren aufklappbar; Filter nach Person und Art (Direktlink z. B. `personen.html#voss`).
- `boelcke1916.html` – Seite zu Oswald Boelckes Tod am 28.10.1916: Zeitleiste, Augenzeugen, je Aussage mit Belegstatus.
- `april1917.html` – Seite zum „Blutigen April“ 1917 bei Arras: Zahlen, Zeitleiste, Deutungen, je Aussage mit Belegstatus.
- `tod.html` – dritte Seite: Zeitleiste des 21. April 1918 (Richthofens letzter Flug) mit Belegstatus je Aussage, Thesen zum tödlichen Schuss und Quellenliste.
- `glossar.html` – Glossar der Fachbegriffe und Abkürzungen mit Belegen; die Einträge stehen in `site.js`.
- `quellen-*.html` – je Seite eine eigene Quellenseite (Karte, Personen, drei Ereignisseiten, Glossar), erreichbar über die Schaltfläche „Quellen“ am Seitenende; Verweise im Text (S1, A1, B1, [n]) springen dorthin. Die Quellenliste der Karte steht in `quellen-karte.js`.
- `site.js`, `site.css` – gemeinsame Bausteine aller Seiten: antippbare Begriffserklärungen beim ersten Vorkommen je Seite,
  Kontextzeile für Einsteiger, einklappbare Belege in den Ablaufkarten der Ereignisseiten.
- `manifest.webmanifest` – Web-App-Manifest, damit die Seite vom Home-Bildschirm als App öffnet.

## Veröffentlichung

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Daten

Nicht belegte Angaben sind auf der Seite selbst ausgewiesen; das Quellenverzeichnis steht auf `quellen-karte.html`.
Frontlinien und die Grenze Elsass-Lothringens sind schematisch.
