# Jagdgeschwader Richthofen 1916–1918

Animierte Karte der Stationierungen des Jagdgeschwaders I (Richthofen) und seiner
Jagdstaffeln 4, 6, 10 und 11 von der Aufstellung 1916 bis zur Auflösung im November 1918.

Online: https://kirchnerjan-cell.github.io/richthofen/

## Aufbau

- `index.html` – die komplette Seite; Kartendaten (Ländergrenzen, Frontlinien) sind eingebettet.
  Externe Abhängigkeit sind nur die Schriften von Google Fonts.
- `icons/` – App-Symbol für den Home-Bildschirm (`apple-touch-icon.png`), PNG-Symbole 192/512 px,
  SVG-Varianten.
- `personen.html` – zweite Seite: Personenregister (19 Personen) und Chronologie, nach Jahren aufklappbar; Filter nach Person und Art (Direktlink z. B. `personen.html#voss`).
- `tod.html` – dritte Seite: Zeitleiste des 21. April 1918 (Richthofens letzter Flug) mit Belegstatus je Aussage, Thesen zum tödlichen Schuss und Quellenliste.
- `manifest.webmanifest` – Web-App-Manifest, damit die Seite vom Home-Bildschirm als App öffnet.

## Veröffentlichung

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Daten

Quellen und nicht belegte Angaben sind auf der Seite selbst ausgewiesen (Abschnitt unter der Karte).
Frontlinien und die Grenze Elsass-Lothringens sind schematisch.
